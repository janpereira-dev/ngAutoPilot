import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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
