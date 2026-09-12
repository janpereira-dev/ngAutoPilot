import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createAngularResolveHandler, createSecureAngularResolveServer } from '../../lib/agent-plugins/http-server.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const snapshot = { manifest: { dependencies: { '@angular/core': '^16.2.12', '@angular/common': '^16.2.12' } }, lockfile: { kind: 'npm', packages: { '@angular/core': '16.2.12', '@angular/common': '16.2.12' } } };

function invoke(handler, { body = { snapshot }, raw, method = 'POST', url = '/v1/angular/resolve', type = 'application/json', address = '127.0.0.1' } = {}) {
  const request = new EventEmitter();
  Object.assign(request, { method, url, headers: { 'content-type': type }, socket: { remoteAddress: address } });
  const response = { status: undefined, body: '', writeHead(status) { this.status = status; }, end(bodyText) { this.body = bodyText; this.done(); } };
  return new Promise((resolve) => {
    response.done = () => resolve({ status: response.status, body: JSON.parse(response.body) });
    handler(request, response);
    setImmediate(() => { request.emit('data', raw ?? JSON.stringify(body)); request.emit('end'); });
  });
}

test('resolves a locked Angular snapshot and rejects unsafe request fields', async () => {
  const handler = createAngularResolveHandler({ root, authorize: async () => true });
  const success = await invoke(handler);
  assert.equal(success.status, 200);
  assert.equal(success.body.evidence.angular.version, '16.2.12');
  for (const field of ['projectRoot', 'command', 'url', 'credentials']) {
    const result = await invoke(handler, { body: { snapshot, [field]: 'private-value' } });
    assert.equal(result.status, 400);
    assert.equal(result.body.error.code, 'invalid_request');
  }
});

test('denies unauthorized requests without exposing authentication details', async () => {
  const result = await invoke(createAngularResolveHandler({ root, authorize: async () => false }));
  assert.equal(result.status, 403);
  assert.deepEqual(result.body, { error: { code: 'forbidden', message: 'Request is not authorized' } });
});

test('enforces body size and client-address rate limits', async () => {
  const oversized = await invoke(createAngularResolveHandler({ root, authorize: async () => true, limits: { maxBodyBytes: 10 } }));
  assert.equal(oversized.status, 413);
  const handler = createAngularResolveHandler({ root, authorize: async () => true, limits: { requestsPerWindow: 1 } });
  assert.equal((await invoke(handler)).status, 200);
  const limited = await invoke(handler);
  assert.equal(limited.status, 429);
  assert.equal(limited.body.error.code, 'rate_limited');
});

test('returns structured errors for routing, content type, and malformed JSON', async () => {
  const handler = createAngularResolveHandler({ root, authorize: async () => true });
  assert.equal((await invoke(handler, { method: 'GET' })).status, 404);
  assert.equal((await invoke(handler, { url: '/other' })).status, 404);
  assert.equal((await invoke(handler, { type: 'text/plain' })).status, 415);
  const malformed = await invoke(handler, { raw: '{' });
  assert.equal(malformed.status, 400);
  assert.equal(malformed.body.error.code, 'malformed_json');
});

test('secure factory refuses missing TLS or authorization and OpenAPI is endpoint-scoped', () => {
  assert.throws(() => createSecureAngularResolveServer({ root, authorize: () => true }), /TLS/);
  assert.throws(() => createSecureAngularResolveServer({ root, tls: { key: 'key', cert: 'cert' } }), /authorization/);
  const openapi = fs.readFileSync(path.join(root, 'openapi.yaml'), 'utf8');
  assert.match(openapi, /\/v1\/angular\/resolve:/);
  assert.match(openapi, /bearerAuth:/);
  assert.doesNotMatch(openapi, /projectRoot|command|https?:\/\//);
});
