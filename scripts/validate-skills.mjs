import fs from 'node:fs';
import path from 'node:path';

const skillsRoot = 'skills';
const requiredFields = [
  'id',
  'name',
  'description',
  'stack',
  'category',
  'status',
  'version',
  'owner',
  'triggers',
];
const requiredSections = [
  '## Purpose',
  '## When to Use',
  '## Do',
  '## Do Not',
  '## Review Checklist',
  '## Expected Output',
];
const allowedStatuses = new Set(['stable']);
const errors = [];

const skillFiles = findSkillFiles(skillsRoot);

if (skillFiles.length === 0) {
  errors.push(`${skillsRoot}: no SKILL.md files found`);
}

for (const file of skillFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const frontmatter = parseFrontmatter(content);

  if (!frontmatter) {
    errors.push(`${file}: missing frontmatter block`);
    continue;
  }

  for (const field of requiredFields) {
    if (isMissing(frontmatter[field])) {
      errors.push(`${file}: missing frontmatter field "${field}"`);
    }
  }

  if (frontmatter.status && !allowedStatuses.has(frontmatter.status)) {
    errors.push(`${file}: invalid status "${frontmatter.status}"`);
  }

  if (frontmatter.id && !/^[a-z0-9]+(\.[a-z0-9]+(-[a-z0-9]+)*)+$/.test(frontmatter.id)) {
    errors.push(`${file}: invalid id "${frontmatter.id}"`);
  }

  if (frontmatter.version && !/^\d+\.\d+\.\d+$/.test(frontmatter.version)) {
    errors.push(`${file}: invalid version "${frontmatter.version}"`);
  }

  if (!Array.isArray(frontmatter.stack) || frontmatter.stack.length === 0) {
    errors.push(`${file}: "stack" must contain at least one item`);
  }

  if (!Array.isArray(frontmatter.triggers) || frontmatter.triggers.length === 0) {
    errors.push(`${file}: "triggers" must contain at least one item`);
  }

  for (const section of requiredSections) {
    if (!content.includes(section)) {
      errors.push(`${file}: missing section "${section}"`);
    }
  }

  if (/\bTODO\b/i.test(content)) {
    errors.push(`${file}: contains TODO marker`);
  }
}

if (errors.length > 0) {
  console.error('Skill validation failed:\n');

  for (const error of errors) {
    console.error(`- ${toPosixPath(error)}`);
  }

  process.exit(1);
}

console.log(`Validated ${skillFiles.length} skills successfully.`);

function findSkillFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const entries = fs.readdirSync(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...findSkillFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name === 'SKILL.md') {
      files.push(fullPath);
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!match) {
    return null;
  }

  return parseYamlSubset(match[1]);
}

function parseYamlSubset(source) {
  const result = {};
  const lines = source.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:\s*(.*))?$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue = ''] = match;
    const value = rawValue.trim();

    if (value === '>' || value === '|') {
      const parts = [];

      while (index + 1 < lines.length && !isTopLevelKey(lines[index + 1])) {
        index += 1;
        const foldedLine = lines[index].replace(/^\s+/, '');

        if (foldedLine) {
          parts.push(foldedLine);
        }
      }

      result[key] = parts.join(' ');
      continue;
    }

    if (value === '') {
      const items = [];

      while (index + 1 < lines.length && /^\s*-\s+/.test(lines[index + 1])) {
        index += 1;
        items.push(lines[index].replace(/^\s*-\s+/, '').trim());
      }

      result[key] = items.length > 0 ? items : '';
      continue;
    }

    result[key] = value.replace(/^['"]|['"]$/g, '');
  }

  return result;
}

function isTopLevelKey(line) {
  return /^[A-Za-z][A-Za-z0-9_-]*:/.test(line);
}

function isMissing(value) {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

function toPosixPath(value) {
  return value.replaceAll(path.sep, '/');
}
