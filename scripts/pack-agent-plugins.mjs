import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createPluginArchives } from '../lib/agent-plugins/archive.mjs';
import { loadPluginConfig } from '../lib/agent-plugins/config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(await (await import('node:fs/promises')).readFile(path.join(root, 'package.json'), 'utf8')).version;
const pluginNames = loadPluginConfig(path.join(root, 'agent-plugins.config.json')).filter(({ enabled }) => enabled).map(({ name }) => name);
const result = await createPluginArchives({ sourceRoot: path.join(root, 'agent-plugins'), outputRoot: path.join(root, 'dist', 'agent-plugins'), version, pluginNames });
console.log(`Packed ${result.archives.length} Agent Plugins.`);
