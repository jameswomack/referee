// @ts-nocheck
import axios from 'axios';
const x = new MyClass();
const y = document;
const z = { hello() {} };
y.querySelector('div');
axios.get('/data');
x.run();
z.hello();
// test-incomplete.js

// Global access
console.log("Hello");
document.querySelector("#id");
window.addEventListener("load", () => {});

// Local declaration
const localVar = 42;
let another = localVar.toString();

// Function and class declarations
function greet(name) {
  return name.toUpperCase();
}

class MyClass {
  constructor() {
    this.value = 10;
  }

  methodA() {
    return this.value;
  }
}

const instance = new MyClass();
instance.methodA();

const instance2 = new MyOtherClass();
instance2.methodB();

const scopedCodeEvaluator = new sn_glider_ide.language.ScopedCodeEvaluator({
  code: "console.log('Hello')",
  scope: { console },
  globals: { window, document },
  application: { name: "MyApp", id: 123 },
  onError: (error) => {
    console.error("Error:", error);
  },
  onSuccess: (result) => {
    console.log("Result:", result);
  },
  onComplete: () => {
    console.log("Evaluation complete");
  },
});
scopedCodeEvaluator.evaluate();

// Partial/unfinished lines simulating typing
navigator.geolocation.getCurrentPosition()
setTimeout(() => console.log("done"), 1000);
fetch("/api/data").then(r => r.json()).then( // incomplete
window.location.toString();
// Incomplete code (document):
docu