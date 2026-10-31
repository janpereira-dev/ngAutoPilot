import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const guideIds = ['angular-token-storage-policy', 'angular-xss-template-safety',
  'angular-domsanitizer-governance', 'angular-ssr-security-risk-gate', 'angular-dependency-vulnerability-triage'];
const applicationFiles = ['package.json', 'package-lock.json', 'audit-task.md', 'build.mjs', 'manifest.mjs', 'reporter.mjs',
  'server.mjs', 'dependency-probe.mjs', 'dependencies.mjs', 'prepare-cases.mjs', 'playwright.config.mjs',
  'src/app.mjs', 'src/browser.mjs', 'src/render.mjs', 'tests/helpers.mjs', 'tests/scenarios.spec.mjs',
  ...['runtime-before', 'runtime-after', 'build-before', 'build-after']
    .flatMap((id) => [`cases/${id}/package.fixture.json`, `cases/${id}/package-lock.fixture.json`])];
export function hash(file) { return createHash('sha256').update(fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n')).digest('hex'); }

export function manifest() {
  return {
    textNormalization: 'CRLF to LF before SHA-256',
    guides: Object.fromEntries(guideIds.map((id) => [id, hash(new URL(`../../skills/angular/security/${id}/SKILL.md`, import.meta.url))])),
    application: Object.fromEntries(applicationFiles.map((file) => [file, hash(new URL(file, import.meta.url))])),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(manifest(), null, 2));
