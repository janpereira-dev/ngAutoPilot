import { validateNpxSkills } from '../lib/npx-skills.mjs';

const result = validateNpxSkills();
if (result.errors.length) {
  console.error(`npx skills validation failed:\n${result.errors.map((error) => `- ${error}`).join('\n')}`);
  process.exit(1);
}
console.log(`npx skills validation passed for ${result.bundles} public gateways.`);
