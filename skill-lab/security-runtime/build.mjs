import { build } from 'esbuild';

await build({
  entryPoints: ['src/browser.mjs'], outfile: 'dist/browser.js', bundle: true,
  format: 'esm', platform: 'browser', target: 'es2022', logLevel: 'warning',
});
