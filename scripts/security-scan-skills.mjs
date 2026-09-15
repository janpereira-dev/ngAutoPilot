import fs from 'node:fs';
import path from 'node:path';

import { scanCandidateSecurity } from '../skill-lab/lib/candidate-security.mjs';

const root = process.cwd();
const excludedSkillLabDirectories = new Set(['skill-lab/.cache', 'skill-lab/.venv', 'skill-lab/runs']);
const excludedDirectoryNames = new Set(['.git', 'dist', 'node_modules']);
const findings = [];

scanDirectory(root);

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

    if (entry.isFile() && isUtf8TextFile(target)) {
      scanFile(target);
    }
  }
}

function isExcludedDirectory(directory, name) {
  if (excludedDirectoryNames.has(name)) return true;
  const relative = toPosixPath(path.relative(root, path.join(directory, name)));
  return excludedSkillLabDirectories.has(relative);
}

function isUtf8TextFile(file) {
  const content = fs.readFileSync(file);
  if (content.includes(0)) return false;

  try {
    new TextDecoder('utf-8', { fatal: true }).decode(content);
    return true;
  } catch {
    return false;
  }
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
