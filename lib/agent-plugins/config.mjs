import fs from 'node:fs';

const pluginNamePattern = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;

export function loadPluginConfig(filePath) {
  const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (config.$schemaVersion !== '1.0.0' || !Array.isArray(config.plugins)) {
    throw new Error(`${filePath}: invalid Agent Plugins configuration`);
  }

  const names = new Set();

  return config.plugins.map((plugin) => {
    if (!plugin || !pluginNamePattern.test(plugin.name ?? '') || plugin.name.includes('--') || plugin.name.includes('..')) {
      throw new Error(`${filePath}: invalid plugin name`);
    }
    if (names.has(plugin.name)) {
      throw new Error(`${filePath}: duplicate plugin name: ${plugin.name}`);
    }
    if (!['skills', 'mcp'].includes(plugin.kind) || typeof plugin.enabled !== 'boolean') {
      throw new Error(`${filePath}: invalid plugin definition: ${plugin.name}`);
    }
    if (plugin.kind === 'skills' && typeof plugin.pack !== 'string') {
      throw new Error(`${filePath}: skills plugin requires pack: ${plugin.name}`);
    }
    if (plugin.kind === 'mcp' && 'pack' in plugin) {
      throw new Error(`${filePath}: MCP plugin cannot declare pack: ${plugin.name}`);
    }
    if (plugin.portableNames !== undefined && (plugin.kind !== 'skills' || typeof plugin.portableNames !== 'object' || Array.isArray(plugin.portableNames) || Object.values(plugin.portableNames).some((name) => typeof name !== 'string'))) {
      throw new Error(`${filePath}: invalid portable names: ${plugin.name}`);
    }

    names.add(plugin.name);
    return Object.freeze({ ...plugin });
  });
}
