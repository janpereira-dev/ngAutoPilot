import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { loadPluginConfig } from '../../lib/agent-plugins/config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('defines four pack-driven skill plugins and one MCP plugin', () => {
  const config = loadPluginConfig(path.join(root, 'agent-plugins.config.json'));

  assert.deepEqual(config.map(({ name }) => name), [
    'ngautopilot-core',
    'ngautopilot-angular-architecture',
    'ngautopilot-angular-testing',
    'ngautopilot-angular-21-to-22',
    'ngautopilot-tools',
  ]);
  assert.equal(config.filter(({ kind }) => kind === 'skills').length, 4);
  assert.equal(config.find(({ name }) => name === 'ngautopilot-tools').kind, 'mcp');
});
