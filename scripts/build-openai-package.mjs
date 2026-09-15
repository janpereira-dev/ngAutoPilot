import fs from 'node:fs';
import path from 'node:path';
import { buildOpenAiPackage } from '../lib/openai-package.mjs';

const root = process.cwd();
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const result = await buildOpenAiPackage({ root, outputRoot: path.join(root, 'dist', 'openai-plugin'), version });
console.log(`Built ${path.basename(result.archivePath)} with ${result.files.length} files.`);