import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { buildSagePacket, verifySagePacket } from '../../lib/sage-review.mjs';
import { sha256 } from '../../adapters/_shared/safe-fs.mjs';
const roots = [];
afterEach(() => { for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngap-sage-test-'));
  roots.push(root);
  fs.mkdirSync(path.join(root, 'bin'));
  fs.writeFileSync(path.join(root, 'README.md'), 'Original README\n');
  fs.writeFileSync(path.join(root, 'bin/cli.mjs'), 'export const safe = true;\n');
  return root;
}
describe('exact-commit Sage packet', () => {
  it('does not include local credentials, private captures, caches, or runtime logs', () => {
    const sourceRoot = fixture();
    for (const relative of ['bin/.env', 'bin/.npmrc', 'bin/.sl/store/private', 'bin/evidence.private.json', 'bin/provider.local.yaml', 'skill-lab/runs/private/evidence.jsonl', 'skill-lab/.cache/prompts.json', 'skill-lab/evidence.jsonl', 'skill-lab/benchmarks/custom/evidence.jsonl']) {
      const target = path.join(sourceRoot, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, 'PRIVATE_LOCAL_DATA');
    }
    fs.writeFileSync(path.join(sourceRoot, 'bin/.env.example'), 'PUBLIC_CONFIGURATION_EXAMPLE');
    const { output, manifest } = buildSagePacket({ sourceRoot, commit: 'a'.repeat(40), includePaths: ['README.md', 'bin', 'skill-lab'] });
    expect(manifest.files).toHaveLength(3);
    expect(fs.existsSync(path.join(output, 'bin/.env'))).toBe(false);
    expect(fs.existsSync(path.join(output, 'bin/.sl'))).toBe(false);
    expect(fs.existsSync(path.join(output, 'skill-lab/runs'))).toBe(false);
    expect(fs.existsSync(path.join(output, 'skill-lab/benchmarks/custom/evidence.jsonl'))).toBe(false);
    expect(fs.readFileSync(path.join(output, 'bin/.env.example'), 'utf8')).toBe('PUBLIC_CONFIGURATION_EXAMPLE');
    expect(verifySagePacket({ sourceRoot, packetRoot: output, commit: 'a'.repeat(40) }).files).toHaveLength(3);
  });
  it('reviews committed npm configuration but never copies untracked local registry credentials', () => {
    const sourceRoot = fixture();
    const git = (...args) => execFileSync('git', args, { cwd: sourceRoot, encoding: 'utf8' }).trim();
    git('init', '--quiet');
    fs.writeFileSync(path.join(sourceRoot, '.npmrc'), 'registry=https://registry.npmjs.org/\n');
    fs.writeFileSync(path.join(sourceRoot, 'bin/.npmrc'), '//registry.example/:_authToken=LOCAL_SECRET\n');
    git('add', 'README.md', '.npmrc', 'bin/cli.mjs');
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'test: npm configuration fixture');
    const commit = git('rev-parse', 'HEAD');
    const { output, manifest } = buildSagePacket({ sourceRoot, commit });
    expect(manifest.files.map(file => file.path)).toContain('.npmrc');
    expect(fs.readFileSync(path.join(output, '.npmrc'), 'utf8')).toBe('registry=https://registry.npmjs.org/\n');
    expect(fs.existsSync(path.join(output, 'bin/.npmrc'))).toBe(false);
    expect(verifySagePacket({ sourceRoot, packetRoot: output, commit }).commit).toBe(commit);
    fs.appendFileSync(path.join(sourceRoot, '.npmrc'), '//evil.example/:_authToken=${NODE_AUTH_TOKEN}\n');
    expect(() => verifySagePacket({ sourceRoot, packetRoot: output, commit })).toThrow(/file mismatch/);
  });
  it('includes the effective npm shrinkwrap lockfile and rejects changes after review', () => {
    const sourceRoot = fixture();
    const relative = 'npm-shrinkwrap.json';
    fs.writeFileSync(path.join(sourceRoot, relative), '{"name":"fixture","lockfileVersion":3,"packages":{}}\n');
    const commit = 'a'.repeat(40);
    const { output, manifest } = buildSagePacket({ sourceRoot, commit });
    expect(manifest.files.map(file => file.path)).toContain(relative);
    expect(fs.readFileSync(path.join(output, relative))).toEqual(fs.readFileSync(path.join(sourceRoot, relative)));
    fs.appendFileSync(path.join(sourceRoot, relative), '\nChanged dependency graph\n');
    expect(() => verifySagePacket({ sourceRoot, packetRoot: output, commit })).toThrow(/file mismatch/);
  });
  it('keeps hidden reviewed files in both upload workflows and verifies a real CI download', () => {
    const repository = path.resolve(import.meta.dirname, '../..');
    for (const filename of ['release.yml', 'sage-review.yml']) {
      const source = fs.readFileSync(path.join(repository, '.github/workflows', filename), 'utf8');
      const upload = source.match(/uses: actions\/upload-artifact@[^\n]+\n\s+with:\n([\s\S]*?)(?=\n\s+- (?:name|uses):|\n\n  [a-z]|$)/)?.[1];
      expect(upload).toMatch(/include-hidden-files: true/);
    }
    const source = fs.readFileSync(path.join(repository, '.github/workflows/sage-review.yml'), 'utf8');
    expect(source).toContain('actions/download-artifact@');
    expect(source).toContain('verifySagePacket');
  });
  it('includes repository ownership policy and rejects post-packet policy changes', () => {
    const sourceRoot = fixture();
    fs.mkdirSync(path.join(sourceRoot, '.github'));
    fs.writeFileSync(path.join(sourceRoot, '.github/CODEOWNERS'), '* @fixture-owner\n');
    const commit = 'a'.repeat(40);
    const { output, manifest } = buildSagePacket({ sourceRoot, commit });
    expect(manifest.files.map(file => file.path)).toContain('.github/CODEOWNERS');
    expect(fs.readFileSync(path.join(output, '.github/CODEOWNERS'), 'utf8')).toBe('* @fixture-owner\n');
    fs.appendFileSync(path.join(sourceRoot, '.github/CODEOWNERS'), 'Relaxed ownership\n');
    expect(() => verifySagePacket({ sourceRoot, packetRoot: output, commit })).toThrow(/file mismatch/);
  });
  it('includes published root instruction files and detects their semantic changes', () => {
    const sourceRoot = fixture();
    fs.writeFileSync(path.join(sourceRoot, 'SKILL.md'), '# Public root skill\n');
    fs.writeFileSync(path.join(sourceRoot, 'AGENTS.md'), '# Public root agent guidance\n');
    const { output, manifest } = buildSagePacket({ sourceRoot, commit: 'a'.repeat(40) });
    expect(manifest.files.map(file => file.path)).toContain('SKILL.md');
    expect(manifest.files.map(file => file.path)).toContain('AGENTS.md');
    fs.appendFileSync(path.join(sourceRoot, 'SKILL.md'), 'Changed authority\n');
    expect(() => verifySagePacket({ sourceRoot, packetRoot: output, commit: 'a'.repeat(40) })).toThrow(/file mismatch/);
  });
  it('binds authoritative test-gate and published runtime configuration to the review', () => {
    const sourceRoot = fixture();
    fs.writeFileSync(path.join(sourceRoot, 'vitest.config.mjs'), 'export default { test: { include: ["tests/scripts/**/*.spec.mjs"] } };\n');
    fs.mkdirSync(path.join(sourceRoot, 'config'));
    fs.writeFileSync(path.join(sourceRoot, 'config/defaults.json'), '{"safe":true}\n');
    const options = { sourceRoot, commit: 'a'.repeat(40) };
    const { output, manifest } = buildSagePacket(options);
    for (const relative of ['vitest.config.mjs', 'config/defaults.json']) {
      expect(manifest.files.map(file => file.path)).toContain(relative);
      const original = fs.readFileSync(path.join(sourceRoot, relative));
      expect(fs.readFileSync(path.join(output, relative))).toEqual(original);
      fs.appendFileSync(path.join(sourceRoot, relative), '\nChanged gate\n');
      expect(() => verifySagePacket({ sourceRoot, packetRoot: output, commit: options.commit })).toThrow(/file mismatch/);
      fs.writeFileSync(path.join(sourceRoot, relative), original);
    }
  });
  it('verifies commit and every byte before publishing; tampering fails closed', () => {
    const sourceRoot = fixture();
    const options = { sourceRoot, commit: 'a'.repeat(40), includePaths: ['README.md', 'bin'] };
    const { output } = buildSagePacket(options);
    expect(verifySagePacket({ sourceRoot, packetRoot: output, commit: options.commit }).commit).toBe(options.commit);
    expect(() => verifySagePacket({ sourceRoot, packetRoot: output, commit: 'b'.repeat(40) })).toThrow();
    fs.appendFileSync(path.join(sourceRoot, 'bin/cli.mjs'), '// tampered\n');
    expect(() => verifySagePacket({ sourceRoot, packetRoot: output, commit: options.commit })).toThrow(/file mismatch/);
    buildSagePacket(options);
    fs.appendFileSync(path.join(output, 'README.md'), 'altered');
    expect(() => verifySagePacket({ sourceRoot, packetRoot: output, commit: options.commit })).toThrow(/file mismatch/);
    buildSagePacket(options);
    fs.writeFileSync(path.join(sourceRoot, 'bin/extra.mjs'), 'unexpected');
    expect(() => verifySagePacket({ sourceRoot, packetRoot: output, commit: options.commit })).toThrow(/inventory mismatch/);
  });
  it('preserves source bytes and records hashes without claiming approval', () => {
    const sourceRoot = fixture();
    const options = { sourceRoot, commit: 'a'.repeat(40), workingTreeDirty: false, includePaths: ['README.md', 'bin'] };
    const first = buildSagePacket(options);
    expect(first.manifest.approval).toBe('NOT_APPROVED');
    expect(first.manifest.files).toHaveLength(2);
    expect(fs.readFileSync(path.join(first.output, 'README.md'), 'utf8')).toBe('Original README\n');
    for (const file of first.manifest.files) expect(sha256(fs.readFileSync(path.join(first.output, file.path)))).toBe(file.sha256);
    expect(buildSagePacket(options).manifest.packetSha256).toBe(first.manifest.packetSha256);
    expect(buildSagePacket({ ...options, commit: 'b'.repeat(40) }).manifest.packetSha256).not.toBe(first.manifest.packetSha256);
    fs.appendFileSync(path.join(sourceRoot, 'bin/cli.mjs'), '// change\n');
    expect(buildSagePacket(options).manifest.packetSha256).not.toBe(first.manifest.packetSha256);
    expect(buildSagePacket({ ...options, workingTreeDirty: true }).manifest.workingTreeDirty).toBe(true);
  });
  it('rejects missing identity and source traversal before replacing the old packet', () => {
    const sourceRoot = fixture();
    const options = { sourceRoot, commit: 'a'.repeat(40), includePaths: ['README.md'] };
    const first = buildSagePacket(options);
    const before = fs.readFileSync(path.join(first.output, 'manifest.json'));
    expect(() => buildSagePacket({ ...options, commit: 'main' })).toThrow(/exact Git commit/);
    expect(() => buildSagePacket({ ...options, includePaths: ['../outside.md'] })).toThrow();
    expect(fs.readFileSync(path.join(first.output, 'manifest.json'))).toEqual(before);
  });
  it('rejects symlinked source and output parents without touching external files', () => {
    const sourceRoot = fixture();
    const outside = fixture();
    fs.symlinkSync(outside, path.join(sourceRoot, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
    expect(() => buildSagePacket({ sourceRoot, commit: 'a'.repeat(40), includePaths: ['linked'] })).toThrow(/symbolic links/);
    fs.symlinkSync(outside, path.join(sourceRoot, 'dist'), process.platform === 'win32' ? 'junction' : 'dir');
    expect(() => buildSagePacket({ sourceRoot, commit: 'a'.repeat(40), includePaths: ['README.md'] })).toThrow();
    expect(fs.readFileSync(path.join(outside, 'README.md'), 'utf8')).toBe('Original README\n');
  });
});
