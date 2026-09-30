import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const editorialChecks = [
  ['awkward-description', /Use this skill for (?:Use|Fix|Gate|Validate|Inventory|Coordinate)\b/],
  ['generic-routing-tail', /Use when Angular 22 work needs concern-first routing, explicit validation, and no invented APIs\./],
  ['repeated-explainer', /This skill helps separate a real upgrade risk from general cleanup\./],
  ['internal-id-in-output', /State the [a-z]+\.[a-z0-9.-]+ diagnosis/],
  ['generic-purpose', /Use this skill to handle .+ for .+ in Angular projects without mixing it/],
];

// Editorial signals are review candidates, not a semantic quality score.
export function inspectSkillContent(content) {
  const normalized = content.replaceAll('\r\n', '\n');
  const frontmatter = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!frontmatter) throw new Error('missing frontmatter');
  const id = frontmatter[1].match(/^id: (.+)$/m)?.[1].trim();
  if (!id) throw new Error('missing skill id');
  const rawDescription = frontmatter[1].match(/^description: ([^\n]*)(?:\n((?:[ \t]+[^\n]*(?:\n|$))*))?/m);
  const description = rawDescription
    ? (/^[>|][-+]?\s*$/.test(rawDescription[1])
      ? (rawDescription[2] ?? '').trim().replace(/\s+/g, ' ')
      : rawDescription[1].trim().replace(/^['"]|['"]$/g, ''))
    : '';
  if (!description) throw new Error(`${id}: missing description`);
  const body = normalized.slice(frontmatter[0].length);
  // Do not mistake deliberately bad code examples for editorial defects.
  const prose = withoutFencedCode(body);
  const issues = editorialChecks.filter(([, pattern]) => pattern.test(`${description}\n${prose}`))
    .map(([rule]) => rule);
  return {
    id,
    descriptionCharacters: description.length,
    words: normalized.trim().split(/\s+/).length,
    issues,
  };
}

function withoutFencedCode(body) {
  let fence;
  return body.split('\n').filter((line) => {
    if (fence) {
      const closer = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
      if (closer && closer[1][0] === fence.character && closer[1].length >= fence.length) fence = undefined;
      return false;
    }
    const opener = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!opener || (opener[1][0] === '`' && opener[2].includes('`'))) return true;
    fence = { character: opener[1][0], length: opener[1].length };
    return false;
  }).join('\n');
}

export function auditSkillContent({ root = process.cwd() } = {}) {
  const sourceRoot = path.join(root, 'skills');
  const files = findSkills(sourceRoot);
  if (files.length === 0) throw new Error(`${sourceRoot}: no skills found`);
  const skills = files.map((file) => ({
    path: path.relative(root, file).split(path.sep).join('/'),
    ...inspectSkillContent(fs.readFileSync(file, 'utf8')),
  }));
  const byRule = Object.fromEntries(editorialChecks.map(([rule]) => [rule, 0]));
  for (const skill of skills) for (const issue of skill.issues) byRule[issue] += 1;
  return {
    scope: 'Source SKILL.md editorial scan; not an API, runtime, routing, or behavioral evaluation.',
    totalSkills: skills.length,
    totalWords: skills.reduce((sum, skill) => sum + skill.words, 0),
    skillsWithEditorialSignals: skills.filter(({ issues }) => issues.length > 0).length,
    byRule,
    skills,
  };
}

function findSkills(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`source symlink is not supported: ${target}`);
    if (entry.isDirectory()) return findSkills(target);
    return entry.isFile() && entry.name === 'SKILL.md' ? [target] : [];
  }).sort();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== '--json')) throw new Error('Usage: node scripts/audit-skill-content.mjs [--json]');
    const report = auditSkillContent();
    console.log(JSON.stringify(args.includes('--json') ? report : {
      scope: report.scope,
      totalSkills: report.totalSkills,
      totalWords: report.totalWords,
      skillsWithEditorialSignals: report.skillsWithEditorialSignals,
      byRule: report.byRule,
    }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
