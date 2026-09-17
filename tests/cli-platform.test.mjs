import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin', 'ngautopilot.mjs');

test('reports platform and quality inventories as read-only JSON', () => {
  const platform = run('platform', '--json');
  const quality = run('quality', '--json');

  assert.equal(platform.status, 0, platform.stderr);
  assert.equal(quality.status, 0, quality.stderr);
  assert.equal(JSON.parse(platform.stdout).skills.count, 413);
  assert.equal(JSON.parse(quality.stdout).summary.skillCount, 413);
});

test('renders distribution availability and artifact locations for terminal users', () => {
  const platform = run('platform');

  assert.equal(platform.status, 0, platform.stderr);
  assert.match(platform.stdout, /Claude=repository-manifest \(\.claude-plugin\/marketplace\.json\)/);
  assert.match(platform.stdout, /OpenAI=source-only \(openai\/plugin\.json\)/);
  assert.doesNotMatch(platform.stdout, /\[object Object\]/);
});

test('resolves a detected Angular project without installing or selecting a migration hop', (t) => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-cli-angular-'));
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));
  fs.writeFileSync(path.join(projectRoot, 'package.json'), `${JSON.stringify({
    private: true,
    dependencies: { '@angular/core': '^12.2.17', '@angular/common': '^12.2.17' },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(projectRoot, 'package-lock.json'), `${JSON.stringify({
    lockfileVersion: 3,
    packages: { 'node_modules/@angular/core': { version: '12.2.17' } },
  }, null, 2)}\n`);

  const result = run('angular', '--profile', 'testing', '--capabilities', 'ui', '--json', { cwd: projectRoot });

  assert.equal(result.status, 0, result.stderr);
  const resolution = JSON.parse(result.stdout);
  assert.equal(resolution.evidence.angular.major, 12);
  assert.ok(resolution.included.some(({ id, type }) => type === 'pack' && id === 'ngautopilot-angular-testing'));
  assert.ok(resolution.excluded.some(({ selector }) => selector === 'angular.upgrade.hops.*'));
});

function run(...args) {
  const options = typeof args.at(-1) === 'object' && !Array.isArray(args.at(-1)) ? args.pop() : {};
  return spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', ...options });
}
