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
    if (!hasRequiredHeading(content, section)) {
      errors.push(`missing section "${section}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasRequiredHeading(content, section) {
  if (section === '## When to Use' || section === '## Do Not') {
    return new RegExp(`^${escapeRegExp(section)}(?:\\s+This Skill)?\\s*$`, 'm').test(content);
  }

  return new RegExp(`^${escapeRegExp(section)}\\s*$`, 'm').test(content);
}
