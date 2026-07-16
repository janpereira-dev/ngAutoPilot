import fs from 'node:fs';
import path from 'node:path';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;
const forbiddenVersionPattern = /\b0\.(?:1|2|3|4)\.\d+\b/g;
const roots = [
  '.agents',
  '.claude-plugin',
  '.github',
  'agents',
  'catalog.json',
  'docs',
  'package.json',
  'plugins',
  'README.md',
  'schemas',
  'scripts',
  'skills',
];
const textExtensions = new Set(['.json', '.md', '.mjs', '.yml', '.yaml']);
const errors = [];

for (const entry of roots) {
  for (const file of findTextFiles(entry)) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = [...content.matchAll(forbiddenVersionPattern)];

    if (matches.length > 0) {
      const values = [...new Set(matches.map((match) => match[0]))].join(', ');
      errors.push(`${toPosixPath(file)} contains previous release version(s): ${values}`);
    }
  }
}

const catalog = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));
if (catalog.version !== currentVersion) {
  errors.push(`catalog.json version ${catalog.version} does not match package.json ${currentVersion}`);
}

for (const skill of catalog.skills ?? []) {
  if (skill.version !== currentVersion) {
    errors.push(`${skill.path} catalog version ${skill.version} does not match ${currentVersion}`);
  }
}

for (const manifestPath of findTextFiles('plugins').filter((file) => file.endsWith('plugin.json'))) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  if (manifest.version !== currentVersion) {
    errors.push(`${toPosixPath(manifestPath)} version ${manifest.version} does not match ${currentVersion}`);
  }
}

for (const marketplacePath of ['.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json']) {
  const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));

  if (marketplace.version && marketplace.version !== currentVersion) {
    errors.push(`${marketplacePath} version ${marketplace.version} does not match ${currentVersion}`);
  }

  for (const plugin of marketplace.plugins ?? []) {
    if (plugin.version && plugin.version !== currentVersion) {
      errors.push(`${marketplacePath} plugin ${plugin.name} version ${plugin.version} does not match ${currentVersion}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Release version check failed:\n');

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(`Release version check passed for ${currentVersion}.`);

function findTextFiles(entryPath) {
  if (!fs.existsSync(entryPath)) {
    return [];
  }

  const stat = fs.statSync(entryPath);

  if (stat.isFile()) {
    return textExtensions.has(path.extname(entryPath)) ? [entryPath] : [];
  }

  const files = [];
  for (const entry of fs.readdirSync(entryPath, { withFileTypes: true })) {
    const fullPath = path.join(entryPath, entry.name);

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

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
