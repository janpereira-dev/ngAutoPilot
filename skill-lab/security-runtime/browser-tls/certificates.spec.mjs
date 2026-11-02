import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { certificates } from './certificates.mjs';
import { withBrowser } from './browser.mjs';
import { withNativeBrowser } from './native-browser.mjs';
import { serveAngular } from './server.mjs';
import { hash, manifest } from '../manifest.mjs';

const cache = path.resolve('.cache');
if (fs.lstatSync(cache, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error('Linked lab cache is not allowed');
fs.mkdirSync(cache, { recursive: true });
const directory = fs.mkdtempSync(path.join(cache, 'browser-tls-'));
const authority = certificates(directory);
const observations = [];

function browserRun(ca, run) {
  const engine = test.info().project.name;
  return engine ? withNativeBrowser(engine, directory, ca, run) : withBrowser(directory, ca, run);
}

function nativeError(kind) {
  const engine = test.info().project.name;
  if (engine === 'webkit') return 'Unacceptable TLS certificate';
  if (engine === 'firefox') return { authority: 'SEC_ERROR_UNKNOWN_ISSUER', host: 'SSL_ERROR_BAD_CERT_DOMAIN',
    expired: 'SEC_ERROR_EXPIRED_CERTIFICATE', future: 'MOZILLA_PKIX_ERROR_NOT_YET_VALID_CERTIFICATE' }[kind];
  return { authority: 'net::ERR_CERT_AUTHORITY_INVALID', host: 'net::ERR_CERT_COMMON_NAME_INVALID',
    expired: 'net::ERR_CERT_DATE_INVALID', future: 'net::ERR_CERT_DATE_INVALID' }[kind];
}

async function rejectCertificate(name, leaf, trust, expected) {
  const endpoint = await serveAngular(authority.leaves[leaf]);
  try {
    await browserRun(trust ? authority.ca : null, async (context, browser) => {
      const page = context.pages()[0];
      const failures = [];
      page.on('requestfailed', (request) => failures.push(request.failure()?.errorText));
      await expect(page.goto(endpoint.origin)).rejects.toThrow(expected);
      expect(failures).toContain(expected);
      expect(endpoint.requests).toEqual([]);
      observations.push({ name, outcome: 'rejected', expected, nativeFailures: failures,
        httpRequestsReachedServer: 0, certificate: authority.leaves[leaf].details, ...browser });
    });
  } finally { await endpoint.close(); }
}

test('rejects an otherwise valid chain when its CA is not trusted', async () => {
  await rejectCertificate('unknown authority', 'valid', false, nativeError('authority'));
});

test('accepts the valid CA-signed Angular app with isolated lab trust', async () => {
  const endpoint = await serveAngular(authority.leaves.valid);
  try {
    await browserRun(authority.ca, async (context, browser) => {
      const page = context.pages()[0];
      const failures = [];
      page.on('requestfailed', (request) => failures.push(request.failure()?.errorText));
      const response = await page.goto(endpoint.origin);
      expect(response.status()).toBe(200);
      await expect(page.locator('[data-ready]')).toHaveText('true');
      await expect(page.locator('lab-app')).toHaveAttribute('ng-version', '22.2.4');
      await expect(page.locator('h1')).toHaveText('Angular security fixture');
      expect(endpoint.requests).toContain('/browser.js');
      expect(failures).toEqual([]);
      const security = await response.securityDetails();
      expect(security.issuer).toBe('NgAutoPilot lab browser root');
      observations.push({ name: 'valid chain', outcome: 'accepted', httpStatus: response.status(),
        angularVersion: '22.2.4', clientReady: true, security, certificate: authority.leaves.valid.details, ...browser });
    });
  } finally { await endpoint.close(); }
});

for (const [name, leaf, error] of [
  ['wrong host', 'wrong-host', 'host'],
  ['expired leaf', 'expired', 'expired'],
  ['not yet valid leaf', 'future', 'future'],
  ['different issuing CA', 'foreign', 'authority'],
]) test(`rejects ${name} even with the lab CA trusted`, async () => {
  await rejectCertificate(name, leaf, true, nativeError(error));
});

test('a fresh browser without the lab CA still rejects the valid chain', async () => {
  await rejectCertificate('trust isolation', 'valid', false, nativeError('authority'));
});

test.afterAll(() => {
  const engine = test.info().project.name || 'chromium';
  const output = engine === 'chromium' ? 'observations/browser-tls' : `observations/native-browser-tls/${engine}`;
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(`${output}/results.json`, JSON.stringify({
    recordedAt: new Date().toISOString(), platform: process.platform, node: process.version,
    sources: manifest(), testSources: Object.fromEntries(['browser.mjs', 'certificates.mjs',
      'server.mjs', 'playwright.config.mjs', 'certificates.spec.mjs', 'native-browser.mjs', 'native.config.mjs']
      .map((file) => [file, hash(new URL(file, import.meta.url))])), observations,
  }, null, 2) + '\n');
});
