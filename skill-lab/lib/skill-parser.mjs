import { splitSkill } from './protected-metadata.mjs';

export const REQUIRED_SKILL_SECTIONS = [
  '## Purpose',
  '## When to Use',
  '## Do',
  '## Do Not',
  '## Review Checklist',
  '## Expected Output',
];

export function validateSkillStructure(content) {
  const errors = [];
  const { frontmatter } = splitSkill(content);

  if (!frontmatter) errors.push('missing frontmatter block');
  if (/\bTODO\b/i.test(content)) errors.push('contains TODO marker');

  for (const section of REQUIRED_SKILL_SECTIONS) {
    if (!content.includes(section)) {
      errors.push(`missing section "${section}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
