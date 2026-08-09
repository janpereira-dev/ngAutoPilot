import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createPluginArchives } from '../../lib/agent-plugins/archive.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('creates repeatable archives and SHA256SUMS', async () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-archives-'));
  try {
    const first = await createPluginArchives({ sourceRoot: path.join(root, 'agent-plugins'), outputRoot: path.join(temporary, 'first'), version: '0.5.3' });
    const second = await createPluginArchives({ sourceRoot: path.join(root, 'agent-plugins'), outputRoot: path.join(temporary, 'second'), version: '0.5.3' });
    assert.deepEqual(first.archives, second.archives);
    assert.match(fs.readFileSync(path.join(temporary, 'first', 'SHA256SUMS'), 'utf8'), /^.+  ngautopilot-core-0\.5\.3\.zip$/m);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('creates identical archives across timezones', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-archive-timezones-'));
  const archiveUrl = pathToFileURL(path.join(root, 'lib', 'agent-plugins', 'archive.mjs')).href;
  const sourceRoot = path.join(root, 'agent-plugins');

  try {
    for (const timezone of ['Etc/UTC', 'America/Los_Angeles']) {
      const outputRoot = path.join(temporary, timezone.replace('/', '-'));
      const script = `import { createPluginArchives } from ${JSON.stringify(archiveUrl)}; await createPluginArchives({ sourceRoot: ${JSON.stringify(sourceRoot)}, outputRoot: ${JSON.stringify(outputRoot)}, version: '0.6.0' });`;
      const result = spawnSync(process.execPath, ['--input-type=module', '--eval', script], { encoding: 'utf8', env: { ...process.env, TZ: timezone } });
      assert.equal(result.status, 0, result.stderr);
    }

    assert.deepEqual(
      fs.readFileSync(path.join(temporary, 'Etc-UTC', 'SHA256SUMS'), 'utf8'),
      fs.readFileSync(path.join(temporary, 'America-Los_Angeles', 'SHA256SUMS'), 'utf8'),
    );
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
