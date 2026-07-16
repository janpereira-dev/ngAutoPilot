import fs from 'node:fs';
import path from 'node:path';

const outputRoot = path.join('dist', 'review', 'sage');
const repository = 'janpereira-dev/ngAutoPilot';

const includePaths = [
  'README.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
  'CHANGELOG.md',
  'LICENSE',
  'catalog.json',
  'package.json',
  'docs',
  'assets',
  'agents',
  'adapters',
  'schemas',
  'scripts',
  'skills',
  '.github/workflows',
];

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

for (const relativePath of includePaths) {
  if (!fs.existsSync(relativePath)) {
    continue;
  }

  const source = path.resolve(relativePath);
  const target = path.join(outputRoot, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });

  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.cpSync(source, target, { recursive: true, force: true });
  } else {
    fs.copyFileSync(source, target);
  }
}

const manifest = {
  repository,
  generatedAt: new Date().toISOString(),
  purpose: 'Review the agent instructions, workflows, and publish automation with Sage or another compatible reviewer.',
  scope: includePaths,
  reviewFocus: [
    'unsafe shell execution',
    'provider lock-in',
    'broad file copy patterns',
    'workflow or script secrets leakage',
    'publish artifact overreach',
    'agent instruction permissiveness',
  ],
  sourceOfTruth: 'GitHub repository root',
};

const packetReadme = [
  '# Sage Review Packet',
  '',
  'This packet is generated for local review with Sage or another code-review agent.',
  '',
  `Repository: https://github.com/${repository}`,
  '',
  '## Includes',
  ...includePaths.map((item) => `- ${item}`),
  '',
  '## What to review',
  ...manifest.reviewFocus.map((item) => `- ${item}`),
];

fs.writeFileSync(path.join(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(outputRoot, 'README.md'), `${packetReadme.join('\n')}\n`, 'utf8');

console.log(`Prepared Sage review packet in ${toPosixPath(outputRoot)}`);

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
