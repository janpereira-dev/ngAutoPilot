import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const scanRoots = ['skills', 'agents', 'adapters', 'packs', 'scripts', 'docs', '.github/workflows', 'skill-lab'];
const rootFiles = ['SKILL.md', 'README.md', 'SECURITY.md', 'package.json'];
const allowedExtensions = new Set(['.json', '.md', '.mjs', '.py', '.toml', '.yml', '.yaml']);
const excludedDirectories = new Set(['.cache', '.venv', 'runs']);
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
  return relative.startsWith('skill-lab/') && excludedDirectories.has(name);
}

function scanFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const relative = toPosixPath(path.relative(root, file));

  reportMatches(relative, content, /^(?:<<<<<<<|=======|>>>>>>>)$/m, 'contains unresolved merge marker');
  reportMatches(relative, content, /[\u200B-\u200D\u2060\uFEFF\u202A-\u202E\u2066-\u2069]/, 'contains invisible or bidirectional Unicode control character');
  reportMatches(relative, content, /^\s*(?:curl|wget)\b[^\r\n|]*\|\s*(?:sudo\s+)?(?:ba)?sh\b/im, 'contains remote shell execution pipeline');
  reportMatches(relative, content, /^\s*(?:curl|iwr|irm|Invoke-WebRequest)\b[^\r\n|]*\|\s*(?:iex|Invoke-Expression)\b/im, 'contains remote PowerShell execution pipeline');
  reportMatches(relative, content, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'contains private key material');
  reportMatches(relative, content, /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|npm_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b/, 'contains credential-shaped token');

  if (path.basename(file) === 'SKILL.md') {
    scanSkillPermissions(relative, content);
  }
}

function scanSkillPermissions(relative, content) {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!frontmatter) {
    return;
  }

  const allowedTools = frontmatter[1].match(/^allowed-tools:\s*(.+)$/m)?.[1] ?? '';

  if (/\b(?:shell|bash|cmd|powershell|terminal|all)\b|\*/i.test(allowedTools)) {
    findings.push(`${relative}: allowed-tools grants broad shell access`);
  }
}

function reportMatches(relative, content, pattern, message) {
  if (pattern.test(content)) {
    findings.push(`${relative}: ${message}`);
  }
}

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
