// defined require for ESM using createRequire
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const acornLoose = require("acorn-loose");
const walk = require("acorn-walk");

function timedFn (fn) {
  return function (...args) {
    const start = process.hrtime.bigint();
    const result = fn(...args);
    const end = process.hrtime.bigint();
    const duration = (end - start) / BigInt(1e3); // Convert to microseconds
    /* eslint-disable no-console */
    if (duration > 1000) {
      console.info(`\`${fn.name}\` *${duration / BigInt(1e3)}* milliseconds`);
    } else if (duration < 1) {
      console.info(`\`${fn.name}\` *${end - start}* nanoseconds`);
    } else {
      console.info(`\`${fn.name}\` *${duration}* microseconds`);
    }
    /* eslint-enable no-console */
    return result;
  };
}

// Given source code string
function findExternalMethodCallTargets(sourceCode) {
  const timedAcornLooseParse = timedFn(acornLoose.parse.bind(acornLoose));
  const ast = timedAcornLooseParse(sourceCode, { 
    ecmaVersion: "latest", 
    sourceType: "module",
    checkPrivateFields: false,
  });

  // ---[ New Branch: Track external objects and method names with call frequency ]---
  const externalMethodCallMap = new Map(); // Map<string, Map<string, number>>

  function incrementMethodCall(objectPath, methodName) {
    if (!externalMethodCallMap.has(objectPath)) {
      externalMethodCallMap.set(objectPath, new Map());
    }
    const methods = externalMethodCallMap.get(objectPath);
    methods.set(methodName, (methods.get(methodName) || 0) + 1);
  }

  const functionParamBindings = new Set();
  
  const localBindings = new Set();
  const maybeAddToLocalBindings = (node) => node && node.id && localBindings.add(node.id.name)

  // Track all identifiers that are passed as arguments to a function
  const argumentIdentifiers = new Set();

  // Helper: Get the root identifier of a full identifier (e.g. `navigator.geolocation` -> `navigator`)
  // This is used to identify the root object of a method call
  const getRootIdentifier = (fullIdentifier) => fullIdentifier.split(".")[0];

  const is = (node, type) => node && type && node.type === type;
  const isIdentifier = (node) => is(node, "Identifier");
  const isMemberExpression = (node) => is(node, "MemberExpression");
  const isNewExpression = (node) => is(node, "NewExpression");
  const isCalleeMemberExpression = (node) => isMemberExpression(node.callee);

  const addEachIfIdentifier = (nodes, set) => {
    for (const n of nodes) {
      if (isIdentifier(n)) {
        set.add(n.name);
      }
    }
  };

  const addFunctionParamBindings = (node) => addEachIfIdentifier(node.params, functionParamBindings);

  // Pass 1: Collect local and parameter bindings
  const walkAncestor = timedFn(walk.ancestor.bind(walk));
  walkAncestor(ast, {
    VariableDeclarator(node) {
      isIdentifier(node.id) && localBindings.add(node.id.name);
    },
    FunctionDeclaration(node) {
      maybeAddToLocalBindings(node);
      addFunctionParamBindings(node);
    },
    FunctionExpression(node) {
      addFunctionParamBindings(node);
    },
    ArrowFunctionExpression(node) {
      addFunctionParamBindings(node);
    },
    ClassDeclaration(node) {
      maybeAddToLocalBindings(node);
    },
    CallExpression(node) {
      addEachIfIdentifier(node.arguments, argumentIdentifiers);
    }
  });

  const allLocalIdentifiersAndBindings = new Set([...localBindings, ...functionParamBindings, ...argumentIdentifiers]);
  const isLocal = (name) => name && allLocalIdentifiersAndBindings.has(name);
  const isExternal = (name) => name && !isLocal(name);

  // Pass 2: Identify method calls on external objects
  const externalTargets = new Set();
  const maybeAddToExternalTargets = (name) => isExternal(name) && externalTargets.add(name)

  // 🔍 Helper: reconstruct full object expression (e.g. `navigator.geolocation`)
  function reconstructObjectExpression(expressionNode) {
    const parts = [];
    while (isMemberExpression(expressionNode) && !expressionNode.computed) {
      if (expressionNode.property.type === "Identifier") {
        parts.unshift(expressionNode.property.name);
      }
      expressionNode = expressionNode.object;
    }
    if (isIdentifier(expressionNode)) {
      parts.unshift(expressionNode.name);
    }
    return parts.join(".");
  }
  const timedReconstructObjectExpression = timedFn(reconstructObjectExpression.bind(this));

  const timedWalkSimple = timedFn(walk.simple.bind(walk));

  // Pass 2: Walk to collect external method call targets
  timedWalkSimple(ast, { // This simple walk is the most expensive of the three
    CallExpression(node) {
      if (isCalleeMemberExpression(node)) {
        const fullChain = timedReconstructObjectExpression(node.callee);
        const parts = fullChain.split(".");
        if (parts.length > 1) {
          const methodName = parts.pop();
          const targetObject = parts.join(".");
          const rootIdentifier = parts[0];
          if (!allLocalIdentifiersAndBindings.has(rootIdentifier)) {
            externalTargets.add(targetObject);
            incrementMethodCall(targetObject, methodName);
          }
        }
      }
    }
  });

  // ---[ Handle instances created from external classes and track their method usage ]---

  const instanceToClassMap = new Map(); // instanceName -> className

  // Pass 3a: Track instances created via `new SomeClass()` and their constructor name
  timedWalkSimple(ast, {
    VariableDeclarator(node) {
      if (!isNewExpression(node.init)) return;

      const instanceName = node.id.name;

      if (
        node.init.callee.type === "Identifier" &&
        node.id.type === "Identifier"
      ) {
        const className = node.init.callee.name;
        instanceToClassMap.set(instanceName, className);
      }
      // ---[ Enhancement: support constructors as MemberExpressions like sn_glider_ide.language.Foo ]---

      if (
        isCalleeMemberExpression(node.init) 
      ) {
        const constructorPath = timedReconstructObjectExpression(node.init.callee);
        if (!allLocalIdentifiersAndBindings.has(getRootIdentifier(constructorPath))) {
          instanceToClassMap.set(instanceName, constructorPath);
        }
      }
    }
  });

  // Pass 3b: For method calls on those instances, check if the constructor is external
  timedWalkSimple(ast, {
    CallExpression(node) {
      if (isCalleeMemberExpression(node)) {
        const obj = node.callee.object;
        const method = node.callee.property;

        if (isIdentifier(obj)) {
          const instanceName = obj.name;
          const constructor = instanceToClassMap.get(instanceName);
          maybeAddToExternalTargets(constructor);

          // ---[ NEW: Track method call on external constructor instances ]---
          if (constructor && isIdentifier(method) && isExternal(constructor)) {
            incrementMethodCall(constructor, method.name);
          }
        }
      }
    }
  });


  return {
    externalObjects: Array.from(externalTargets),
    externalMethodCallMap
  };
}


export { findExternalMethodCallTargets as parse };
