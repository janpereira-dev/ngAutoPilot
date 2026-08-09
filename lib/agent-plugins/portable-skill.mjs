import fs from 'node:fs';
import path from 'node:path';

import { assertRelativeReference, copyContainedDirectory } from './path-safety.mjs';

export function toPortableSkillName(id) {
  const name = id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!name || name.length > 64 || name.includes('--')) {
    throw new Error(`invalid portable skill name: ${id}`);
  }
  return name;
}

export function ensureUniquePortableNames(ids) {
  const names = new Map();
  for (const id of ids) {
    const name = toPortableSkillName(id);
    if (names.has(name)) {
      throw new Error(`portable skill name collision: ${names.get(name)} and ${id}`);
    }
    names.set(name, id);
  }
  return names;
}

export function renderPortableSkill({ sourceDir, targetDir, skill }) {
  const name = toPortableSkillName(skill.id);
  copyContainedDirectory(sourceDir, targetDir);

  const source = fs.readFileSync(path.join(sourceDir, 'SKILL.md'), 'utf8');
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  const content = `---\nname: ${name}\ndescription: ${quote(skill.description)}\nlicense: MIT\nmetadata:\n  ngautopilot-id: ${quote(skill.id)}\n  ngautopilot-source: ${quote(skill.path)}\n  ngautopilot-version: ${quote(skill.version)}\n---\n\n${body}`;

  fs.writeFileSync(path.join(targetDir, 'SKILL.md'), content, 'utf8');
  for (const match of content.matchAll(/]\(([^)]+)\)/g)) {
    assertRelativeReference(targetDir, match[1]);
  }

  return { name, targetDir };
}

function quote(value) {
  return JSON.stringify(String(value));
}
