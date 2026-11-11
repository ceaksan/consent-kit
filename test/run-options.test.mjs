import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';

// Node strips the types but does not guess the .ts extension the source omits.
registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (error) {
      if (specifier.startsWith('.') && !specifier.endsWith('.ts')) return next(`${specifier}.ts`, context);
      throw error;
    }
  },
});

const { runOptions } = await import('../src/run-options.ts');

const copy = {
  banner: { title: 't', description: 'd', acceptAll: 'a', acceptNecessary: 'n', showPreferences: 'p' },
  preferences: {
    title: 't', acceptAll: 'a', acceptNecessary: 'n', savePreferences: 's', close: 'c',
    serviceCounterLabel: 'x', intro: { title: 'i', description: 'i' },
    necessary: { title: 'n', description: 'n' }, analytics: { title: 'a', description: 'a' },
    table: { name: 'n', domain: 'd', expiration: 'e', description: 'd' },
  },
};
const ga = {
  name: '_ga',
  pattern: { source: '^_ga$', flags: '' },
  vendor: 'Google Analytics 4',
  domain: '.ceaksan.com',
  duration: { amount: 2, unit: 'year' },
};
const config = (extra = {}) => ({
  lang: 'en', policyUrl: '/p', policyLabel: 'P', darkClass: 'dark', ...copy, cookies: [ga], ...extra,
});

test('cookieDomain becomes the consent cookie domain', () => {
  const options = runOptions(config({ cookieDomain: 'ceaksan.com' }), {});
  assert.equal(options.cookie?.domain, 'ceaksan.com');
});

test('without cookieDomain the library default stays in charge', () => {
  const options = runOptions(config(), {});
  assert.equal(options.cookie, undefined);
});

test('autoClear entries carry each cookie domain from the config', () => {
  const [entry] = runOptions(config(), {}).categories.analytics.autoClear.cookies;
  assert.ok(entry.name instanceof RegExp);
  assert.equal(entry.name.source, '^_ga$');
  assert.equal(entry.domain, '.ceaksan.com');
});

test('accept and reject are equally weighted in both dialogs', () => {
  const { guiOptions } = runOptions(config(), {});
  assert.equal(guiOptions.consentModal.equalWeightButtons, true);
  assert.equal(guiOptions.preferencesModal.equalWeightButtons, true);
});

test('source sets equalWeightButtons on both consentModal and preferencesModal', () => {
  const source = readFileSync(new URL('../src/run-options.ts', import.meta.url), 'utf8');
  assert.match(source, /consentModal:\s*\{[^}]*equalWeightButtons:\s*true[^}]*\}/);
  assert.match(source, /preferencesModal:\s*\{[^}]*equalWeightButtons:\s*true[^}]*\}/);
});

test('the runtime hands runOptions straight to CookieConsent.run', () => {
  const source = readFileSync(new URL('../src/banner-runtime.ts', import.meta.url), 'utf8');
  assert.match(source, /CookieConsent\.run\(runOptions\(cfg,/);
});

test('ConsentBanner passes cookieDomain through to the JSON config', () => {
  const source = readFileSync(new URL('../src/ConsentBanner.astro', import.meta.url), 'utf8');
  assert.match(source, /cookieDomain\?: string;/);
  assert.match(source, /\.\.\.\(cookieDomain \? \{ cookieDomain \} : \{\}\)/);
});
