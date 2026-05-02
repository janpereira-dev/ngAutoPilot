import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readmePath = path.join(root, 'README.md');
const catalogPath = path.join(root, 'catalog.json');
const claudeMarketplacePath = path.join(root, '.claude-plugin', 'marketplace.json');
const codexMarketplacePath = path.join(root, '.agents', 'plugins', 'marketplace.json');

const errors = [];

const skillFiles = findSkillFiles(path.join(root, 'skills'));
const skillCount = skillFiles.length;
const readme = fs.readFileSync(readmePath, 'utf8');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const claudeMarketplace = JSON.parse(fs.readFileSync(claudeMarketplacePath, 'utf8'));
const codexMarketplace = JSON.parse(fs.readFileSync(codexMarketplacePath, 'utf8'));

const catalogCount = Array.isArray(catalog.skills) ? catalog.skills.length : 0;
if (catalogCount !== skillCount) {
  errors.push(`catalog.json skill count ${catalogCount} does not match skills/ SKILL.md count ${skillCount}`);
}

const readmeCount = readme.match(/Current catalog size:\s+\*\*(\d+)\s+skills\*\*/i);
if (!readmeCount) {
  errors.push('README.md is missing the current catalog size line');
} else if (Number(readmeCount[1]) !== skillCount) {
  errors.push(`README.md catalog size ${readmeCount[1]} does not match skills/ SKILL.md count ${skillCount}`);
}

const requiredFamilies = [
  'skills/angular/versioning/',
  'skills/angular/upgrades/',
  'skills/angular/modernization/',
  'skills/angular/architecture/',
  'skills/angular/microfrontends/',
  'skills/angular/docs/',
  'skills/typescript/',
  'skills/javascript/',
  'skills/quality/',
];

for (const family of requiredFamilies) {
  if (!readme.includes(family)) {
    errors.push(`README.md is missing skill family reference: ${family}`);
  }
}

validateMarketplace(claudeMarketplace, 'Claude Code', errors, {
  expectedEntries: [
    'ngautopilot-core',
    'ngautopilot-angular',
    'ngautopilot-quality',
    'ngautopilot-quality-lint',
    'ngautopilot-quality-deadcode-sonar',
    'ngautopilot-typescript',
    'ngautopilot-angular-microfrontends',
  ],
  localPathShape: (source) => source.startsWith('./plugins/'),
});

validateMarketplace(codexMarketplace, 'Codex', errors, {
  expectedEntries: [
    'ngautopilot-core',
    'ngautopilot-angular',
    'ngautopilot-quality',
    'ngautopilot-quality-lint',
    'ngautopilot-quality-deadcode-sonar',
    'ngautopilot-typescript',
    'ngautopilot-angular-microfrontends',
  ],
  localPathShape: (source) => source.source === 'local' && typeof source.path === 'string' && source.path.startsWith('./plugins/'),
});

if (errors.length > 0) {
  console.error('Consistency validation failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Consistency validation passed for ${skillCount} skills and ${claudeMarketplace.plugins.length} marketplace entries.`);

function findSkillFiles(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findSkillFiles(fullPath));
    } else if (entry.isFile() && entry.name === 'SKILL.md') {
      files.push(fullPath);
    }
  }

  return files;
}

function validateMarketplace(marketplace, label, errorsOut, options) {
  if (!marketplace || !Array.isArray(marketplace.plugins)) {
    errorsOut.push(`${label} marketplace is missing plugins array`);
    return;
  }

  const seen = new Set();

  for (const plugin of marketplace.plugins) {
    if (!plugin || typeof plugin.name !== 'string') {
      errorsOut.push(`${label} marketplace contains an invalid plugin entry`);
      continue;
    }

    if (seen.has(plugin.name)) {
      errorsOut.push(`${label} marketplace has duplicate plugin entry: ${plugin.name}`);
    }
    seen.add(plugin.name);

    if (!options.expectedEntries.includes(plugin.name)) {
      errorsOut.push(`${label} marketplace has unexpected plugin entry: ${plugin.name}`);
    }

    if (!options.localPathShape(plugin.source)) {
      errorsOut.push(`${label} marketplace has an invalid source for ${plugin.name}`);
    }

    const pluginRoot = label === 'Codex'
      ? path.join(root, plugin.source.path)
      : path.join(root, plugin.source);

    const manifestPath = path.join(pluginRoot, '.codex-plugin', 'plugin.json');
    if (!fs.existsSync(manifestPath)) {
      errorsOut.push(`${label} plugin ${plugin.name} is missing manifest: ${toPosixPath(manifestPath)}`);
    }
  }

  for (const expected of options.expectedEntries) {
    if (!seen.has(expected)) {
      errorsOut.push(`${label} marketplace is missing expected plugin entry: ${expected}`);
    }
  }
}

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
