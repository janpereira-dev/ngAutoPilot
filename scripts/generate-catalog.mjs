import fs from 'node:fs';
import path from 'node:path';

const skillsRoot = 'skills';
const catalogPath = 'catalog.json';
const requiredSections = ['## Purpose', '## When to Use', '## Do', '## Do Not', '## Review Checklist', '## Expected Output'];

const skillFiles = findSkillFiles(skillsRoot);

const skills = skillFiles
  .map((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const metadata = parseFrontmatter(content);

    if (!metadata) {
      throw new Error(`${file}: missing frontmatter block`);
    }

    const missingSections = missingRequiredSections(content);

    return {
      id: metadata.id,
      name: metadata.name,
      path: toPosixPath(file),
      stack: metadata.stack,
      category: metadata.category,
      status: metadata.status,
      version: metadata.version,
      triggers: metadata.triggers,
      compatibility: parseAngularCompatibility(content),
      contentSignals: {
        requiredSections: missingSections.length === 0,
        ...(missingSections.length > 0 ? { missingRequiredSections: missingSections } : {}),
        hasProcedure: content.includes('## Procedure') || content.includes('## Execution Workflow'),
        hasRisks: content.includes('## Risks'),
        wordCount: content.trim().split(/\s+/).filter(Boolean).length,
      },
    };
  })
  .sort((left, right) => left.id.localeCompare(right.id));

const catalog = {
  name: 'NgAutoPilot',
  description: 'Agnostic micro-skills for Angular, TypeScript and JavaScript development.',
  version: '0.8.1',
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

function parseAngularCompatibility(content) {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) return {};
  let inCompatibility = false;
  let inAngular = false;
  const result = {};
  for (const line of frontmatter[1].split(/\r?\n/)) {
    if (/^compatibility:\s*$/.test(line)) { inCompatibility = true; continue; }
    if (inCompatibility && /^\S.*:$/.test(line)) break;
    if (inCompatibility && /^\s{2}angular:\s*$/.test(line)) { inAngular = true; continue; }
    if (inAngular && /^\s{2}\S.*:$/.test(line)) break;
    const bound = inAngular && line.match(/^\s{4}(min|max):\s*["']?(\d+)["']?\s*$/);
    if (bound) result[bound[1]] = Number(bound[2]);
  }
  return result;
}

function missingRequiredSections(content) {
  return requiredSections.filter((section) => !hasExactHeading(content, section));
}

function hasExactHeading(content, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}\s*$`, 'm').test(content);
}
