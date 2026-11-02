import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.', testMatch: 'certificates.spec.mjs', workers: 1, timeout: 90_000,
  outputDir: '../test-results/native-browser-tls',
  projects: ['firefox', 'webkit'].map((name) => ({ name, use: { browserName: name, ignoreHTTPSErrors: false } })),
  reporter: [['list'], ['json', { outputFile: '../observations/native-browser-tls/playwright.json' }]],
});
