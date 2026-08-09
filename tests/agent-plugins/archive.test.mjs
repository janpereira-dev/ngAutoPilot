import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

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
