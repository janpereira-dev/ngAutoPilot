import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { integrity, publicationDecision, canPromoteLatest, verifyReleaseTag } from '../lib/release-publication.mjs';
import { safeReadSourceFile } from '../adapters/_shared/safe-fs.mjs';

const manifest = JSON.parse(safeReadSourceFile(process.cwd(), `${process.cwd()}/dist/release/release-inventory.json`));
verifyReleaseTag(manifest.version, process.env.RELEASE_TAG);
if (!process.env.npm_execpath) throw new Error('Run through npm run release:publish:npm');
const npm = (...args) => spawnSync(process.execPath, [process.env.npm_execpath, ...args, '--registry=https://registry.npmjs.org'], { encoding: 'utf8' });
const query = field => {
  const result = npm('view', `${manifest.npm.name}@${manifest.version}`, field, '--json');
  if (result.status === 0) return JSON.parse(result.stdout || 'null');
  if (/\bE404\b/.test(result.stderr)) return undefined;
  throw new Error(`npm registry query failed (${result.status}); publication stopped`);
};
const tarball = `dist/release/${manifest.npm.filename}`;
if (manifest.npm.filename !== `${manifest.npm.name}-${manifest.version}.tgz`) throw new Error('Invalid release tarball name');
const digest = integrity(safeReadSourceFile(process.cwd(), `${process.cwd()}/${tarball}`, null));
if (digest !== manifest.npm.integrity) throw new Error('Release tarball changed after inventory');
const latestResult = npm('view', manifest.npm.name, 'dist-tags.latest', '--json');
if (latestResult.status !== 0) throw new Error('Cannot verify npm latest before publication');
const current = JSON.parse(latestResult.stdout);
if (!canPromoteLatest(manifest.version, current)) throw new Error('Refusing to downgrade npm latest');
const decision = publicationDecision(digest, query('dist.integrity'));
if (decision === 'publish') {
  if (!process.env.NODE_AUTH_TOKEN) throw new Error('Configure RELEASE_NPM_TOKEN in the protected release-security environment');
  const result = npm('publish', `./${tarball}`, '--access', 'public', '--tag', 'latest', '--ignore-scripts');
  if (result.status !== 0) throw new Error(`npm publish failed (${result.status}); verify registry before retrying`);
} else if (current !== manifest.version) {
  const result = npm('dist-tag', 'add', `${manifest.npm.name}@${manifest.version}`, 'latest');
  if (result.status !== 0) throw new Error('Cannot promote the already-published version to latest');
}
if (query('dist.integrity') !== digest) throw new Error('Published npm archive integrity verification failed');
const latest = npm('view', manifest.npm.name, 'dist-tags.latest', '--json');
if (latest.status !== 0 || JSON.parse(latest.stdout) !== manifest.version) throw new Error('npm latest verification failed');
fs.writeFileSync('dist/release/npm-publication.json', JSON.stringify({ version: manifest.version, integrity: digest, status: 'PUBLISHED_VERIFIED', decision }, null, 2) + '\n');
console.log(`npm ${manifest.npm.name}@${manifest.version}: exact archive and latest verified`);
