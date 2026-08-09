import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { ensureUniquePortableNames, renderPortableSkill, toPortableSkillName } from '../../lib/agent-plugins/portable-skill.mjs';

test('normalizes canonical IDs into Agent Skills names', () => {
  assert.equal(toPortableSkillName('core.project-intake'), 'core-project-intake');
  assert.throws(() => ensureUniquePortableNames(['a.b', 'a-b']), /portable skill name collision/);
});

test('copies skill resources and replaces frontmatter with portable metadata', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-portable-skill-'));
  const sourceDir = path.join(root, 'source');
  const targetDir = path.join(root, 'target');

  fs.mkdirSync(path.join(sourceDir, 'references'), { recursive: true });
  fs.writeFileSync(path.join(sourceDir, 'references', 'guide.md'), '# Guide\n', 'utf8');
  fs.writeFileSync(path.join(sourceDir, 'SKILL.md'), '---\nid: example.skill\nname: Example Skill\ndescription: Source description\nversion: 0.5.3\n---\n\nRead [guide](references/guide.md).\n', 'utf8');

  try {
    renderPortableSkill({
      sourceDir,
      targetDir,
      skill: { id: 'example.skill', path: 'skills/example/SKILL.md', description: 'Portable description', version: '0.5.3' },
    });

    const content = fs.readFileSync(path.join(targetDir, 'SKILL.md'), 'utf8');
    assert.match(content, /^---\nname: example-skill\ndescription: "Portable description"\nlicense: MIT\nmetadata:/);
    assert.match(content, /ngautopilot-id: "example.skill"/);
    assert.equal(fs.existsSync(path.join(targetDir, 'references', 'guide.md')), true);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
