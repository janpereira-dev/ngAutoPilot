import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', workers: 1, timeout: 45_000,
  use: { browserName: 'chromium', ignoreHTTPSErrors: true, trace: 'retain-on-failure' },
  reporter: [['list'], ['json', { outputFile: 'observations/playwright.json' }], ['./reporter.mjs']],
});
