import fs from 'node:fs';
import path from 'node:path';

import { scanCandidateSecurity } from '../skill-lab/lib/candidate-security.mjs';

const root = process.cwd();
const scanRoots = [
  'skills',
  'plugins',
  'agents',
  'adapters',
  'agent-plugins',
  'bin',
  'config',
  'lib',
  'mcp',
  'openai',
  'packs',
  'schemas',
  'scripts',
  'templates',
  'docs',
  '.agents',
  '.claude-plugin',
  '.githooks',
  '.github/workflows',
  'skill-lab',
];
const rootFiles = ['SKILL.md', 'README.md', 'SECURITY.md', 'package.json'];
const allowedExtensions = new Set(['.json', '.md', '.mjs', '.py', '.toml', '.yml', '.yaml']);
const scanAllFilesRoots = new Set(['.githooks']);
const excludedSkillLabDirectories = new Set(['skill-lab/.cache', 'skill-lab/.venv', 'skill-lab/runs']);
const findings = [];

for (const relativeRoot of scanRoots) {
  const directory = path.join(root, relativeRoot);

  if (fs.existsSync(directory)) {
    scanDirectory(directory, scanAllFilesRoots.has(relativeRoot));
  }
}

for (const relativeFile of rootFiles) {
  const file = path.join(root, relativeFile);

  if (fs.existsSync(file)) {
    scanFile(file);
  }
}

if (findings.length > 0) {
  console.error('Security content scan failed:\n');

  for (const finding of findings) {
    console.error(`- ${finding}`);
  }

  process.exit(1);
}

console.log('Security content scan passed.');

function scanDirectory(directory, scanAllFiles = false) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (isExcludedDirectory(directory, entry.name)) {
        continue;
      }

      scanDirectory(target, scanAllFiles);
      continue;
    }

    if (entry.isFile() && (scanAllFiles || allowedExtensions.has(path.extname(entry.name)))) {
      scanFile(target);
    }
  }
}

function isExcludedDirectory(directory, name) {
  const relative = toPosixPath(path.relative(root, path.join(directory, name)));
  return excludedSkillLabDirectories.has(relative);
}

function scanFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const relative = toPosixPath(path.relative(root, file));

  for (const finding of scanCandidateSecurity(content, {
    includeSkillPermissions: path.basename(file) === 'SKILL.md',
  })) {
    findings.push(`${relative}: ${finding}`);
  }
}

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
