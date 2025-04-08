#!/usr/bin/env node

import { build } from 'esbuild';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* eslint-disable no-console */

// Ensure dist directory exists
try {
  await mkdir(resolve(__dirname, 'dist'), { recursive: true });
  console.log('✓ Ensured dist directory exists');
} catch (error) {
  console.error('Error creating dist directory:', error);
  process.exit(1);
}

// Common build options
const commonOptions = {
  entryPoints: ['index.mjs'],
  bundle: true,
  sourcemap: true,
  minify: true,
  target: ['es2020'],
  logLevel: 'info',
  platform: 'browser',
  format: 'esm',
};

// Build ESM version
try {
  await build({
    ...commonOptions,
    format: 'esm',
    outfile: 'dist/referee.esm.js',
  });
  console.log('✓ ESM build complete: dist/referee.esm.js');
} catch (error) {
  console.error('Error building ESM bundle:', error);
  process.exit(1);
}

// Build UMD/IIFE version
try {
  await build({
    ...commonOptions,
    format: 'iife',
    globalName: 'Referee',
    outfile: 'dist/referee.umd.js',
  });
  console.log('✓ UMD build complete: dist/referee.umd.js');
} catch (error) {
  console.error('Error building UMD bundle:', error);
  process.exit(1);
}

console.log('✓ All builds completed successfully!');

/* eslint-enable no-console */

