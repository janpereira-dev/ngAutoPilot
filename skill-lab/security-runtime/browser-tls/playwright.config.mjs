import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.', testMatch: '*.spec.mjs', workers: 1, timeout: 60_000,
  outputDir: '../test-results/browser-tls',
  use: { browserName: 'chromium', channel: 'chromium', ignoreHTTPSErrors: false, trace: 'retain-on-failure' },
  reporter: [['list'], ['json', { outputFile: '../observations/browser-tls/playwright.json' }]],
});
