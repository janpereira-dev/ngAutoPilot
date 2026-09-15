import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildOpenAiPackage,
  CANONICAL_SKILL_COUNT,
  createTemporaryOutputRoot,
  OPENAI_PACKAGE_NAME,
  validateArchiveEntries,
  validateOpenAiPackage,
} from '../lib/openai-package.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('builds and validates the canonical 413-skill OpenAI package', async () => {
  const output = createTemporaryOutputRoot();
  try {
    const validation = await validateOpenAiPackage({ root });
    assert.deepEqual(validation.errors, []);
    assert.equal(validation.skillFiles, CANONICAL_SKILL_COUNT);

    const result = await buildOpenAiPackage({ root, outputRoot: output });
    const manifest = JSON.parse(fs.readFileSync(path.join(result.packageRoot, 'plugin.json'), 'utf8'));
    const metadata = JSON.parse(fs.readFileSync(path.join(result.packageRoot, 'skill-metadata.json'), 'utf8'));
    assert.equal(manifest.name, OPENAI_PACKAGE_NAME);
    assert.equal(manifest.version, result.version);
    assert.equal(metadata.version, result.version);
    assert.equal(metadata.skills.length, CANONICAL_SKILL_COUNT);
    assert.equal(fs.readdirSync(path.join(result.packageRoot, 'skills'), { withFileTypes: true }).filter((entry) => entry.isDirectory()).length, CANONICAL_SKILL_COUNT);
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test('rewrites canonical local Markdown references into package-local assets', async () => {
  const output = createTemporaryOutputRoot();
  try {
    const result = await buildOpenAiPackage({ root, outputRoot: output });
    const metadata = JSON.parse(fs.readFileSync(path.join(result.packageRoot, 'skill-metadata.json'), 'utf8'));
    const skill = metadata.skills.find(({ id }) => id === 'angular.design.angular-component-library-contracts');
    assert.ok(skill);
    const generatedSkill = path.join(result.packageRoot, 'skills', skill.publicName, 'SKILL.md');
    const content = fs.readFileSync(generatedSkill, 'utf8');
    assert.match(content, /\]\(\.\.\/\.\.\/resources\/docs\/design-excellence-guide\.md\)/);
    assert.ok(fs.statSync(path.join(result.packageRoot, 'resources', 'docs', 'design-excellence-guide.md')).isFile());
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test('rejects an invalid package member through the public archive validation API', () => {
  assert.match(
    validateArchiveEntries([{ name: '../plugin.json', type: 'file' }]).join('\n'),
    /archive_member_path_has_parent_segment/,
  );
});
