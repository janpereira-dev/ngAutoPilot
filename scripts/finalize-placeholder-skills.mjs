import fs from 'node:fs';
import path from 'node:path';

const skillsRoot = 'skills';
const placeholderPatterns = [
  /\bDraft skill\b/i,
  /Describe the exact problem this skill solves\./i,
  /Use this skill when this specific Angular workflow is needed\./i,
  /Explain the exact problem this skill solves\./i,
  /Condition 1\./i,
  /trigger example/i,
];

let updated = 0;

for (const file of findSkillFiles(skillsRoot)) {
  const content = fs.readFileSync(file, 'utf8');

  if (!placeholderPatterns.some((pattern) => pattern.test(content))) {
    continue;
  }

  const frontmatter = parseFrontmatter(content);
  if (!frontmatter) {
    throw new Error(`${file}: missing frontmatter`);
  }

  const title = frontmatter.name;
  const body = buildBody(frontmatter, file);
  const nextContent = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n[\s\S]*$/u, `${frontmatter.raw}\n\n${body}`);

  fs.writeFileSync(file, nextContent.endsWith('\n') ? nextContent : `${nextContent}\n`, 'utf8');
  updated += 1;
  console.log(`Finalized ${toPosixPath(file)}: ${title}`);
}

console.log(`Finalized ${updated} placeholder skills.`);

function buildBody(frontmatter, file) {
  const title = frontmatter.name;
  const category = frontmatter.category;
  const id = frontmatter.id;
  const stack = Array.isArray(frontmatter.stack) ? frontmatter.stack.join(', ') : frontmatter.stack;
  const context = contextFor(file, frontmatter);

  return [
    `# ${title}`,
    '',
    '## Purpose',
    '',
    `Use this skill to handle ${context.problem} in ${stack} projects without mixing it with unrelated migration, modernization, or cleanup work.`,
    '',
    `This skill keeps the ${category} decision explicit: identify the current state, choose the smallest safe action, document compatibility evidence, and leave a validation path that another agent or maintainer can repeat.`,
    '',
    '## When to Use',
    '',
    'Use this skill when:',
    '',
    `- the task mentions ${context.keywords};`,
    `- an Angular codebase needs a scoped ${category} decision before implementation;`,
    '- compatibility, risk, or ownership is unclear and should be made explicit;',
    '- the output must be reusable by another agent, reviewer, or release owner.',
    '',
    '## Do',
    '',
    '- Inspect the current Angular version, TypeScript version, build tooling, and affected files before recommending changes.',
    '- Keep the change bounded to the requested workflow and preserve separate upgrade, modernization, and cleanup tracks.',
    '- Prefer documented Angular APIs and local project conventions over new abstractions.',
    '- Record assumptions, compatibility evidence, validation commands, and rollback notes.',
    '- Add or update focused tests when the workflow changes runtime behavior.',
    '',
    'Recommended workflow:',
    '',
    '```txt',
    '1. Identify the affected Angular feature area and version constraints.',
    '2. Classify the change as migration, modernization, architecture, validation, or cleanup.',
    '3. Apply the smallest reversible implementation or write the decision artifact.',
    '4. Validate with the project test, lint, build, or review command that matches the risk.',
    '5. Summarize remaining risks and the next safe checkpoint.',
    '```',
    '',
    '## Do Not',
    '',
    '- Do not combine this workflow with an unrelated Angular major-version hop.',
    '- Do not invent compatibility data, CLI flags, or framework behavior.',
    '- Do not introduce dependencies unless the local implementation requires them.',
    '- Do not rewrite a complete architecture layer when a targeted boundary or decision is enough.',
    '- Do not mark the work complete without a concrete validation or a clear reason validation could not run.',
    '',
    'Avoid:',
    '',
    '```txt',
    'Changing framework version, architecture, tests, and cleanup policy in one unreviewable step.',
    '```',
    '',
    '## Review Checklist',
    '',
    '- [ ] The Angular and tooling versions are known or explicitly called out as unknown.',
    `- [ ] The ${category} scope is isolated from unrelated work.`,
    '- [ ] The recommendation uses documented APIs or existing project patterns.',
    '- [ ] Compatibility evidence is included when version-specific behavior matters.',
    '- [ ] Tests, build, lint, or manual validation steps are listed.',
    '- [ ] Rollback or follow-up notes exist for risky changes.',
    '',
    '## Expected Output',
    '',
    'When this skill is used, the agent should:',
    '',
    `1. State the ${id} diagnosis in one concise paragraph.`,
    '2. List the files, APIs, or project boundaries affected.',
    '3. Provide the smallest safe implementation or decision.',
    '4. Explain compatibility and risk assumptions.',
    '5. Provide validation commands or review checks.',
    '6. Separate follow-up work from the current scope.',
    '',
  ].join('\n');
}

function contextFor(file, frontmatter) {
  const normalized = toPosixPath(file);
  const slug = frontmatter.id.split('.').at(-1).replaceAll('-', ' ');
  const category = frontmatter.category;

  if (normalized.includes('/versioning/')) {
    return {
      problem: `Angular version compatibility for ${slug}`,
      keywords: `${slug}, compatibility matrix, peer dependencies, CLI builders, Node, TypeScript, or RxJS versions`,
    };
  }

  if (normalized.includes('/forms/')) {
    return {
      problem: `Angular forms governance for ${slug}`,
      keywords: `${slug}, typed forms, CVA, signal forms readiness, validation, or form ownership`,
    };
  }

  if (normalized.includes('/governance/')) {
    return {
      problem: `Angular governance classification for ${slug}`,
      keywords: `${slug}, migration boundaries, compatibility evidence, validation contracts, or change classification`,
    };
  }

  if (normalized.includes('/migration/angularjs')) {
    return {
      problem: `AngularJS to Angular migration planning for ${slug}`,
      keywords: `${slug}, AngularJS inventory, ngUpgrade, hybrid routing, services, templates, or decommissioning`,
    };
  }

  if (normalized.includes('/material/')) {
    return {
      problem: `Angular Material implementation guidance for ${slug}`,
      keywords: `${slug}, CDK accessibility, ARIA, theming, Material components, or headless patterns`,
    };
  }

  if (normalized.includes('/templates/')) {
    return {
      problem: `Angular template safety and diagnostics for ${slug}`,
      keywords: `${slug}, strict templates, extended diagnostics, template type checking, or remediation`,
    };
  }

  if (normalized.includes('/ssr/')) {
    return {
      problem: `Angular SSR and hydration readiness for ${slug}`,
      keywords: `${slug}, SSR safety, hydration risk, browser APIs, or server rendering readiness`,
    };
  }

  if (normalized.includes('/performance/')) {
    return {
      problem: `Angular performance governance for ${slug}`,
      keywords: `${slug}, Core Web Vitals, bundle budgets, zoneless readiness, or performance validation`,
    };
  }

  if (normalized.includes('/router/')) {
    return {
      problem: `Angular router design for ${slug}`,
      keywords: `${slug}, route configuration, lazy loading, guards, resolvers, or router tests`,
    };
  }

  if (normalized.includes('/signals/')) {
    return {
      problem: `Angular Signals design for ${slug}`,
      keywords: `${slug}, signals, computed, effects, RxJS interop, or signal state`,
    };
  }

  if (normalized.includes('/security/')) {
    return {
      problem: `Angular security review for ${slug}`,
      keywords: `${slug}, XSS, DOM sanitization, token storage, SSR security, or dependency triage`,
    };
  }

  if (normalized.includes('/testing/')) {
    return {
      problem: `Angular test strategy for ${slug}`,
      keywords: `${slug}, test strategy, TestBed, component tests, or validation gates`,
    };
  }

  return {
    problem: `${category} workflow for ${slug}`,
    keywords: `${slug} or ${category} workflow`,
  };
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
  const match = content.match(/^(---\r?\n[\s\S]*?\r?\n---)/);

  if (!match) {
    return null;
  }

  return {
    ...parseYamlSubset(match[1].replace(/^---\r?\n|\r?\n---$/g, '')),
    raw: match[1],
  };
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
