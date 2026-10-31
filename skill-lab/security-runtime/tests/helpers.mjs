import fs from 'node:fs';
import { expect } from '@playwright/test';
import { startLab } from '../server.mjs';

export async function usingLab(browser, options, run) {
  const lab = await startLab(options);
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const externalRequests = [];
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (['127.0.0.1', 'localhost'].includes(url.hostname)
      && [lab.origin, lab.foreign, lab.proxy].some((value) => new URL(value).port === url.port)) return route.continue();
    externalRequests.push(url.href);
    return route.fulfill({ contentType: 'text/html', body: '<p>Synthetic content only</p>' });
  });
  try { return await run({ ...lab, context, externalRequests }); }
  finally { await context.close(); await lab.close(); }
}

export async function login(lab, user = 'alice') {
  const response = await lab.context.request.post(`${lab.origin}/auth/login`, {
    headers: { Origin: lab.origin }, data: { user },
  });
  expect(response.status()).toBe(200);
  return response.json();
}

export async function pageFor(lab, query = '') {
  const page = await lab.context.newPage();
  const response = await page.goto(`${lab.origin}/${query}`);
  expect(response.status()).toBe(200);
  await expect(page.locator('[data-ready]')).toHaveText('true');
  await expect(page.locator('lab-app')).toHaveAttribute('ng-version', '22.2.4');
  return page;
}

export async function storageKeys(page) {
  return page.evaluate(async () => ({
    local: Object.keys(localStorage), session: Object.keys(sessionStorage),
    databases: (await indexedDB.databases()).map((database) => database.name),
  }));
}

// Observations contain measured facts only. The agent never receives the grading oracle.
export function record(id, guide, subject, correction = null) {
  fs.mkdirSync('observations/cases', { recursive: true });
  fs.writeFileSync(`observations/cases/${id}.json`, JSON.stringify({
    id, guide, framework: 'Angular 22.2.4', application: 'isolated synthetic deployment',
    subject, correction,
  }, null, 2) + '\n');
}

export const tokenGuide = 'angular-token-storage-policy';
export const xssGuide = 'angular-xss-template-safety';
export const domGuide = 'angular-domsanitizer-governance';
export const ssrGuide = 'angular-ssr-security-risk-gate';
export const dependencyGuide = 'angular-dependency-vulnerability-triage';
