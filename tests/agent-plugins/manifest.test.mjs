import assert from 'node:assert/strict';
import test from 'node:test';

import { buildPluginManifest, validateMcpConfig, validatePluginManifest } from '../../lib/agent-plugins/manifest.mjs';

test('creates a closed Agent Plugins manifest', () => {
  const manifest = buildPluginManifest({ name: 'ngautopilot-core', version: '0.5.3', description: 'Core workflows.', keywords: ['angular'] });

  assert.deepEqual(Object.keys(manifest), [
    '$schema', 'name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords',
  ]);
  assert.deepEqual(validatePluginManifest(manifest), []);
});

test('rejects unsupported manifest fields and invalid names', () => {
  assert.match(validatePluginManifest({ $schema: 'x', name: 'bad--name' }).join('\n'), /invalid plugin name/);
  assert.match(validatePluginManifest({ $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json', name: 'valid', skills: './skills' }).join('\n'), /unknown manifest field/);
});

test('requires executable stdio MCP server definitions', () => {
  const valid = {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
    mcpServers: { ngautopilot: { type: 'stdio', command: 'node', args: ['server.mjs'], cwd: '.' } },
  };

  assert.deepEqual(validateMcpConfig(valid), []);
  assert.match(validateMcpConfig({ ...valid, mcpServers: {} }).join('\n'), /must contain at least one server/);
  assert.match(validateMcpConfig({ ...valid, mcpServers: { ngautopilot: null } }).join('\n'), /must be an object/);
  assert.match(validateMcpConfig({ ...valid, mcpServers: { ngautopilot: { type: 'stdio' } } }).join('\n'), /command must be a non-empty string/);
  assert.match(validateMcpConfig({ ...valid, mcpServers: { ngautopilot: { type: 'http', command: 'node', args: [] } } }).join('\n'), /type must be stdio/);
});
