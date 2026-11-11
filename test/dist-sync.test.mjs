import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Keep this list identical to HASHED_SOURCES in scripts/build-browser.mjs.
const SOURCES = ['src/consent-init.js', 'src/banner-runtime.ts', 'src/run-options.ts', 'src/theme.css'];
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url));

test('dist was built from the current sources (run npm run build)', () => {
  const hash = createHash('sha256');
  for (const file of SOURCES) hash.update(read(file));
  assert.equal(hash.digest('hex'), read('dist/source-hash.txt').toString('utf8').trim());
});

test('dist/consent-init.js is byte-identical to src/consent-init.js', () => {
  assert.ok(read('dist/consent-init.js').equals(read('src/consent-init.js')));
});
