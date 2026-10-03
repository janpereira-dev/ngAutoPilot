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

test('keeps the committed MCP bundle synchronized with lock-resolved SDK and Zod dependencies', () => {
  const bundlePath = 'agent-plugins/ngautopilot-tools/bin/server.mjs';
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  for (const dependency of ['@modelcontextprotocol/client', '@modelcontextprotocol/server', '@modelcontextprotocol/core', 'zod']) {
    const installed = JSON.parse(fs.readFileSync(path.join(root, 'node_modules', dependency, 'package.json'), 'utf8'));
    assert.equal(installed.version, lock.packages[`node_modules/${dependency}`].version, dependency);
  }
  assert.equal(lock.packages['node_modules/@modelcontextprotocol/client'].version,
    lock.packages['node_modules/@modelcontextprotocol/server'].version);

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

test('ships exact upstream licenses for bundled dependencies, not the dev-only MCP client', () => {
  syncAgentPlugins({ root });
  const licensesDir = path.join(root, 'agent-plugins/ngautopilot-tools/third-party');
  const records = JSON.parse(fs.readFileSync(path.join(licensesDir, 'licenses.json'), 'utf8'));
  for (const name of ['@modelcontextprotocol/server', '@modelcontextprotocol/core', 'zod', 'semver']) {
    const record = records.find((item) => item.name === name);
    assert.ok(record, name);
    const upstream = path.join(root, 'node_modules', name);
    assert.equal(record.version, JSON.parse(fs.readFileSync(path.join(upstream, 'package.json'), 'utf8')).version);
    for (const file of record.files) {
      assert.deepEqual(fs.readFileSync(path.join(licensesDir, file)), fs.readFileSync(path.join(upstream, path.basename(file))));
    }
  }
  assert.equal(records.some(({ name }) => name === '@modelcontextprotocol/client'), false);
  assert.equal(records.find(({ name }) => name === '@modelcontextprotocol/server').license, 'Apache-2.0');
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
