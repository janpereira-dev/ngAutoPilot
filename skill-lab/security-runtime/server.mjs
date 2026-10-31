import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { render } from './src/render.mjs';
import { compileTemplate } from './dependency-probe.mjs';

const tlsRoot = path.resolve('.cache', `tls-${process.pid}`);
fs.mkdirSync(tlsRoot, { recursive: true });
const openssl = process.platform === 'win32' ? 'C:/Program Files/Git/usr/bin/openssl.exe' : 'openssl';
const certificate = spawnSync(openssl, ['req', '-x509', '-newkey', 'rsa:2048', '-nodes',
  '-keyout', path.join(tlsRoot, 'key.pem'), '-out', path.join(tlsRoot, 'cert.pem'),
  '-days', '1', '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'],
{ encoding: 'utf8', env: { ...process.env, MSYS_NO_PATHCONV: '1' } });
if (certificate.status !== 0) throw new Error(`Test certificate generation failed: ${certificate.stderr}`);
const tls = { key: fs.readFileSync(path.join(tlsRoot, 'key.pem')), cert: fs.readFileSync(path.join(tlsRoot, 'cert.pem')) };

function listen(server, protocol) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(`${protocol}://127.0.0.1:${server.address().port}`));
  });
}

function json(response, code, value, headers = {}) {
  response.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers });
  response.end(JSON.stringify(value));
}

async function body(request) {
  let result = '';
  for await (const chunk of request) {
    result += chunk;
    if (result.length > 8192) throw new Error('Oversized test request');
  }
  return result;
}

export async function startLab({ fault = '', authAvailable = true } = {}) {
  const servers = [];
  const sessions = new Map();
  const refresh = new Map();
  const spent = new Map();
  const received = [];
  let origin;
  let foreign;
  let proxyOrigin;
  let elapsed = 0;
  let cached;
  const revoke = (sid) => {
    sessions.delete(sid);
    for (const [token, owner] of refresh) if (owner === sid) refresh.delete(token);
  };

  const receiver = http.createServer((req, res) => {
    received.push({ path: req.url, hasAuthorization: Boolean(req.headers.authorization) });
    if (req.url === '/redirect') { res.writeHead(302, { Location: `${foreign}/metadata` }); res.end(); }
    else if (req.url.startsWith('/registry/')) json(res, 503, { error: 'synthetic registry unavailable' });
    else json(res, 200, { marker: 'owned-receiver' });
  });
  servers.push(receiver);
  const backend = await listen(receiver, 'http');
  const foreignServer = https.createServer(tls, (req, res) => {
    received.push({ path: req.url, hasAuthorization: Boolean(req.headers.authorization) });
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Headers', 'Authorization');
    if (req.method === 'OPTIONS') { res.end(); return; }
    if (req.url === '/form') {
      res.setHeader('Content-Type', 'text/html');
      res.end(`<form method="POST" action="${origin}/api/mutate"><button>Cross-site mutation</button></form>`);
    } else json(res, 200, { hasAuthorization: Boolean(req.headers.authorization), marker: 'owned-receiver' });
  });
  servers.push(foreignServer);
  foreign = await listen(foreignServer, 'https');
  const probeTarget = `${backend}/probe`;
  const redirectTarget = `${backend}/redirect`;
  const trapTarget = `${foreign}/metadata`;

  async function boundedFetch(target, unsafe) {
    let url = new URL(target);
    for (let hop = 0; hop < 4; hop++) {
      // Dispatch only to fixed owned capabilities, including in the negative control.
      let response;
      if (url.href === probeTarget) response = await fetch(probeTarget, { redirect: 'manual' });
      else if (url.href === redirectTarget) response = await fetch(redirectTarget, { redirect: 'manual' });
      else if (unsafe && url.href === trapTarget) response = await new Promise((resolve, reject) => {
        const request = https.get(trapTarget, { ca: tls.cert }, (result) => {
          let text = ''; result.on('data', (data) => { text += data; });
          result.on('end', () => resolve({ status: result.statusCode, headers: new Headers(result.headers), text: async () => text }));
        });
        request.on('error', reject);
      });
      else throw new Error('Outside authorized owned capabilities');
      if (response.status >= 300 && response.status < 400) { url = new URL(response.headers.get('location'), url); continue; }
      return response.text();
    }
    throw new Error('Too many redirects');
  }

  const app = https.createServer(tls, async (req, res) => {
    try {
      const url = new URL(req.url, origin);
      const forwarded = Object.keys(req.headers).filter((name) => name === 'forwarded' || name.startsWith('x-forwarded-'));
      if (fault !== 'forwarded-origin' && (req.headers.host !== new URL(origin).host || forwarded.length)) {
        json(res, 400, { error: 'Untrusted request origin' }); return;
      }
      const cookies = Object.fromEntries((req.headers.cookie ?? '').split(';').map((entry) => entry.trim().split('=')));
      const bearer = req.headers.authorization?.replace(/^Bearer lab-access-/, '');
      const sid = bearer || cookies.session;
      const session = sessions.get(sid);
      const active = session && session.expires > Date.now() + elapsed ? session : null;
      if (url.pathname.startsWith('/auth/') && !authAvailable) { json(res, 503, { error: 'Auth backend unavailable' }); return; }
      if (url.pathname === '/auth/login' && req.method === 'POST') {
        if (![origin, proxyOrigin].includes(req.headers.origin)) { json(res, 403, { error: 'Login origin rejected' }); return; }
        const { user } = JSON.parse(await body(req));
        if (!['alice', 'bob'].includes(user)) { json(res, 400, { error: 'Synthetic accounts only' }); return; }
        const id = randomUUID(); const token = randomUUID(); const csrf = randomUUID();
        sessions.set(id, { user, csrf, expires: Date.now() + elapsed + 60_000, mutations: 0 });
        refresh.set(token, id);
        const sameSite = fault === 'csrf' ? 'None' : 'Lax';
        json(res, 200, { access: `lab-access-${id}`, csrf }, { 'Set-Cookie': [
          `session=${id}; Path=/; HttpOnly; Secure; SameSite=${sameSite}; Max-Age=60`,
          `refresh=${token}; Path=/auth; HttpOnly; Secure; SameSite=${sameSite}; Max-Age=60`,
          `XSRF-TOKEN=${csrf}; Path=/; Secure; SameSite=${sameSite}; Max-Age=60`,
        ] }); return;
      }
      const changesState = req.method === 'POST' && ['/api/mutate', '/auth/rotate', '/auth/logout'].includes(url.pathname);
      if (changesState && fault !== 'csrf' && (!active || ![origin, proxyOrigin].includes(req.headers.origin) || req.headers['x-xsrf-token'] !== active.csrf)) {
        json(res, 403, { error: 'CSRF rejected' }); return;
      }
      if (url.pathname === '/auth/rotate' && req.method === 'POST') {
        const token = cookies.refresh;
        const owner = refresh.get(token);
        if (!owner || !sessions.has(owner)) {
          if (spent.has(token)) revoke(spent.get(token));
          json(res, 401, { error: 'Refresh rejected' }); return;
        }
        const next = randomUUID(); refresh.set(next, owner);
        if (fault !== 'refresh-replay') { refresh.delete(token); spent.set(token, owner); }
        json(res, 200, { rotated: true }, { 'Set-Cookie': `refresh=${next}; Path=/auth; HttpOnly; Secure; SameSite=Lax` }); return;
      }
      if (url.pathname === '/auth/logout' && req.method === 'POST') { revoke(sid); json(res, 200, { loggedOut: true }); return; }
      if (url.pathname === '/api/mutate' && req.method === 'POST') {
        if (!active) { json(res, 401, { error: 'Session required' }); return; }
        active.mutations++; json(res, 200, { mutations: active.mutations }); return;
      }
      if (url.pathname === '/api/state') { json(res, active ? 200 : 401, active ? { mutations: active.mutations } : { error: 'Session expired or revoked' }); return; }
      if (url.pathname === '/api/echo') { json(res, 200, { hasAuthorization: Boolean(req.headers.authorization) }); return; }
      if (url.pathname === '/api/template' && req.method === 'POST') {
        const input = JSON.parse(await body(req));
        json(res, 200, compileTemplate(`.cache/projects/runtime-${fault === 'dependency-runtime' ? 'before' : 'after'}`, input.variable)); return;
      }
      if (url.pathname === '/api/fetch') {
        try { json(res, 200, { result: await boundedFetch(url.searchParams.get('target'), fault === 'internal-fetch') }); }
        catch { json(res, 400, { error: 'Destination rejected' }); }
        return;
      }
      if (url.pathname === '/browser.js') {
        res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(fs.readFileSync('dist/browser.js')); return;
      }
      if (url.pathname !== '/') { json(res, 404, { error: 'Unknown lab route' }); return; }
      let selectedOrigin = origin;
      if (fault === 'forwarded-origin') {
        selectedOrigin = `http://${req.headers['x-forwarded-host'] ?? req.headers.host}`;
        if ([backend, foreign].includes(selectedOrigin)) await boundedFetch(`${selectedOrigin}/probe`, true);
      }
      const html = fault === 'cross-user-cache' && cached ? cached : await render({
        fault, origin: selectedOrigin, foreign, user: active ? `${active.user.toUpperCase()}_PRIVATE` : 'ANONYMOUS',
        html: url.searchParams.get('html') ?? '<b>Allowed formatting</b>', context: url.searchParams.get('context'),
        variable: url.searchParams.get('variable') ?? 'data',
        link: url.searchParams.get('link') ?? 'https://content.example.test/lesson',
        resource: url.searchParams.get('resource') ?? 'https://media.example.test/embed/lesson-1',
      });
      if (fault === 'cross-user-cache') cached = html;
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'private, no-store' }); res.end(html);
    } catch (error) { json(res, 500, { error: error.message }); }
  });
  servers.push(app); origin = await listen(app, 'https');
  const proxy = https.createServer(tls, (req, res) => {
    if (req.headers.host !== new URL(proxyOrigin).host) { json(res, 400, { error: 'Edge host rejected' }); return; }
    const headers = { ...req.headers, host: new URL(origin).host };
    for (const key of Object.keys(headers)) if (key === 'forwarded' || key.startsWith('x-forwarded-')) delete headers[key];
    const upstream = https.request(`${origin}${req.url}`, { method: req.method, headers, ca: tls.cert }, (result) => {
      res.writeHead(result.statusCode, result.headers); result.pipe(res);
    });
    upstream.on('error', () => json(res, 502, { error: 'Lab upstream unavailable' })); req.pipe(upstream);
  });
  servers.push(proxy); proxyOrigin = await listen(proxy, 'https');
  return {
    origin, foreign, backend, proxy: proxyOrigin, received,
    advanceClock: (milliseconds) => { elapsed += milliseconds; },
    close: () => Promise.all(servers.map((server) => new Promise((resolve) => {
      server.close(resolve); server.closeAllConnections();
    }))),
  };
}
