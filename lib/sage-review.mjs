import fs from 'node:fs';
import path from 'node:path';
import { createRootGuard, assertNoSymlinkParents, sha256 } from '../adapters/_shared/safe-fs.mjs';

export const REVIEW_PATHS = [
  'README.md', 'SKILL.md', 'AGENTS.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md', 'CHANGELOG.md', 'LICENSE',
  'catalog.json', 'package.json', 'package-lock.json', 'agent-plugins.config.json', 'vitest.config.mjs',
  'config',
  'docs', 'assets', 'agents', 'adapters', 'schemas', 'scripts', 'skills', 'bin', 'lib', 'mcp', 'packs',
  'tests', 'skill-lab', '.github/workflows', '.githooks', 'plugins', 'agent-plugins', 'openai',
  '.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json', 'templates',
];

function isLocalOnly(relative) {
  const parts = relative.replaceAll('\\', '/').split('/');
  const name = parts.at(-1);
  return name === '.env' || (name.startsWith('.env.') && name !== '.env.example') || name === '.npmrc'
    || /\.(?:private\.json|local\.ya?ml|log|pyc)$/.test(name)
    || parts.some(part => ['node_modules', '.venv', '__pycache__', 'raw-prompts', 'raw-responses'].includes(part))
    || relative.startsWith('skill-lab/.cache/') || relative === 'skill-lab/.cache'
    || (relative.startsWith('skill-lab/') && name === 'evidence.jsonl')
    || relative.startsWith('skill-lab/runs/') || relative === 'skill-lab/runs';
}

export function verifySagePacket({ sourceRoot, packetRoot, commit }) {
  const packet = createRootGuard(packetRoot);
  const source = createRootGuard(sourceRoot);
  const manifestPath = packet.resolve('manifest.json');
  assertNoSymlinkParents(packet, manifestPath);
  if (!fs.lstatSync(manifestPath).isFile()) throw new Error('invalid Sage manifest');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.version !== 1 || manifest.commit !== commit || manifest.workingTreeDirty || !Array.isArray(manifest.files) || !manifest.files.length) throw new Error('Sage review/source identity mismatch');
  const expected = sha256(JSON.stringify({ commit, workingTreeDirty: false, reviewPaths: manifest.reviewPaths, files: manifest.files }));
  if (expected !== manifest.packetSha256) throw new Error('Sage packet digest mismatch');
  const actualPaths = [];
  const visit = relative => {
    if (isLocalOnly(relative)) return;
    const target = source.resolve(relative);
    assertNoSymlinkParents(source, target);
    const stat = fs.lstatSync(target, { throwIfNoEntry: false });
    if (!stat) return;
    if (stat.isSymbolicLink()) throw new Error('Sage source inventory contains symlinks');
    if (stat.isDirectory()) for (const name of fs.readdirSync(target)) visit(`${relative}/${name}`);
    else if (stat.isFile()) actualPaths.push(relative);
    else throw new Error('Sage source inventory contains special files');
  };
  if (!Array.isArray(manifest.reviewPaths) || !manifest.reviewPaths.length) throw new Error('Sage packet requires a review scope');
  for (const relative of manifest.reviewPaths) visit(relative);
  if (JSON.stringify(actualPaths.sort()) !== JSON.stringify(manifest.files.map(file => file.path).sort())) throw new Error('Sage reviewed file inventory mismatch');
  for (const file of manifest.files) {
    for (const guard of [source, packet]) {
      const target = guard.resolve(file.path);
      assertNoSymlinkParents(guard, target);
      const stat = fs.lstatSync(target);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size !== file.bytes || sha256(fs.readFileSync(target)) !== file.sha256) throw new Error(`Sage reviewed file mismatch: ${file.path}`);
    }
  }
  return manifest;
}

export function buildSagePacket({ sourceRoot, commit, workingTreeDirty, includePaths = REVIEW_PATHS }) {
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('Sage packet requires an exact Git commit');
  const source = createRootGuard(sourceRoot);
  const output = source.resolve('dist/review/sage');
  assertNoSymlinkParents(source, output);
  if (fs.lstatSync(output, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error('Sage output must not be a symlink');
  // Resolve and validate the explicit repository-owned output before deleting it.
  const relativeOutput = path.relative(source.root, path.resolve(output));
  if (relativeOutput.split(path.sep).join('/') !== 'dist/review/sage') throw new Error('unsafe Sage output root');
  const files = [];
  const contents = new Map();
  const collect = relative => {
    if (isLocalOnly(relative)) return;
    const candidate = source.resolve(relative);
    assertNoSymlinkParents(source, candidate);
    const stat = fs.lstatSync(candidate, { throwIfNoEntry: false });
    if (!stat) return;
    if (stat.isSymbolicLink()) throw new Error(`Sage packet refuses symbolic links: ${relative}`);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(candidate).sort()) collect(`${relative}/${name}`);
    } else if (stat.isFile()) {
      const bytes = fs.readFileSync(candidate);
      contents.set(relative, bytes);
      files.push({ path: relative, bytes: bytes.length, sha256: sha256(bytes) });
    } else throw new Error(`Sage packet refuses special files: ${relative}`);
  };
  for (const relative of includePaths) collect(relative);
  files.sort((a, b) => a.path.localeCompare(b.path));
  if (!files.length) throw new Error('empty Sage packet');
  const packetSha256 = sha256(JSON.stringify({ commit, workingTreeDirty: Boolean(workingTreeDirty), reviewPaths: includePaths, files }));
  const manifest = { version: 1, repository: 'janpereira-dev/ngAutoPilot', commit, workingTreeDirty: Boolean(workingTreeDirty), reviewPaths: includePaths, packetSha256, generatedAt: new Date().toISOString(), approval: 'NOT_APPROVED', files };
  // Collect and validate everything before replacing the previous packet.
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
  for (const [relative, bytes] of contents) {
    const destination = path.join(output, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, bytes);
  }
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'REVIEW.md'), `# Sage review packet\n\nCommit: ${commit}\nDigest: ${packetSha256}\nWorking tree dirty: ${Boolean(workingTreeDirty)}\n\nStatus: NOT_APPROVED. Generation and green tests are not a security verdict.\nReview docs/sage-review.md and every high-risk changed file. Record the exact commit, packet digest, reviewer, verdict, findings, and evidence before approving the release-security environment.\n`);
  return { output, manifest };
}
