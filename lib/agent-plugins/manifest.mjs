export const PLUGIN_SCHEMA = 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json';
export const MCP_SCHEMA = 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json';

const manifestFields = new Set(['$schema', 'name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords', 'extensions']);
const pluginNamePattern = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;

export function buildPluginManifest({ name, version, description, keywords }) {
  return {
    $schema: PLUGIN_SCHEMA,
    name,
    version,
    description,
    author: { name: 'Jan Pereira', url: 'https://github.com/janpereira-dev' },
    homepage: 'https://github.com/janpereira-dev/ngAutoPilot',
    repository: 'https://github.com/janpereira-dev/ngAutoPilot',
    license: 'MIT',
    keywords,
  };
}

export function validatePluginManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return ['manifest must be an object'];
  if (manifest.$schema !== PLUGIN_SCHEMA) errors.push('unsupported plugin schema');
  if (!pluginNamePattern.test(manifest.name ?? '') || manifest.name.includes('--') || manifest.name.includes('..') || manifest.name.length > 64) {
    errors.push('invalid plugin name');
  }
  for (const key of Object.keys(manifest)) {
    if (!manifestFields.has(key)) errors.push(`unknown manifest field: ${key}`);
  }
  if (manifest.extensions !== undefined && (typeof manifest.extensions !== 'object' || Array.isArray(manifest.extensions))) {
    errors.push('extensions must be an object');
  }
  return errors;
}

export function validateMcpConfig(config) {
  const errors = [];
  if (!config || typeof config !== 'object' || Array.isArray(config)) return ['mcp.json must be an object'];
  if (config.$schema !== MCP_SCHEMA) errors.push('unsupported MCP schema');
  if (!config.mcpServers || typeof config.mcpServers !== 'object' || Array.isArray(config.mcpServers)) errors.push('mcpServers must be an object');
  else if (Object.keys(config.mcpServers).length === 0) errors.push('mcpServers must contain at least one server');
  else {
    for (const [name, server] of Object.entries(config.mcpServers)) {
      if (!server || typeof server !== 'object' || Array.isArray(server)) {
        errors.push(`${name}: server must be an object`);
        continue;
      }
      if (server.type !== 'stdio') errors.push(`${name}: type must be stdio`);
      if (typeof server.command !== 'string' || server.command.trim() === '') errors.push(`${name}: command must be a non-empty string`);
      if (!Array.isArray(server.args) || server.args.some((argument) => typeof argument !== 'string')) errors.push(`${name}: args must be an array of strings`);
      if (server.cwd !== undefined && typeof server.cwd !== 'string') errors.push(`${name}: cwd must be a string`);
    }
  }
  for (const key of Object.keys(config)) {
    if (!['$schema', 'mcpServers'].includes(key)) errors.push(`unknown MCP field: ${key}`);
  }
  return errors;
}
