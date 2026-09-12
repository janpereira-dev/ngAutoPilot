import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  collectPackageEntries,
  createZip,
  isRegularFile,
  rewriteLocalReferences,
  validateArchiveFile,
  validateArchivePath,
} from '../lib/openai-package-archive.mjs';

function temporaryDirectory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-openai-archive-test-'));
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

test('collects regular files and directories in a deterministic archive order', async () => {
  const root = temporaryDirectory();
  const output = temporaryDirectory();
  try {
    fs.mkdirSync(path.join(root, 'assets', 'nested'), { recursive: true });
    fs.writeFileSync(path.join(root, 'plugin.json'), '{}\n', 'utf8');
    fs.writeFileSync(path.join(root, 'assets', 'nested', 'icon.svg'), '<svg/>\n', 'utf8');

    const entries = collectPackageEntries(root);
    assert.deepEqual(entries.map(({ name, type }) => ({ name, type })), [
      { name: 'assets', type: 'directory' },
      { name: 'assets/nested', type: 'directory' },
      { name: 'assets/nested/icon.svg', type: 'file' },
      { name: 'plugin.json', type: 'file' },
    ]);

    const first = path.join(output, 'first.zip');
    const second = path.join(output, 'second.zip');
    await createZip(root, first);
    await createZip(root, second);
    assert.deepEqual(validateArchiveFile(first), []);
    assert.equal(sha256(first), sha256(second));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test('rejects traversal paths and source directories outside the package root', () => {
  const root = temporaryDirectory();
  try {
    fs.writeFileSync(path.join(root, 'file.txt'), 'safe\n', 'utf8');
    assert.match(validateArchivePath('../file.txt').join('\n'), /parent_segment/);
    assert.throws(() => collectPackageEntries(root, path.join(root, '..')), /escapes root/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('fails closed for symlinks or junctions and escaped Markdown targets', (t) => {
  const root = temporaryDirectory();
  const outside = temporaryDirectory();
  try {
    const source = path.join(root, 'skills', 'sample', 'SKILL.md');
    const internal = path.join(root, 'skills', 'sample', 'asset.txt');
    const external = path.join(outside, 'secret.txt');
    fs.mkdirSync(path.dirname(source), { recursive: true });
    fs.writeFileSync(source, '# Sample\n', 'utf8');
    fs.writeFileSync(internal, 'internal\n', 'utf8');
    fs.writeFileSync(external, 'external\n', 'utf8');

    const link = path.join(root, 'linked-asset.txt');
    try {
      fs.symlinkSync(internal, link, process.platform === 'win32' ? 'file' : 'file');
    } catch (error) {
      t.skip(`symlink creation is unavailable on this host: ${error.code ?? error.message}`);
      return;
    }
    assert.equal(isRegularFile(link), false);
    assert.throws(() => collectPackageEntries(root), /symlink or junction/);
    assert.throws(
      () => rewriteLocalReferences('[linked](../../linked-asset.txt)', 'skills/sample/SKILL.md', root, path.join(root, 'generated'), path.join(root, 'generated', 'skills', 'sample', 'SKILL.md'), new Map()),
      /unresolvable local Markdown target/,
    );

    fs.unlinkSync(link);
    const escapedDirectory = path.join(root, 'escaped-directory');
    fs.symlinkSync(outside, escapedDirectory, process.platform === 'win32' ? 'junction' : 'dir');
    assert.throws(() => collectPackageEntries(root), /symlink or junction/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  }
});
