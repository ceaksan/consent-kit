import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/consent-init.js', import.meta.url), 'utf8');

function run({ cookie = '', dataset = {} } = {}) {
  const window = {};
  const document = { cookie, currentScript: { dataset } };
  vm.runInNewContext(source, { window, document });
  return plain(window.dataLayer);
}

const plain = (value) => JSON.parse(JSON.stringify(Array.from(value, (e) => (e && e.length !== undefined && typeof e !== 'string' ? Array.from(e) : e))));

const cookieFor = (categories) =>
  'cc_cookie=' + encodeURIComponent(JSON.stringify({ categories }));

test('defaults all four storage types to denied before anything else', () => {
  const layer = run();
  assert.deepEqual(layer[0], [
    'consent',
    'default',
    {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
      security_storage: 'granted',
      wait_for_update: 500,
    },
  ]);
});

test('redacts ad data by default and can opt out', () => {
  assert.ok(run().some((e) => e[0] === 'set' && e[1] === 'ads_data_redaction' && e[2] === true));
  const layer = run({ dataset: { adSignalsAlwaysDenied: 'false' } });
  assert.ok(!layer.some((e) => e[1] === 'ads_data_redaction'));
});

test('replays analytics granted from cc_cookie', () => {
  const window = {};
  const document = { cookie: cookieFor(['necessary', 'analytics']), currentScript: { dataset: {} } };
  vm.runInNewContext(source, { window, document });
  const layer = plain(window.dataLayer);
  const update = layer.find((e) => e[0] === 'consent' && e[1] === 'update');
  assert.deepEqual(update, ['consent', 'update', { analytics_storage: 'granted' }]);
  assert.ok(layer.some((e) => e.event === 'consent_restored' && e.consent_analytics === 'granted'));
});

test('stays denied when analytics was rejected', () => {
  const layer = run({ cookie: cookieFor(['necessary']) });
  assert.ok(!layer.some((e) => e[1] === 'update'));
});

test('stays denied on a malformed cookie', () => {
  let layer;
  assert.doesNotThrow(() => {
    layer = run({ cookie: 'cc_cookie=%7Bbroken' });
  });
  assert.ok(!layer.some((e) => e[1] === 'update'));
});

test('reads wait_for_update from data attribute', () => {
  const layer = run({ dataset: { waitForUpdate: '800' } });
  assert.equal(layer[0][2].wait_for_update, 800);
});

test('survives a missing currentScript', () => {
  const window = {};
  vm.runInNewContext(source, { window, document: { cookie: '' } });
  assert.equal(window.dataLayer[0][2].wait_for_update, 500);
});
