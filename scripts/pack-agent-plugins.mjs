import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createPluginArchives } from '../lib/agent-plugins/archive.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(await (await import('node:fs/promises')).readFile(path.join(root, 'package.json'), 'utf8')).version;
const result = await createPluginArchives({ sourceRoot: path.join(root, 'agent-plugins'), outputRoot: path.join(root, 'dist', 'agent-plugins'), version });
console.log(`Packed ${result.archives.length} Agent Plugins.`);
