import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { safeReadSourceFile, createRootGuard, assertNoSymlinkParents } from '../adapters/_shared/safe-fs.mjs';
import { integrity, packResult } from '../lib/release-publication.mjs';

const root = createRootGuard(process.cwd());
const readJson = relative => JSON.parse(safeReadSourceFile(root.root, root.resolve(relative)));
const pkg = readJson('package.json');
if (execFileSync('git', ['status', '--porcelain', '--untracked-files=normal'], { encoding: 'utf8' }).trim()) throw new Error('Release inventory requires a clean reviewed checkout');
const catalog = readJson('catalog.json');
if (catalog.version !== pkg.version) throw new Error('Catalog and release versions differ');
const output = root.resolve('dist/release');
assertNoSymlinkParents(root, output);
fs.mkdirSync(output, { recursive: true });
if (!process.env.npm_execpath) throw new Error('Run inventory through npm run release:inventory');
const packed = packResult(JSON.parse(execFileSync(process.execPath, [process.env.npm_execpath, 'pack', '--json', '--ignore-scripts', '--pack-destination', output], { encoding: 'utf8' })), pkg.name);
const bytes = safeReadSourceFile(root.root, path.join(output, packed.filename), null);
if (integrity(bytes) !== packed.integrity) throw new Error('npm tarball integrity mismatch');
const packedPaths = new Set(packed.files.map(file => file.path));
for (const skill of catalog.skills) if (!packedPaths.has(skill.path)) throw new Error(`npm archive omits ${skill.path}`);
for (const file of ['README.md', 'README.es.md', 'assets/first-run.svg', 'assets/first-run.es.svg']) {
  if (!packedPaths.has(file)) throw new Error(`npm archive omits ${file}`);
}
const artifacts = [];
const collect = relative => {
  const file = root.resolve(relative);
  assertNoSymlinkParents(root, file);
  const stat = fs.lstatSync(file, { throwIfNoEntry: false });
  if (!stat) return;
  if (stat.isSymbolicLink()) throw new Error('Release inventory refuses symlinks');
  if (stat.isDirectory()) for (const name of fs.readdirSync(file).sort()) collect(`${relative}/${name}`);
  else if (stat.isFile() && /\.(?:tgz|tar\.gz|zip)$/.test(relative)) artifacts.push({ path: relative, bytes: stat.size, sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') });
};
for (const relative of ['dist/release', 'dist/publish', 'dist/agent-plugins', 'dist/openai-plugin']) collect(relative);
if (process.argv.includes('--require-bundles')) {
  const names = readJson('agent-plugins.config.json').plugins.filter(plugin => plugin.enabled).map(plugin => plugin.name);
  const paths = new Set(artifacts.map(artifact => artifact.path));
  for (const name of names) if (!paths.has(`dist/agent-plugins/${name}-${pkg.version}.zip`)) throw new Error(`Missing agent plugin archive: ${name}`);
  if (!paths.has(`dist/openai-plugin/ngautopilot-skills-${pkg.version}.zip`)) throw new Error('Missing OpenAI skills archive');
  if (artifacts.filter(artifact => artifact.path.startsWith('dist/publish/') && artifact.path.endsWith('.tar.gz')).length !== 5) throw new Error('Expected all five directory submission archives');
}
const targets = readJson('config/publication-targets.json');
const pythonReportPath = 'dist/security/python-dependency-audit.json';
let pythonAudit;
if (fs.existsSync(root.resolve(pythonReportPath))) {
  const reportBytes = safeReadSourceFile(root.root, root.resolve(pythonReportPath), null);
  const report = JSON.parse(reportBytes);
  if (!Array.isArray(report.dependencies) || !report.dependencies.length
    || report.dependencies.some(dependency => !Array.isArray(dependency.vulns) || dependency.vulns.length || dependency.skip_reason)) {
    throw new Error('Python audit report must contain a complete dependency resolution without known vulnerabilities');
  }
  pythonAudit = { path: pythonReportPath, sha256: crypto.createHash('sha256').update(reportBytes).digest('hex'),
    status: 'RESOLVED_DEPENDENCY_SNAPSHOT', dependencyCount: report.dependencies.length };
} else if (process.argv.includes('--require-bundles')) throw new Error('Complete release inventory requires the Python dependency audit report');
const pythonSources = execFileSync('git', ['ls-files', '-z', '--', '*.py', '**/pyproject.toml', '**/requirements*.txt'], { encoding: 'utf8' })
  .split('\0').filter(Boolean).sort().map(sourcePath => {
    const bytes = safeReadSourceFile(root.root, root.resolve(sourcePath), null);
    return { path: sourcePath, bytes: bytes.length,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex'), includedInNpm: packedPaths.has(sourcePath) };
  });
const manifest = {
  schemaVersion: 1, version: pkg.version,
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  publicationStatus: 'BUILT_NOT_PUBLISHED',
  npm: { name: pkg.name, version: pkg.version, filename: packed.filename, integrity: packed.integrity, files: packed.files },
  python: { publicationStatus: 'INTERNAL_NOT_PYPI', manifest: 'skill-lab/python/pyproject.toml', files: pythonSources, audit: pythonAudit },
  catalog: { skills: catalog.skills.map(({ id, path: sourcePath }) => ({ id, path: sourcePath })), packs: fs.readdirSync(root.resolve('packs')).filter(name => name.endsWith('.json')).sort() },
  artifacts, targets: targets.targets,
};
fs.writeFileSync(path.join(output, 'release-inventory.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Inventoried ${catalog.skills.length} source skills, ${packed.files.length} npm files, ${artifacts.length} archives; no remote publication claimed.`);
