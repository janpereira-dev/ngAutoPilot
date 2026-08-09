import fs from 'node:fs';
import path from 'node:path';

import { scanCandidateSecurity } from '../skill-lab/lib/candidate-security.mjs';

const root = process.cwd();
const scanRoots = ['skills', 'agents', 'adapters', 'packs', 'scripts', 'docs', '.github/workflows', 'skill-lab'];
const rootFiles = ['SKILL.md', 'README.md', 'SECURITY.md', 'package.json'];
const allowedExtensions = new Set(['.json', '.md', '.mjs', '.py', '.toml', '.yml', '.yaml']);
const excludedSkillLabDirectories = new Set(['skill-lab/.cache', 'skill-lab/.venv', 'skill-lab/runs']);
const findings = [];

for (const relativeRoot of scanRoots) {
  const directory = path.join(root, relativeRoot);

  if (fs.existsSync(directory)) {
    scanDirectory(directory);
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

function scanDirectory(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (isExcludedDirectory(directory, entry.name)) {
        continue;
      }

      scanDirectory(target);
      continue;
    }

    if (entry.isFile() && allowedExtensions.has(path.extname(entry.name))) {
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
