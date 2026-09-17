import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { syncAgentPlugins } from '../../scripts/sync-agent-plugins.mjs';
import { validateAgentPlugins } from '../../scripts/validate-agent-plugins.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('generates pack-driven portable skill plugins without native manifest fields', () => {
  const reports = syncAgentPlugins({ root });
  assert.equal(reports.filter(({ kind }) => kind === 'skills').length, 4);

  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'agent-plugins/ngautopilot-core/plugin.json'), 'utf8'));
  assert.equal(manifest.skills, undefined);
  assert.match(manifest.$schema, /plugin\.schema\.json$/);
  assert.equal(validateAgentPlugins({ root }).errors.length, 0);
});

test('keeps the committed MCP bundle synchronized with the lock-resolved Zod dependency', () => {
  const bundlePath = 'agent-plugins/ngautopilot-tools/bin/server.mjs';
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  const installedZod = JSON.parse(fs.readFileSync(path.join(root, 'node_modules/zod/package.json'), 'utf8'));
  assert.equal(installedZod.version, lock.packages['node_modules/zod'].version);

  syncAgentPlugins({ root });
  assert.equal(
    execFileSync('git', ['ls-files', '--error-unmatch', '--', bundlePath], { cwd: root, encoding: 'utf8' }).trim(),
    bundlePath,
  );
  assert.deepEqual(
    fs.readFileSync(path.join(root, bundlePath)),
    execFileSync('git', ['show', `HEAD:${bundlePath}`], { cwd: root, maxBuffer: 8 * 1024 * 1024 }),
  );
  assert.doesNotThrow(() => execFileSync(
    'git',
    ['diff', '--exit-code', '--', bundlePath],
    { cwd: root, stdio: 'pipe' },
  ));
});

test('removes stale generated plugins and snapshots package manager metadata', () => {
  const stalePlugin = path.join(root, 'agent-plugins', 'ngautopilot-stale');
  fs.mkdirSync(stalePlugin, { recursive: true });

  try {
    syncAgentPlugins({ root });
    assert.equal(fs.existsSync(stalePlugin), false);
    assert.equal(fs.existsSync(path.join(root, 'agent-plugins', 'ngautopilot-tools', 'data', 'package-lock.json')), true);
  } finally {
    fs.rmSync(stalePlugin, { recursive: true, force: true });
  }
});
