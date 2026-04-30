import fs from 'node:fs';
import path from 'node:path';

const [, , rawSkillPath] = process.argv;

if (!rawSkillPath) {
  console.error('Usage: npm run skills:create -- angular/performance/lazy-loading-routes');
  process.exit(1);
}

const normalizedSkillPath = rawSkillPath
  .replaceAll('\\', '/')
  .replace(/^skills\//, '')
  .replace(/\/SKILL\.md$/, '')
  .replace(/^\/+|\/+$/g, '');

const segments = normalizedSkillPath.split('/').filter(Boolean);

if (segments.length < 3) {
  console.error('Skill path must include stack, category, and skill name.');
  console.error('Example: angular/performance/lazy-loading-routes');
  process.exit(1);
}

if (segments.some((segment) => segment === '..' || segment === '.' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment))) {
  console.error('Skill path segments must use kebab-case and must not contain "." or "..".');
  process.exit(1);
}

const skillDir = path.join('skills', ...segments);
const skillFile = path.join(skillDir, 'SKILL.md');
const templateFile = path.join('templates', 'SKILL.template.md');

if (fs.existsSync(skillFile)) {
  console.error(`Skill already exists: ${skillFile}`);
  process.exit(1);
}

if (!fs.existsSync(templateFile)) {
  console.error(`Skill template not found: ${toPosixPath(templateFile)}`);
  process.exit(1);
}

const [stackSegment, category, skillSlug] = segments;
const id = segments.join('.');
const name = toTitleCase(skillSlug);
const stack = inferStack(stackSegment);
const description = `Draft skill for ${name}. Replace this with a precise explanation before review.`;
const template = fs.readFileSync(templateFile, 'utf8');
const content = template
  .replace('id: example.category.skill-name', `id: ${id}`)
  .replace('name: Skill Name', `name: ${name}`)
  .replace('  Short explanation of when this skill should be used.', `  ${description}`)
  .replace('  - Angular', stack.map((item) => `  - ${item}`).join('\n'))
  .replace('category: performance', `category: ${category}`)
  .replace('  - trigger example', `  - ${skillSlug}`)
  .replaceAll('Skill Name', name);

fs.mkdirSync(skillDir, { recursive: true });
fs.writeFileSync(skillFile, content, 'utf8');

console.log(`Created skill: ${toPosixPath(skillFile)}`);

function inferStack(stackSegment) {
  if (stackSegment === 'angular') {
    return ['Angular', 'TypeScript'];
  }

  if (stackSegment === 'typescript') {
    return ['TypeScript'];
  }

  if (stackSegment === 'javascript') {
    return ['JavaScript'];
  }

  return [toTitleCase(stackSegment)];
}

function toTitleCase(value) {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
