import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  MAX_ARCHIVE_BYTES,
  MAX_ARCHIVE_ENTRIES,
  MAX_ARCHIVE_FILE_BYTES,
  MAX_ARCHIVE_UNCOMPRESSED_BYTES,
  collectPackageEntries,
  createZip,
  isRegularFile,
  rewriteLocalReferences,
  validateArchiveEntries,
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

test('rejects symlinks or junctions in the copied destination path', (t) => {
  const root = temporaryDirectory();
  const packageRoot = path.join(root, 'package');
  const outside = temporaryDirectory();
  try {
    const source = path.join(root, 'skills', 'sample', 'SKILL.md');
    const localTarget = path.join(root, 'skills', 'sample', 'guide.md');
    fs.mkdirSync(path.dirname(source), { recursive: true });
    fs.writeFileSync(source, '# Sample\n', 'utf8');
    fs.writeFileSync(localTarget, 'guide\n', 'utf8');
    fs.mkdirSync(packageRoot, { recursive: true });
    fs.writeFileSync(path.join(outside, 'sentinel.txt'), 'sentinel\n', 'utf8');

    const linkType = process.platform === 'win32' ? 'junction' : 'dir';
    try {
      fs.symlinkSync(outside, path.join(packageRoot, 'skills'), linkType);
    } catch (error) {
      t.skip(`symlink or junction creation is unavailable on this host: ${error.code ?? error.message}`);
      return;
    }

    assert.throws(
      () => rewriteLocalReferences(
        '[guide](./guide.md)',
        'skills/sample/SKILL.md',
        root,
        packageRoot,
        path.join(packageRoot, 'skills', 'sample', 'SKILL.md'),
        new Map(),
      ),
      /unsafe package destination|destination.*symlink|destination.*root/i,
    );
    assert.equal(fs.existsSync(path.join(outside, 'sample', 'guide.md')), false);

    fs.unlinkSync(path.join(packageRoot, 'skills'));
    fs.rmSync(packageRoot, { recursive: true, force: true });
    fs.symlinkSync(outside, packageRoot, linkType);
    assert.throws(
      () => rewriteLocalReferences(
        '[guide](./guide.md)',
        'skills/sample/SKILL.md',
        root,
        packageRoot,
        path.join(packageRoot, 'skills', 'sample', 'SKILL.md'),
        new Map(),
      ),
      /unsafe package destination|destination.*symlink|destination.*root/i,
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  }
});

test('rejects normalized file-versus-descendant conflicts', () => {
  const errors = validateArchiveEntries([
    { name: 'foo', type: 'file' },
    { name: 'FOO/bar', type: 'directory' },
  ]);
  assert.match(errors.join('\n'), /archive_member_path_type_conflict: foo/);

  const normalizedErrors = validateArchiveEntries([
    { name: 'ＦＯＯ', type: 'file' },
    { name: 'foo/bar', type: 'directory' },
  ]);
  assert.match(normalizedErrors.join('\n'), /archive_member_path_type_conflict: ＦＯＯ/);
});

test('rejects Windows-special archive path segments', () => {
  for (const segment of ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM9', 'LPT1', 'LPT9', 'CON.txt', 'name.', 'name ', 'file:stream', 'ＣＯＮ', 'name．', 'file：stream']) {
    assert.match(validateArchivePath(`safe/${segment}/file`).join('\n'), /windows|device|colon|trailing/i, segment);
  }
});

test('accepts explicit directory members with one terminal slash only', () => {
  assert.deepEqual(validateArchivePath('assets/'), []);
  assert.deepEqual(validateArchiveEntries([{ name: 'assets/', type: 'directory' }]), []);
  assert.match(validateArchivePath('assets//file').join('\n'), /empty_segment/);
  assert.match(validateArchiveEntries([{ name: 'assets/', type: 'file' }]).join('\n'), /directory_marker/);
});

test('rejects oversized archives before reading their contents', () => {
  const directory = temporaryDirectory();
  const archive = path.join(directory, 'oversized.zip');
  try {
    fs.writeFileSync(archive, Buffer.alloc(1), 'binary');
    fs.truncateSync(archive, MAX_ARCHIVE_BYTES + 1);
    assert.deepEqual(validateArchiveFile(archive), [
      `archive is ${MAX_ARCHIVE_BYTES + 1} bytes; maximum is ${MAX_ARCHIVE_BYTES}`,
    ]);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('enforces the archive entry limit before conflict scanning', () => {
  const entries = Array.from({ length: MAX_ARCHIVE_ENTRIES + 1 }, (_, index) => ({
    name: `entry-${index}`,
    type: 'file',
  }));
  assert.deepEqual(validateArchiveEntries(entries), [
    `archive has ${MAX_ARCHIVE_ENTRIES + 1} entries; maximum is ${MAX_ARCHIVE_ENTRIES}`,
  ]);
});

test('enforces package size bounds before opening the output', async () => {
  const root = temporaryDirectory();
  const output = path.join(temporaryDirectory(), 'archive.zip');
  try {
    fs.writeFileSync(path.join(root, 'oversized.bin'), Buffer.alloc(0));
    fs.truncateSync(path.join(root, 'oversized.bin'), MAX_ARCHIVE_FILE_BYTES + 1);
    await assert.rejects(() => createZip(root, output), /per-file limit/);
    assert.equal(fs.existsSync(output), false);

    fs.rmSync(path.join(root, 'oversized.bin'));
    const aggregateFileSize = Math.floor(MAX_ARCHIVE_UNCOMPRESSED_BYTES / 6) + 1;
    for (let index = 0; index < 6; index += 1) {
      const aggregateFile = path.join(root, `aggregate-${index}.bin`);
      fs.writeFileSync(aggregateFile, Buffer.alloc(0));
      fs.truncateSync(aggregateFile, aggregateFileSize);
    }
    await assert.rejects(() => createZip(root, output), new RegExp(`maximum is ${MAX_ARCHIVE_UNCOMPRESSED_BYTES}`));
    assert.equal(fs.existsSync(output), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(path.dirname(output), { recursive: true, force: true });
  }
});

test('rejects output archives contained by the input root before opening them', async () => {
  const root = temporaryDirectory();
  const output = path.join(root, 'archive.zip');
  try {
    fs.writeFileSync(path.join(root, 'plugin.json'), '{}\n', 'utf8');
    fs.writeFileSync(output, 'sentinel\n', 'utf8');
    await assert.rejects(() => createZip(root, output), /output.*inside|output.*contained|package root/i);
    assert.equal(fs.readFileSync(output, 'utf8'), 'sentinel\n');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects missing output files reached through input-root symlink aliases', async (t) => {
  const root = temporaryDirectory();
  const aliasParent = path.join(root, '..', `${path.basename(root)}-alias`);
  try {
    fs.writeFileSync(path.join(root, 'plugin.json'), '{}\n', 'utf8');
    const linkType = process.platform === 'win32' ? 'junction' : 'dir';
    try {
      fs.symlinkSync(root, aliasParent, linkType);
    } catch (error) {
      t.skip(`symlink or junction creation is unavailable on this host: ${error.code ?? error.message}`);
      return;
    }
    const output = path.join(aliasParent, 'new-archive.zip');
    await assert.rejects(() => createZip(root, output), /output.*inside|output.*contained|package root/i);
    assert.equal(fs.existsSync(path.join(root, 'new-archive.zip')), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(aliasParent, { recursive: true, force: true });
  }
});

test('anchors ZIP parsing to the declared central-directory region', async () => {
  const root = temporaryDirectory();
  const output = temporaryDirectory();
  try {
    fs.writeFileSync(path.join(root, 'plugin.json'), '{}\n', 'utf8');
    const valid = path.join(output, 'valid.zip');
    await createZip(root, valid);
    assert.deepEqual(validateArchiveFile(valid), []);

    const data = fs.readFileSync(valid);
    const eocdSignature = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
    const eocdOffset = data.lastIndexOf(eocdSignature);
    assert.notEqual(eocdOffset, -1);

    const truncated = path.join(output, 'truncated.zip');
    fs.writeFileSync(truncated, data.subarray(0, eocdOffset));
    assert.match(validateArchiveFile(truncated).join('\n'), /end-of-central-directory/i);

    const malformed = Buffer.from(data);
    malformed.writeUInt32LE(1, eocdOffset + 12);
    const malformedPath = path.join(output, 'malformed.zip');
    fs.writeFileSync(malformedPath, malformed);
    assert.match(validateArchiveFile(malformedPath).join('\n'), /central-directory/i);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test('rejects central entries whose local records are malformed or inconsistent', async () => {
  const root = temporaryDirectory();
  const output = temporaryDirectory();
  try {
    fs.writeFileSync(path.join(root, 'plugin.json'), '{}\n', 'utf8');
    const valid = path.join(output, 'valid.zip');
    await createZip(root, valid);
    const data = fs.readFileSync(valid);
    const centralOffset = data.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
    assert.notEqual(centralOffset, -1);

    const cases = [
      ['signature', (candidate) => candidate.writeUInt32LE(0, 0)],
      ['method', (candidate) => candidate.writeUInt16LE(0, 8)],
      ['name', (candidate) => candidate[30] ^= 0x01],
      ['local-size', (candidate) => candidate.writeUInt32LE(1, 18)],
      ['compressed-size', (candidate) => candidate.writeUInt32LE(data.length, centralOffset + 20)],
      ['offset', (candidate) => candidate.writeUInt32LE(candidate.length, centralOffset + 42)],
    ];
    for (const [label, mutate] of cases) {
      const malformed = Buffer.from(data);
      mutate(malformed);
      const archive = path.join(output, `${label}.zip`);
      fs.writeFileSync(archive, malformed);
      assert.match(validateArchiveFile(archive).join('\n'), /local record|compressed payload|central-directory/i, label);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test('rewrites only standalone local references and preserves external URLs', () => {
  const publicPaths = new Map([['skills/sample/SKILL.md', './skills/sample/SKILL.md']]);
  const body = [
    '[remote](https://example.test/skills/sample/SKILL.md?remote=1#fragment)',
    'external query https://example.test/?next=skills/sample/SKILL.md&remote=1',
    'local skills/sample/SKILL.md?local=2#fragment.',
    'unrelated myskills/sample/SKILL.md',
    'unrelated skills/sample/SKILL.md.bak',
  ].join('\n');
  assert.equal(
    rewriteLocalReferences(body, 'skills/sample/SKILL.md', 'repository', 'package', 'package/skills/sample/SKILL.md', publicPaths),
    [
      '[remote](https://example.test/skills/sample/SKILL.md?remote=1#fragment)',
      'external query https://example.test/?next=skills/sample/SKILL.md&remote=1',
      'local ./skills/sample/SKILL.md?local=2#fragment.',
      'unrelated myskills/sample/SKILL.md',
      'unrelated skills/sample/SKILL.md.bak',
    ].join('\n'),
  );
});
