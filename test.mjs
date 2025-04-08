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

  // Time the parse function
  const start = process.hrtime.bigint();
  const externalDeclarations = parse(code);
  const end = process.hrtime.bigint();
  const duration = (end - start) / BigInt(1e6); // Convert to milliseconds
  console.log(`The \`parse\` function took ${duration} milliseconds`);

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