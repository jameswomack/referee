import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from './index.mjs';


function __getCode__(filePath = '') {
  // import code from a fixture file
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const fixturePath = path.join(__dirname, filePath);
  return fs.readFileSync(fixturePath, 'utf-8');
}


test('parse function (externalDeclarations)', () => {
  const code = __getCode__('fixture.mjs');

  const parseResult = parse(code);
  
  const externalDeclarations = parseResult.externalObjects;
  const externalMethodCallMap = parseResult.externalMethodCallMap;

  function getMethodCallReport() {
    const out = [];
    for (const [object, methods] of externalMethodCallMap.entries()) {
      for (const [method, count] of methods.entries()) {
        out.push({ object, method, count });
      }
    }
    return out;
  }

  const methodCallReport = getMethodCallReport();
  console.log('\nThe external method call report consists of: ', methodCallReport, '\n');
  
  assert.ok(methodCallReport.length > 0, 'The external method call report should not be empty');
  assert.equal(methodCallReport.find((item) => item.object === 'console' && item.method === 'log').count, 4, 'The console.log method should be called 4 times');

  assert.equal(methodCallReport.find((item) => item.object === 'sn_glider_ide.language.ScopedCodeEvaluator' && item.method === 'evaluate').count, 1, 'The sn_glider_ide.language.ScopedCodeEvaluator.evaluate method should be called 1 time');
  
  assert.equal(methodCallReport.find((item) => item.object === 'MyClass'), null, 'The MyClass methods should not be surfaced');


  console.log('\nThe external declarations consist of: ', externalDeclarations, '\n');

  // Going from least specific to most specific with the assertions

  // Check if the external declarations \is the correct type
  assert.ok(Array.isArray(externalDeclarations), 'The external declarations should be an array');
  assert.ok(externalDeclarations.length > 0, 'The external declarations array should not be empty');

  // Check if the external declarations include specific identifiers, each of which represent a specific type of identifier
  assert.ok(externalDeclarations.includes('axios'), 'The external declarations should include "axios", which is a library');
  assert.ok(externalDeclarations.includes('MyOtherClass'), 'The external declarations should include "MyOtherClass", which is a class');
  assert.ok(externalDeclarations.includes('sn_glider_ide.language.ScopedCodeEvaluator'), 'The external declarations should include "sn_glider_ide.language.ScopedCodeEvaluator", which is a class with dot syntax');
  assert.ok(externalDeclarations.includes('console'), 'The external declarations should include "console", which is a global object');
  assert.ok(externalDeclarations.includes('navigator.geolocation'), 'The external declarations should include "navigator.geolocation", which is a global object with dot syntax');
  
  // Check all external declarations
  assert.deepEqual(externalDeclarations, [
    'axios',
    'console',
    'document',
    'window',
    'navigator.geolocation',
    'window.location',
    'MyOtherClass',
    'sn_glider_ide.language.ScopedCodeEvaluator'
  ]);
});