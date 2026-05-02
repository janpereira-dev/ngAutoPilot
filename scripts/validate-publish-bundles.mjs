import fs from 'node:fs';
import path from 'node:path';

const outputRoot = path.join('dist', 'publish');
const expectedSites = [
  'autoskills-sh',
  'skillsmp-es',
  'skillsllm',
  'lobehub-skills',
  'mcpmarket-skills',
];

const errors = [];

if (!fs.existsSync(outputRoot)) {
  errors.push(`missing publish output directory: ${toPosixPath(outputRoot)}`);
} else {
  for (const slug of expectedSites) {
    const siteDir = path.join(outputRoot, slug);
    const requiredFiles = ['manifest.json', 'listing.md', 'README.md', 'catalog.json'];

    if (!fs.existsSync(siteDir)) {
      errors.push(`missing publish bundle: ${toPosixPath(siteDir)}`);
      continue;
    }

    for (const file of requiredFiles) {
      const fullPath = path.join(siteDir, file);
      if (!fs.existsSync(fullPath)) {
        errors.push(`missing publish artifact: ${toPosixPath(fullPath)}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error('Publish bundle validation failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Publish bundle validation passed for ${expectedSites.length} bundles.`);

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
