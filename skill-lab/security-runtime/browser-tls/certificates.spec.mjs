import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { certificates } from './certificates.mjs';
import { withBrowser } from './browser.mjs';
import { serveAngular } from './server.mjs';
import { hash, manifest } from '../manifest.mjs';

const cache = path.resolve('.cache');
if (fs.lstatSync(cache, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error('Linked lab cache is not allowed');
fs.mkdirSync(cache, { recursive: true });
const directory = fs.mkdtempSync(path.join(cache, 'browser-tls-'));
const authority = certificates(directory);
const observations = [];

async function rejectCertificate(name, leaf, trust, expected) {
  const endpoint = await serveAngular(authority.leaves[leaf]);
  try {
    await withBrowser(directory, trust ? authority.ca : null, async (context, browser) => {
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
  await rejectCertificate('unknown authority', 'valid', false, 'net::ERR_CERT_AUTHORITY_INVALID');
});

test('accepts the valid CA-signed Angular app with trust confined to its browser profile', async () => {
  const endpoint = await serveAngular(authority.leaves.valid);
  try {
    await withBrowser(directory, authority.ca, async (context, browser) => {
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
  ['wrong host', 'wrong-host', 'net::ERR_CERT_COMMON_NAME_INVALID'],
  ['expired leaf', 'expired', 'net::ERR_CERT_DATE_INVALID'],
  ['not yet valid leaf', 'future', 'net::ERR_CERT_DATE_INVALID'],
  ['different issuing CA', 'foreign', 'net::ERR_CERT_AUTHORITY_INVALID'],
]) test(`rejects ${name} even with the lab CA trusted`, async () => {
  await rejectCertificate(name, leaf, true, error);
});

test('trust added to one profile does not escape into a new profile', async () => {
  await rejectCertificate('profile isolation', 'valid', false, 'net::ERR_CERT_AUTHORITY_INVALID');
});

test.afterAll(() => {
  fs.mkdirSync('observations/browser-tls', { recursive: true });
  fs.writeFileSync('observations/browser-tls/results.json', JSON.stringify({
    recordedAt: new Date().toISOString(), platform: process.platform, node: process.version,
    sources: manifest(), testSources: Object.fromEntries(['browser.mjs', 'certificates.mjs',
      'server.mjs', 'playwright.config.mjs', 'certificates.spec.mjs']
      .map((file) => [file, hash(new URL(file, import.meta.url))])), observations,
  }, null, 2) + '\n');
});
