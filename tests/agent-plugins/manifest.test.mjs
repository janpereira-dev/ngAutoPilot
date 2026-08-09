import assert from 'node:assert/strict';
import test from 'node:test';

import { buildPluginManifest, validatePluginManifest } from '../../lib/agent-plugins/manifest.mjs';

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
