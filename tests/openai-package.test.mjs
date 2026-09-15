import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildOpenAiPackage, CANONICAL_SKILL_COUNT, createTemporaryOutputRoot, MAX_ARCHIVE_BYTES, MAX_ARCHIVE_ENTRIES, validateArchiveEntries, validateArchiveFile, validateGeneratedPackageReferences, validateOpenAiPackage } from '../lib/openai-package.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

test('validates the skills-only OpenAI package against the canonical skills tree', async () => {
  const result = await validateOpenAiPackage({ root });
  assert.deepEqual(result.errors, []);
  assert.equal(result.skillFiles, CANONICAL_SKILL_COUNT);
});

test('builds a bounded reproducible public archive in independent staging directories', async () => {
  const firstOutput = createTemporaryOutputRoot();
  const secondOutput = createTemporaryOutputRoot();
  try {
    const [first, second] = await Promise.all([
      buildOpenAiPackage({ root, outputRoot: firstOutput }),
      buildOpenAiPackage({ root, outputRoot: secondOutput }),
    ]);
    assert.ok(fs.existsSync(first.archivePath));
    assert.ok(fs.statSync(first.archivePath).size < MAX_ARCHIVE_BYTES);
    assert.ok(first.files.length < MAX_ARCHIVE_ENTRIES);
    assert.equal(sha256(first.archivePath), sha256(second.archivePath));
    const skills = fs.readdirSync(path.join(first.packageRoot, 'skills'), { withFileTypes: true });
    assert.equal(skills.length, CANONICAL_SKILL_COUNT);
    assert.ok(skills.every((entry) => entry.isDirectory()));
    assert.ok(skills.every((entry) => fs.readdirSync(path.join(first.packageRoot, 'skills', entry.name)).join(',') === 'SKILL.md'));
    assert.ok(skills.every((entry) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name) && entry.name.length <= 45));
    assert.ok(skills.every((entry) => fs.readFileSync(path.join(first.packageRoot, 'skills', entry.name, 'SKILL.md'), 'utf8').match(new RegExp(`^name: ["']?${entry.name}["']?$`, 'm'))));
    const metadata = JSON.parse(fs.readFileSync(path.join(first.packageRoot, 'skill-metadata.json'), 'utf8'));
    assert.equal(metadata.skills.length, CANONICAL_SKILL_COUNT);
    assert.ok(metadata.skills.every((skill) => skill.id && skill.name && skill.sourcePath && skill.frontmatter));
    assert.ok(metadata.skills.every((skill) => fs.readFileSync(path.join(first.packageRoot, 'skills', skill.publicName, 'SKILL.md'), 'utf8').replace(/^---[\s\S]*?---\r?\n/, '').trim().length > 0));
    assert.equal(fs.existsSync(path.join(first.packageRoot, 'skills', 'README.md')), false);
    assert.equal(fs.existsSync(path.join(first.packageRoot, 'mcp.json')), false);
    assert.deepEqual(validateGeneratedPackageReferences(first.packageRoot), []);
    assert.ok(fs.existsSync(path.join(first.packageRoot, 'resources', 'docs', 'design-excellence-guide.md')));
    for (const skill of skills) assert.doesNotMatch(fs.readFileSync(path.join(first.packageRoot, 'skills', skill.name, 'SKILL.md'), 'utf8'), /\bskills\/[\w.-]+(?:\/[\w.-]+)*\/SKILL\.md\b/);
  } finally {
    fs.rmSync(firstOutput, { recursive: true, force: true });
    fs.rmSync(secondOutput, { recursive: true, force: true });
  }
});

test('rejects the known-invalid dotted OpenAI extension shape', async () => {
  const temporary = fs.mkdtempSync(path.join(path.dirname(root), 'ngautopilot-openai-test-'));
  try {
    for (const entry of ['package.json', 'LICENSE', 'skills', 'openai', 'docs']) fs.cpSync(path.join(root, entry), path.join(temporary, entry), { recursive: true });
    const manifestPath = path.join(temporary, 'openai', 'plugin.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.$schema = 'https://example.test/unsupported.schema.json';
    manifest.unexpected = true;
    manifest.extensions['com.openai.interface'] = manifest.extensions['com.openai'];
    delete manifest.extensions['com.openai'];
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    const result = await validateOpenAiPackage({ root: temporary });
    assert.match(result.errors.join('\n'), /must not use a dotted com\.openai\.interface key/);
    assert.match(result.errors.join('\n'), /must define extensions\.com\.openai/);
    assert.match(result.errors.join('\n'), /plugin\.json unsupported plugin schema/);
    assert.match(result.errors.join('\n'), /plugin\.json unknown manifest field: unexpected/);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('refuses to clean a caller-controlled output path outside the approved roots', async () => {
  const sibling = path.join(path.dirname(root), `ngautopilot-untrusted-${process.pid}`);
  fs.mkdirSync(sibling, { recursive: true });
  const sentinel = path.join(sibling, 'sentinel.txt');
  const output = createTemporaryOutputRoot();
  fs.writeFileSync(sentinel, 'preserve', 'utf8');
  try {
    for (const outputRoot of [root, path.dirname(root), sibling, path.join(root, 'dist')]) {
      await assert.rejects(() => buildOpenAiPackage({ root, outputRoot }), /refusing to clean untrusted output path/);
    }
    await assert.rejects(() => buildOpenAiPackage({ root, outputRoot: output, version: '../../outside' }), /safe SemVer value/);
    assert.equal(fs.readFileSync(sentinel, 'utf8'), 'preserve');
  } finally {
    fs.rmSync(sibling, { recursive: true, force: true });
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test('refuses to clean an allowed output beneath a symlinked parent', async (t) => {
  const temporary = fs.mkdtempSync(path.join(path.dirname(root), 'ngautopilot-openai-output-link-'));
  const outside = fs.mkdtempSync(path.join(path.dirname(root), 'ngautopilot-openai-output-outside-'));
  try {
    for (const entry of ['package.json', 'LICENSE', 'skills', 'openai', 'docs']) fs.cpSync(path.join(root, entry), path.join(temporary, entry), { recursive: true });
    const dist = path.join(temporary, 'dist');
    try {
      fs.symlinkSync(outside, dist, process.platform === 'win32' ? 'junction' : 'dir');
    } catch (error) {
      t.skip(`symlink or junction creation is unavailable on this host: ${error.code ?? error.message}`);
      return;
    }
    await assert.rejects(
      () => buildOpenAiPackage({ root: temporary, outputRoot: path.join(dist, 'openai-plugin') }),
      /symlinked or non-directory output parent/,
    );
    assert.deepEqual(fs.readdirSync(outside), []);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  }
});

test('rejects legacy URL aliases instead of accepting them', async () => {
  const temporary = fs.mkdtempSync(path.join(path.dirname(root), 'ngautopilot-openai-alias-'));
  try {
    for (const entry of ['package.json', 'LICENSE', 'skills', 'openai', 'docs']) fs.cpSync(path.join(root, entry), path.join(temporary, entry), { recursive: true });
    const manifestPath = path.join(temporary, 'openai', 'plugin.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const interfaceMetadata = manifest.extensions['com.openai'].interface;
    interfaceMetadata.website = interfaceMetadata.websiteURL;
    interfaceMetadata.supportUrl = interfaceMetadata.supportURL;
    interfaceMetadata.privacyPolicyUrl = interfaceMetadata.privacyPolicyURL;
    interfaceMetadata.termsOfServiceUrl = interfaceMetadata.termsOfServiceURL;
    interfaceMetadata.screenshots = [];
    delete interfaceMetadata.websiteURL;
    delete interfaceMetadata.supportURL;
    delete interfaceMetadata.privacyPolicyURL;
    delete interfaceMetadata.termsOfServiceURL;
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    const result = await validateOpenAiPackage({ root: temporary });
    assert.match(result.errors.join('\n'), /missing websiteURL/);
    assert.match(result.errors.join('\n'), /unsupported: website/);
    assert.match(result.errors.join('\n'), /missing supportURL/);
    assert.match(result.errors.join('\n'), /unsupported: supportUrl/);
    assert.match(result.errors.join('\n'), /must not define interface\.screenshots/);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('rejects official unsafe archive path and collision classes', () => {
  const cases = [
    [{ name: '', type: 'file' }, 'archive_member_path_empty'],
    [{ name: ' file.txt', type: 'file' }, 'archive_member_path_has_outer_whitespace'],
    [{ name: 'file.txt ', type: 'file' }, 'archive_member_path_has_outer_whitespace'],
    [{ name: 'a\\b.txt', type: 'file' }, 'archive_member_path_has_backslash'],
    [{ name: '/file.txt', type: 'file' }, 'archive_member_path_absolute'],
    [{ name: 'C:/file.txt', type: 'file' }, 'archive_member_path_absolute'],
    [{ name: 'a//file.txt', type: 'file' }, 'archive_member_path_has_empty_segment'],
    [{ name: 'a/./file.txt', type: 'file' }, 'archive_member_path_has_dot_segment'],
    [{ name: 'a/../file.txt', type: 'file' }, 'archive_member_path_has_parent_segment'],
    [{ name: `${'a/'.repeat(20)}file.txt`, type: 'file' }, 'archive_member_path_too_deep'],
    [{ name: `${'a'.repeat(1_025)}.txt`, type: 'file' }, 'archive_member_path_too_long'],
  ];
  for (const [entry, errorCode] of cases) assert.ok(validateArchiveEntries([entry]).some((error) => error.startsWith(errorCode)), errorCode);
  assert.ok(validateArchiveEntries([{ name: 'A.txt', type: 'file' }, { name: 'a.txt', type: 'file' }]).some((error) => error.startsWith('archive_member_path_normalization_collision')));
  assert.ok(validateArchiveEntries([{ name: 'café.txt', type: 'file' }, { name: 'cafe\u0301.txt', type: 'file' }]).some((error) => error.startsWith('archive_member_path_normalization_collision')));
  assert.ok(validateArchiveEntries([{ name: 'same.txt', type: 'file' }, { name: 'same.txt', type: 'file' }]).some((error) => error.startsWith('archive_member_path_duplicate')));
  assert.ok(validateArchiveEntries([{ name: 'skills', type: 'file' }, { name: 'skills/a/SKILL.md', type: 'file' }]).some((error) => error.startsWith('archive_member_path_type_conflict')));
  assert.ok(validateArchiveEntries([{ name: 'special', type: 'symlink' }]).some((error) => error.startsWith('archive_member_type_unsupported')));
});

test('fails closed when a generated package has a broken local reference or an unreadable archive', async () => {
  const output = createTemporaryOutputRoot();
  try {
    const result = await buildOpenAiPackage({ root, outputRoot: output });
    const skill = fs.readdirSync(path.join(result.packageRoot, 'skills'))[0];
    const skillFile = path.join(result.packageRoot, 'skills', skill, 'SKILL.md');
    fs.appendFileSync(skillFile, '\n[Broken local resource](../../missing-resource.md)\n', 'utf8');
    assert.match(validateGeneratedPackageReferences(result.packageRoot).join('\n'), /unresolved local Markdown target/);

    const invalidArchive = path.join(output, 'invalid.zip');
    fs.writeFileSync(invalidArchive, 'not a zip archive', 'utf8');
    assert.match(validateArchiveFile(invalidArchive).join('\n'), /no readable central-directory entries/);
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test('standalone builder fails closed when a source skill contains a broken local Markdown target', async () => {
  const temporary = fs.mkdtempSync(path.join(path.dirname(root), 'ngautopilot-openai-broken-source-'));
  const output = path.join(temporary, 'dist', 'openai-plugin');
  try {
    for (const entry of ['package.json', 'LICENSE', 'skills', 'openai', 'docs']) fs.cpSync(path.join(root, entry), path.join(temporary, entry), { recursive: true });
    const skillFile = path.join(temporary, 'skills', fs.readdirSync(path.join(temporary, 'skills'))[0], 'SKILL.md');
    fs.appendFileSync(skillFile, '\n[Broken local resource](./missing-resource.md)\n', 'utf8');
    await assert.rejects(
      () => buildOpenAiPackage({ root: temporary, outputRoot: output }),
      /unresolvable local Markdown target/,
    );
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('does not copy arbitrary checkout files referenced by a source skill', async () => {
  const temporary = fs.mkdtempSync(path.join(path.dirname(root), 'ngautopilot-openai-private-reference-'));
  const output = path.join(temporary, 'dist', 'openai-plugin');
  try {
    for (const entry of ['package.json', 'LICENSE', 'skills', 'openai', 'docs']) fs.cpSync(path.join(root, entry), path.join(temporary, entry), { recursive: true });
    fs.mkdirSync(path.join(temporary, '.git'), { recursive: true });
    fs.writeFileSync(path.join(temporary, '.git', 'config'), '[core]\nrepositoryformatversion = 0\n', 'utf8');
    const skillFile = path.join(temporary, 'skills', fs.readdirSync(path.join(temporary, 'skills'))[0], 'SKILL.md');
    fs.appendFileSync(skillFile, '\n[Private checkout metadata](../../.git/config)\n', 'utf8');
    await assert.rejects(
      () => buildOpenAiPackage({ root: temporary, outputRoot: output }),
      /not an approved public resource/,
    );
    assert.equal(fs.existsSync(path.join(output, 'ngautopilot-skills', '.git', 'config')), false);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('places all supplementary files in an isolated resources namespace', async () => {
  const temporary = fs.mkdtempSync(path.join(path.dirname(root), 'ngautopilot-openai-skill-resource-'));
  const output = path.join(temporary, 'dist', 'openai-plugin');
  try {
    for (const entry of ['package.json', 'LICENSE', 'skills', 'openai', 'assets', 'docs']) fs.cpSync(path.join(root, entry), path.join(temporary, entry), { recursive: true });
    const skillFile = path.join(temporary, 'skills', fs.readdirSync(path.join(temporary, 'skills'))[0], 'SKILL.md');
    fs.mkdirSync(path.join(temporary, 'skills', 'shared'), { recursive: true });
    fs.writeFileSync(path.join(temporary, 'skills', 'shared', 'guide.md'), '# Shared guide\n', 'utf8');
    fs.appendFileSync(skillFile, '\n[Shared guide](../shared/guide.md)\n[Shared asset](../../assets/ngautopilot-hero.svg)\n', 'utf8');
    const result = await buildOpenAiPackage({ root: temporary, outputRoot: output });
    assert.equal(fs.existsSync(path.join(output, 'ngautopilot-skills', 'skills', 'shared', 'guide.md')), false);
    assert.equal(fs.readFileSync(path.join(result.packageRoot, 'resources', 'skills', 'shared', 'guide.md'), 'utf8'), '# Shared guide\n');
    assert.equal(fs.readFileSync(path.join(result.packageRoot, 'resources', 'assets', 'ngautopilot-hero.svg'), 'utf8'), fs.readFileSync(path.join(temporary, 'assets', 'ngautopilot-hero.svg'), 'utf8'));
    assert.equal(fs.readFileSync(path.join(result.packageRoot, 'assets', 'ngautopilot-hero.svg'), 'utf8'), fs.readFileSync(path.join(temporary, 'openai', 'assets', 'ngautopilot-hero.svg'), 'utf8'));
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('rejects Unix symlink members encoded in ZIP central-directory metadata', async () => {
  const output = createTemporaryOutputRoot();
  try {
    const result = await buildOpenAiPackage({ root, outputRoot: output });
    const symlinkArchive = path.join(output, 'symlink-member.zip');
    const data = fs.readFileSync(result.archivePath);
    const centralDirectoryOffset = data.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
    assert.notEqual(centralDirectoryOffset, -1);
    data.writeUInt16LE((3 << 8) | 30, centralDirectoryOffset + 4);
    data.writeUInt32LE(0o120777 * 0x10000, centralDirectoryOffset + 38);
    fs.writeFileSync(symlinkArchive, data);
    assert.match(validateArchiveFile(symlinkArchive).join('\n'), /archive_member_type_unsupported/);
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test('fails closed before copying an OpenAI asset symlink or junction', async (t) => {
  const temporary = fs.mkdtempSync(path.join(path.dirname(root), 'ngautopilot-openai-symlink-'));
  const outside = fs.mkdtempSync(path.join(path.dirname(root), 'ngautopilot-openai-outside-'));
  const output = createTemporaryOutputRoot();
  try {
    for (const entry of ['package.json', 'LICENSE', 'skills', 'openai', 'docs']) fs.cpSync(path.join(root, entry), path.join(temporary, entry), { recursive: true });
    const link = path.join(temporary, 'openai', 'assets', 'unsafe-link');
    try {
      fs.symlinkSync(outside, link, process.platform === 'win32' ? 'junction' : 'dir');
    } catch (error) {
      t.skip(`symlink or junction creation is unavailable on this host: ${error.code ?? error.message}`);
      return;
    }
    await assert.rejects(() => buildOpenAiPackage({ root: temporary, outputRoot: output }), /unsupported package symlink or junction/);
    assert.equal(fs.existsSync(path.join(output, 'ngautopilot-skills', 'assets', 'unsafe-link')), false);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test('exposes the documented OpenAI validation command through the package boundary', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(manifest.scripts['openai:validate'], 'node scripts/validate-openai-package.mjs');
  assert.equal(manifest.scripts['openai:pack'], 'node scripts/build-openai-package.mjs');
  assert.equal(manifest.dependencies?.yazl, undefined);
  assert.ok(manifest.devDependencies?.yazl);

  const result = spawnSync(process.execPath, ['scripts/validate-openai-package.mjs'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /OpenAI package validation passed for 413 canonical skill files/);
});
