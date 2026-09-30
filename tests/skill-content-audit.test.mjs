import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { auditSkillContent, inspectSkillContent } from '../scripts/audit-skill-content.mjs';

function skill(body = '', description = 'Test observable cancellation when searches overlap.') {
  return `---\nid: angular.testing.example\ndescription: >\n  ${description}\n---\n${body}`;
}

test('reports exact editorial signals without claiming semantic quality', () => {
  const result = inspectSkillContent(skill('State the angular.testing.example diagnosis in one concise paragraph.',
    'Use this skill for Fix tests. Use when Angular 22 work needs concern-first routing, explicit validation, and no invented APIs.'));
  assert.deepEqual(result.issues, ['awkward-description', 'generic-routing-tail', 'internal-id-in-output']);
  assert.equal(result.id, 'angular.testing.example');
});

test('preserves domain-specific prose and ignores fenced counterexamples', () => {
  const result = inspectSkillContent(skill('Verify teardown.\n```txt\nState the angular.testing.example diagnosis\n```'));
  assert.deepEqual(result.issues, []);
  assert.deepEqual(inspectSkillContent(skill('Use this skill for Angular 16+ projects.')).issues, []);
  assert.equal(inspectSkillContent(skill().replaceAll('\n', '\r\n')).words, inspectSkillContent(skill()).words);
});

test('supports inline descriptions and folded multiline descriptions', () => {
  assert.equal(inspectSkillContent('---\nid: angular.testing.example\ndescription: "Test cancellation."\n---\n').descriptionCharacters, 18);
  assert.equal(inspectSkillContent(skill().replace('description: >', 'description: >-')).descriptionCharacters,
    inspectSkillContent(skill()).descriptionCharacters);
});

test('ignores valid indented, longer, and unclosed Markdown fences', () => {
  const counterexample = 'State the angular.testing.example diagnosis';
  for (const body of [
    `   \`\`\`txt\n${counterexample}\n  \`\`\`\``,
    ` ~~~txt\n${counterexample}\n   ~~~~~`,
    `\`\`\`txt\n${counterexample}`,
    `\`\`\`\`txt\n\`\`\`\n${counterexample}\n\`\`\`\``,
    `~~~txt\n\`\`\`\n${counterexample}\n~~~`,
  ]) {
    assert.deepEqual(inspectSkillContent(skill(body)).issues, [], body);
  }
});

test('scans prose after valid closers and does not accept invalid fence openers', () => {
  const issue = 'State the angular.testing.example diagnosis';
  for (const body of [
    `  ~~~txt\nExample\n   ~~~~\n${issue}`,
    `\`\`\`txt with \` invalid info\n${issue}`,
    `    \`\`\`txt\n${issue}`,
  ]) {
    assert.deepEqual(inspectSkillContent(skill(body)).issues, ['internal-id-in-output'], body);
  }
});

test('rejects missing metadata instead of silently counting incomplete skills', () => {
  assert.throws(() => inspectSkillContent('No metadata'), /frontmatter/);
  assert.throws(() => inspectSkillContent('---\ndescription: Test\n---\n'), /skill id/);
  assert.throws(() => inspectSkillContent('---\nid: angular.testing.example\n---\n'), /description/);
});

test('audits source skills only, in stable order, without writing files', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-content-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const folder of ['skills/b', 'skills/a', 'plugins/generated']) {
    fs.mkdirSync(path.join(root, folder), { recursive: true });
    fs.writeFileSync(path.join(root, folder, 'SKILL.md'), skill());
  }
  const first = auditSkillContent({ root });
  assert.equal(first.totalSkills, 2);
  assert.deepEqual(first.skills.map(({ path: file }) => file), ['skills/a/SKILL.md', 'skills/b/SKILL.md']);
  assert.match(first.scope, /not an API, runtime, routing, or behavioral evaluation/);
  assert.deepEqual(auditSkillContent({ root }), first);
  assert.deepEqual(fs.readdirSync(root).sort(), ['plugins', 'skills']);
});

test('fails on an empty source catalog', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-content-empty-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'skills'));
  assert.throws(() => auditSkillContent({ root }), /no skills found/);
});
