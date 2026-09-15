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

    if (entry.isFile()) {
      scanFileIfText(target);
    }
  }
}

function isExcludedDirectory(directory, name) {
  if (path.resolve(directory) === root && excludedDirectoryNames.has(name)) return true;
  const relative = toPosixPath(path.relative(root, path.join(directory, name)));
  return excludedSkillLabDirectories.has(relative);
}

function scanFileIfText(file) {
  const content = fs.readFileSync(file);
  const relative = toPosixPath(path.relative(root, file));
  const knownBinary = isKnownBinaryFile(relative);
  if (content.includes(0)) {
    if (!knownBinary) findings.push(`${relative}: must be valid UTF-8 text without NUL bytes`);
    return;
  }

  try {
    scanTextFile(file, new TextDecoder('utf-8', { fatal: true }).decode(content));
  } catch {
    if (!knownBinary) findings.push(`${relative}: must be valid UTF-8 text`);
  }
}

function isKnownBinaryFile(relative) {
  return new Set(['.bin', '.gif', '.ico', '.jpeg', '.jpg', '.png', '.webp', '.woff', '.woff2', '.zip']).has(path.extname(relative).toLowerCase());
}

function scanTextFile(file, content) {
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
