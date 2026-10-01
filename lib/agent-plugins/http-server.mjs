import https from 'node:https';

import { createRepositoryTools } from './repository.mjs';

const endpoint = '/v1/angular/resolve';
const defaultLimits = Object.freeze({ maxBodyBytes: 32 * 1024, timeoutMs: 5_000, requestsPerWindow: 30, windowMs: 60_000, maxClients: 10_000 });
const requestFields = new Set(['snapshot', 'target', 'profile', 'capabilities']);

/**
 * Creates the HTTPS-only adapter for the snapshot resolver. Calling listen() is
 * deliberately left to the deploying application, which owns host controls.
 */
export function createSecureAngularResolveServer({ root, tls, authorize, limits } = {}) {
  if (!tls?.key || !tls?.cert) throw new TypeError('TLS key and certificate are required');
  if (typeof authorize !== 'function') throw new TypeError('authorization callback is required');
  return https.createServer(tls, createAngularResolveHandler({ root, authorize, limits }));
}

/** Testable handler; production callers must obtain it through the secure factory. */
export function createAngularResolveHandler({ root, authorize, limits = {} } = {}) {
  const config = { ...defaultLimits, ...limits };
  for (const key of Object.keys(defaultLimits)) {
    if (!Number.isSafeInteger(config[key]) || config[key] <= 0) throw new TypeError(`${key} must be a positive integer`);
  }
  const tools = createRepositoryTools({ root });
  const clients = new Map();
  let nextCleanup = 0;

  return async function angularResolveHandler(request, response) {
    const address = request.socket?.remoteAddress ?? 'unknown';
    const now = Date.now();
    if (now >= nextCleanup) {
      for (const [client, window] of clients) if (now - window.started >= config.windowMs) clients.delete(client);
      nextCleanup = now + Math.min(config.windowMs, 1_000);
    }
    if (!allowClient(clients, address, config, now)) return send(response, 429, 'rate_limited', 'Too many requests');
    if (request.method !== 'POST' || request.url !== endpoint) return send(response, 404, 'not_found', 'Endpoint not found');
    if (!isJson(request.headers?.['content-type'])) return send(response, 415, 'unsupported_media_type', 'Content-Type must be application/json');
    if (typeof authorize !== 'function') return send(response, 401, 'unauthorized', 'Authorization is required');

    let permitted;
    try { permitted = await authorize({ request, clientAddress: address }); }
    catch { return send(response, 401, 'unauthorized', 'Authorization is required'); }
    if (permitted !== true) return send(response, 403, 'forbidden', 'Request is not authorized');
    try {
      const body = await readJson(request, config);
      validateRequest(body);
      const input = Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined));
      if (input.target === undefined) input.target = snapshotTarget(input.snapshot);
      if (input.profile === undefined) input.profile = 'core';
      if (input.capabilities === undefined) input.capabilities = [];
      return send(response, 200, undefined, undefined, tools.angularResolve(input));
    } catch (error) {
      const known = error?.code && error.status;
      return send(response, known ? error.status : 400, known ? error.code : 'invalid_request', known ? error.message : 'Invalid Angular snapshot request');
    }
  };
}

function isJson(contentType) {
  return String(contentType ?? '').split(';', 1)[0].trim().toLowerCase() === 'application/json';
}

function allowClient(clients, address, { requestsPerWindow, windowMs, maxClients }, now) {
  const current = clients.get(address);
  if (!current || now - current.started >= windowMs) {
    // Refuse new clients at capacity instead of evicting an active rate limit.
    if (!current && clients.size >= maxClients) return false;
    clients.set(address, { started: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= requestsPerWindow;
}

function readJson(request, { maxBodyBytes, timeoutMs }) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    let settled = false;
    const fail = (status, code, message) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(Object.assign(new Error(message), { status, code }));
    };
    const timer = setTimeout(() => fail(408, 'request_timeout', 'Request timed out'), timeoutMs);
    request.on('data', (chunk) => {
      if (settled) return;
      size += Buffer.byteLength(chunk);
      if (size > maxBodyBytes) return fail(413, 'payload_too_large', 'Request body is too large');
      chunks.push(chunk);
    });
    request.on('error', () => fail(400, 'invalid_request', 'Invalid request body'));
    request.on('end', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { resolve(JSON.parse(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString('utf8'))); }
      catch { reject(Object.assign(new Error('Malformed JSON'), { status: 400, code: 'malformed_json' })); }
    });
  });
}

function validateRequest(body) {
  if (!plainObject(body) || Object.keys(body).some((key) => !requestFields.has(key)) || !plainObject(body.snapshot)) {
    throw Object.assign(new Error('Only snapshot resolver fields are accepted'), { status: 400, code: 'invalid_request' });
  }
}

function snapshotTarget(snapshot) {
  const version = snapshot.lockfile?.packages?.['@angular/core']
    ?? snapshot.manifest?.dependencies?.['@angular/core']
    ?? snapshot.manifest?.devDependencies?.['@angular/core'];
  const match = typeof version === 'string' && version.match(/(\d+\.\d+)/);
  if (!match) throw Object.assign(new Error('Snapshot must declare @angular/core'), { status: 400, code: 'invalid_request' });
  return match[1];
}

function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function send(response, status, code, message, result) {
  const body = code ? { error: { code, message } } : result;
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(body));
}
