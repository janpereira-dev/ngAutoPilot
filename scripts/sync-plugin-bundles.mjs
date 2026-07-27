import fs from 'node:fs';
import path from 'node:path';

const repository = 'https://github.com/janpereira-dev/ngAutoPilot';
const author = {
  name: 'Jan Pereira',
  url: 'https://github.com/janpereira-dev',
};

const sourceRoot = 'skills';
const pluginRoot = 'plugins';

const bundleDefinitions = [
  {
    name: 'ngautopilot-core',
    description:
      'Core NgAutoPilot workflows for project intake, stack detection, skill routing, compatibility gates, and risk assessment.',
    category: 'Developer Tools',
    claudeCategory: 'development-workflow',
    keywords: ['ngautopilot', 'codex', 'skills', 'ai-agents', 'developer-tools'],
    tags: ['ai-agents', 'skills', 'orchestration', 'developer-tools'],
    include: ({ relativePath }) => relativePath.startsWith('skills/_core/'),
  },
  {
    name: 'ngautopilot-angular',
    description:
      'Complete Angular-focused NgAutoPilot skills for upgrades, compatibility, architecture, testing, RxJS, performance, security, signals, and modernization.',
    category: 'Frontend',
    claudeCategory: 'frontend',
    keywords: ['angular', 'typescript', 'rxjs', 'codex', 'skills', 'frontend'],
    tags: ['angular', 'typescript', 'rxjs', 'upgrade', 'frontend'],
    include: ({ relativePath }) => relativePath.startsWith('skills/angular/'),
  },
  {
    name: 'ngautopilot-angular-microfrontends',
    description:
      'Focused Angular micro-frontends skills for shell contracts, compatibility gates, dependency sharing, ownership, observability, release governance, and rollback safety.',
    category: 'Frontend',
    claudeCategory: 'frontend',
    keywords: ['angular', 'microfrontends', 'module-federation', 'nx', 'frontend'],
    tags: ['angular', 'microfrontends', 'module-federation', 'nx', 'architecture'],
    include: ({ relativePath, metadata }) =>
      relativePath.startsWith('skills/angular/microfrontends/') ||
      metadata.id.includes('micro-frontends') ||
      metadata.id.includes('module-federation'),
  },
  {
    name: 'ngautopilot-css',
    description:
      'CSS and Angular style-boundary skills for content-aware layouts, selectors, and host custom properties.',
    category: 'Styles',
    claudeCategory: 'styles',
    keywords: ['css', 'selectors', 'layout', 'custom-properties', 'styles'],
    tags: ['css', 'selectors', 'layout', 'custom-properties', 'styles'],
    include: ({ relativePath }) =>
      relativePath.startsWith('skills/css/') ||
      relativePath.startsWith('skills/angular/styles/'),
  },
  {
    name: 'ngautopilot-frontend',
    description:
      'Frontend-first skills for inclusive UI, responsive CSS, product UX, design-system governance, experience validation, and web performance evidence.',
    category: 'Frontend',
    claudeCategory: 'frontend',
    keywords: ['frontend', 'accessibility', 'ux', 'design-system', 'testing', 'performance'],
    tags: ['frontend', 'accessibility', 'ux', 'testing', 'performance'],
    include: ({ relativePath }) => relativePath.startsWith('skills/frontend/'),
  },
  {
    name: 'ngautopilot-javascript',
    description:
      'JavaScript-focused NgAutoPilot skills for fundamentals, modules, pure functions, and async error handling.',
    category: 'JavaScript',
    claudeCategory: 'javascript',
    keywords: ['javascript', 'async', 'modules', 'browser', 'nodejs'],
    tags: ['javascript', 'async', 'modules', 'browser', 'nodejs'],
    include: ({ relativePath }) => relativePath.startsWith('skills/javascript/'),
  },
  {
    name: 'ngautopilot-quality',
    description:
      'Complete quality skills for ESLint, SonarQube, dead code, technical debt, and quality decision workflows.',
    category: 'Code Quality',
    claudeCategory: 'quality',
    keywords: ['quality', 'eslint', 'sonarqube', 'dead-code', 'technical-debt'],
    tags: ['quality', 'eslint', 'sonar', 'dead-code', 'governance'],
    include: ({ relativePath }) => relativePath.startsWith('skills/quality/'),
  },
  {
    name: 'ngautopilot-quality-lint',
    description:
      'Lint-focused quality skills for ESLint baseline hardening, disable governance, and safe autofix cleanup.',
    category: 'Code Quality',
    claudeCategory: 'quality',
    keywords: ['quality', 'lint', 'eslint', 'baseline'],
    tags: ['quality', 'lint', 'eslint', 'baseline'],
    include: ({ relativePath }) => relativePath.startsWith('skills/quality/eslint/'),
  },
  {
    name: 'ngautopilot-quality-deadcode-sonar',
    description:
      'Dead-code and SonarQube skills for orphan files, unused exports, dead branches, complexity, duplication, coverage, and gate triage.',
    category: 'Code Quality',
    claudeCategory: 'quality',
    keywords: ['quality', 'dead-code', 'sonar', 'cleanup'],
    tags: ['quality', 'dead-code', 'sonar', 'cleanup'],
    include: ({ relativePath }) =>
      relativePath.startsWith('skills/quality/no-dead-code/') ||
      relativePath.startsWith('skills/quality/sonarqube/'),
  },
  {
    name: 'ngautopilot-typescript',
    description:
      'TypeScript-focused skills for strict typing, DTO mappers, fundamentals, and safe modernization.',
    category: 'TypeScript',
    claudeCategory: 'typescript',
    keywords: ['typescript', 'strict-types', 'typing', 'dto', 'modernization'],
    tags: ['typescript', 'strict-types', 'typing', 'dto', 'modernization'],
    include: ({ relativePath }) => relativePath.startsWith('skills/typescript/'),
  },
];

const sourceSkills = findSkillFiles(sourceRoot).map((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const metadata = parseFrontmatter(content);

  if (!metadata) {
    throw new Error(`${file}: missing frontmatter`);
  }

  return {
    sourcePath: file,
    relativePath: toPosixPath(file),
    content,
    metadata,
  };
});

for (const bundle of bundleDefinitions) {
  const pluginDir = path.join(pluginRoot, bundle.name);
  const skillsDir = path.join(pluginDir, 'skills');
  const manifestDir = path.join(pluginDir, '.codex-plugin');
  const selectedSkills = sourceSkills
    .filter((skill) => bundle.include(skill))
    .sort((left, right) => left.metadata.id.localeCompare(right.metadata.id));

  if (selectedSkills.length === 0) {
    throw new Error(`${bundle.name}: no skills selected`);
  }

  fs.rmSync(skillsDir, { recursive: true, force: true });
  fs.mkdirSync(skillsDir, { recursive: true });
  fs.mkdirSync(manifestDir, { recursive: true });

  for (const skill of selectedSkills) {
    const slug = skill.metadata.id.replaceAll('.', '--');
    const targetDir = path.join(skillsDir, slug);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'SKILL.md'), skill.content, 'utf8');
  }

  const pluginManifest = {
    name: bundle.name,
    version: '0.5.3',
    description: bundle.description,
    author,
    homepage: repository,
    repository,
    license: 'MIT',
    keywords: bundle.keywords,
    skills: './skills/',
  };

  fs.writeFileSync(
    path.join(manifestDir, 'plugin.json'),
    `${JSON.stringify(pluginManifest, null, 2)}\n`,
    'utf8',
  );

  console.log(`${bundle.name}: synced ${selectedSkills.length} skills`);
}

writeMarketplaceFiles(bundleDefinitions);

const covered = new Set();
for (const skill of sourceSkills) {
  for (const bundle of bundleDefinitions) {
    if (bundle.include(skill)) {
      covered.add(skill.relativePath);
      break;
    }
  }
}

const uncovered = sourceSkills.filter((skill) => !covered.has(skill.relativePath));
if (uncovered.length > 0) {
  throw new Error(`Uncovered skills:\n${uncovered.map((skill) => `- ${skill.relativePath}`).join('\n')}`);
}

console.log(`Plugin bundle coverage OK for ${sourceSkills.length} source skills.`);

function writeMarketplaceFiles(bundles) {
  const codexMarketplace = {
    name: 'ngautopilot',
    interface: {
      displayName: 'NgAutoPilot Skills',
    },
    plugins: bundles.map((bundle) => ({
      name: bundle.name,
      source: {
        source: 'local',
        path: `./plugins/${bundle.name}`,
      },
      policy: {
        installation: 'AVAILABLE',
        authentication: 'ON_INSTALL',
      },
      category: bundle.category,
    })),
  };

  const claudeMarketplace = {
    name: 'ngautopilot',
    description:
      'NgAutoPilot Claude Code plugin marketplace for core workflow, Angular, JavaScript, TypeScript, CSS, and quality guidance.',
    metadata: {
      description:
        'NgAutoPilot Claude Code plugin marketplace for core workflow, Angular, JavaScript, TypeScript, CSS, and quality guidance.',
    },
    version: '0.5.3',
    owner: {
      name: author.name,
    },
    plugins: bundles.map((bundle) => ({
      name: bundle.name,
      source: `./plugins/${bundle.name}`,
      description: bundle.description,
      version: '0.5.3',
      author: {
        name: author.name,
      },
      homepage: repository,
      repository,
      license: 'MIT',
      category: bundle.claudeCategory,
      tags: bundle.tags,
    })),
  };

  fs.writeFileSync(
    path.join('.agents', 'plugins', 'marketplace.json'),
    `${JSON.stringify(codexMarketplace, null, 2)}\n`,
    'utf8',
  );
  fs.writeFileSync(
    path.join('.claude-plugin', 'marketplace.json'),
    `${JSON.stringify(claudeMarketplace, null, 2)}\n`,
    'utf8',
  );
}

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
