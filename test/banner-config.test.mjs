import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

// Runs the built bundle (npm run build first) against a permissive fake DOM.
// Which config won is observable through darkClass: the runtime mirrors it onto
// <html> as cc--darkmode synchronously, before the library starts.
const bundle = readFileSync(new URL('../dist/consent-banner.js', import.meta.url), 'utf8');

process.on('unhandledRejection', () => {});

const copy = {
  banner: { title: 't', description: 'd', acceptAll: 'a', acceptNecessary: 'n', showPreferences: 'p' },
  preferences: {
    title: 't', acceptAll: 'a', acceptNecessary: 'n', savePreferences: 's', close: 'c',
    serviceCounterLabel: 'x', intro: { title: 'i', description: 'i' },
    necessary: { title: 'n', description: 'n' }, analytics: { title: 'a', description: 'a' },
    table: { name: 'n', domain: 'd', expiration: 'e', description: 'd' },
  },
};
const config = (darkClass) => ({
  lang: 'en', policyUrl: '/p', policyLabel: 'P', darkClass, ...copy, cookies: [],
});

const lenient = () => {
  const fn = () => lenient();
  return new Proxy(fn, {
    get: (_, key) => (key === Symbol.toPrimitive ? () => '' : key === 'length' ? 0 : lenient()),
    set: () => true,
    apply: () => lenient(),
    construct: () => lenient(),
  });
};

function run({ windowConfig, jsonConfig, htmlClasses = [] }) {
  const toggles = [];
  const documentElement = {
    dataset: {},
    classList: {
      contains: (name) => htmlClasses.includes(name),
      toggle: (name, on) => toggles.push([name, on]),
      add() {}, remove() {},
    },
  };
  const document = new Proxy(
    {
      documentElement,
      cookie: '',
      getElementById: (id) =>
        id === 'cc-config' && jsonConfig ? { textContent: JSON.stringify(jsonConfig) } : null,
      addEventListener() {},
    },
    { get: (target, key) => (key in target ? target[key] : lenient()) },
  );
  const window = {
    dataLayer: [],
    gtag() {},
    addEventListener() {},
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    ...(windowConfig ? { consentKitConfig: windowConfig } : {}),
  };
  window.window = window;
  const context = {
    window, document, location: { search: '' }, sessionStorage: { getItem: () => null, setItem() {} },
    MutationObserver: class { observe() {} },
    queueMicrotask, URLSearchParams, RegExp, console,
    navigator: { userAgent: '' }, HTMLElement: class {},
  };
  vm.runInNewContext(bundle, context);
  return { documentElement, toggles };
}

test('prefers window.consentKitConfig over the JSON element', () => {
  const { toggles, documentElement } = run({
    windowConfig: config('night'),
    jsonConfig: config('dark'),
    htmlClasses: ['night'],
  });
  assert.deepEqual(toggles[0], ['cc--darkmode', true]);
  assert.equal(documentElement.dataset.cc, 'ready');
});

test('falls back to the #cc-config JSON element', () => {
  const { toggles, documentElement } = run({ jsonConfig: config('dark'), htmlClasses: ['dark'] });
  assert.deepEqual(toggles[0], ['cc--darkmode', true]);
  assert.equal(documentElement.dataset.cc, 'ready');
});

test('does nothing when no config exists', () => {
  const { toggles, documentElement } = run({});
  assert.equal(toggles.length, 0);
  assert.equal(documentElement.dataset.cc, undefined);
});
