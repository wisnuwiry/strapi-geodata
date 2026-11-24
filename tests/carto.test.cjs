const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

// Exercise the TypeScript sources without adding a test framework dependency.
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const config = require('../server/src/config/index.ts').default;
const createController = require('../server/src/controllers/controller.ts').default;
const routes = require('../server/src/routes/index.ts').default;

test('missing CARTO configuration does not prevent Strapi startup', () => {
  assert.doesNotThrow(() => config.validator({}));
  assert.doesNotThrow(() => config.validator({ cartoApiKey: '' }));
});

test('a CARTO API key is accepted as a string', () => {
  assert.doesNotThrow(() => config.validator({ cartoApiKey: 'test-carto-key' }));
});

for (const value of [null, false, 123, {}, []]) {
  test(`invalid CARTO key ${JSON.stringify(value)} is rejected without disclosing it`, () => {
    assert.throws(() => config.validator({ cartoApiKey: value }), /cartoApiKey must be a string/);
  });
}

function controllerWithKey(cartoApiKey) {
  return createController({
    strapi: {
      plugin(name) {
        assert.equal(name, 'strapi-location-picker');
        return {
          config(key, defaultValue) {
            assert.equal(key, 'cartoApiKey');
            return cartoApiKey === undefined ? defaultValue : cartoApiKey;
          },
        };
      },
    },
  });
}

test('the admin config response contains only the normalized browser-facing key', () => {
  const headers = {};
  const ctx = { set: (name, value) => (headers[name] = value) };
  controllerWithKey('  test-carto-key  ').config(ctx);
  assert.deepEqual(ctx.body, { cartoApiKey: 'test-carto-key' });
  assert.equal(headers['Cache-Control'], 'no-store');
});

test('an unconfigured installation returns an empty key', () => {
  const ctx = { set() {} };
  controllerWithKey(undefined).config(ctx);
  assert.deepEqual(ctx.body, { cartoApiKey: '' });
});

test('the config endpoint requires an authenticated admin', () => {
  const route = routes.find((route) => route.path === '/config');
  assert.ok(route, 'the config route must be registered');
  assert.equal(route.method, 'GET');
  assert.equal(route.handler, 'controller.config');
  assert.notEqual(route.config.auth, false);
  assert.deepEqual(route.config.policies, ['admin::isAuthenticatedAdmin']);
});

test('CARTO tile requests include an encoded key and preserve Leaflet placeholders', () => {
  const { getCartoTileUrl } = require('../admin/src/utils/carto.ts');
  assert.equal(
    getCartoTileUrl('  key+with/&?=# characters  '),
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' +
      '?key=key%2Bwith%2F%26%3F%3D%23%20characters'
  );
});

test('an absent or blank key does not produce an unauthenticated tile URL', () => {
  const { getCartoTileUrl } = require('../admin/src/utils/carto.ts');
  assert.equal(getCartoTileUrl(''), null);
  assert.equal(getCartoTileUrl('   '), null);
});
