import fs from 'node:fs';
import path from 'node:path';

const [, , nextVersion] = process.argv;

if (!nextVersion || !/^\d+\.\d+\.\d+$/.test(nextVersion)) {
  console.error('Usage: node scripts/bump-release-version.mjs <x.y.z>');
  process.exit(1);
}

const previousVersion = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
const roots = [
  '.agents',
  '.claude-plugin',
  '.github',
  'docs',
  'plugins',
  'packs',
  'schemas',
  'scripts',
  'skills',
];
const rootFiles = ['catalog.json', 'package.json', 'README.md', 'CHANGELOG.md'];
const textExtensions = new Set(['.json', '.md', '.mjs', '.yml', '.yaml']);
let touched = 0;

for (const file of rootFiles) {
  replaceInFile(file, previousVersion, nextVersion);
}

for (const root of roots) {
  for (const file of findTextFiles(root)) {
    replaceInFile(file, previousVersion, nextVersion);
  }
}

console.log(`Updated ${touched} files from ${previousVersion} to ${nextVersion}.`);

function replaceInFile(file, from, to) {
  if (!fs.existsSync(file)) {
    return;
  }

  const content = fs.readFileSync(file, 'utf8');
  const nextContent = content.replaceAll(from, to);

  if (nextContent === content) {
    return;
  }

  fs.writeFileSync(file, nextContent, 'utf8');
  touched += 1;
}

function findTextFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const entries = fs.readdirSync(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);

    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...findTextFiles(fullPath));
      continue;
    }

    if (entry.isFile() && textExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}
