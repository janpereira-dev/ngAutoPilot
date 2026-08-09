import fs from 'node:fs';
import path from 'node:path';

const skillsRoot = 'skills';
const catalogPath = 'catalog.json';

const skillFiles = findSkillFiles(skillsRoot);

const skills = skillFiles
  .map((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const metadata = parseFrontmatter(content);

    if (!metadata) {
      throw new Error(`${file}: missing frontmatter block`);
    }

    return {
      id: metadata.id,
      name: metadata.name,
      path: toPosixPath(file),
      stack: metadata.stack,
      category: metadata.category,
      status: metadata.status,
      version: metadata.version,
      triggers: metadata.triggers,
    };
  })
  .sort((left, right) => left.id.localeCompare(right.id));

const catalog = {
  name: 'NgAutoPilot',
  description: 'Agnostic micro-skills for Angular, TypeScript and JavaScript development.',
  version: '0.6.0',
  skills,
};

fs.writeFileSync(`${catalogPath}`, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');

console.log(`Generated ${catalogPath} with ${skills.length} skills.`);

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

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
