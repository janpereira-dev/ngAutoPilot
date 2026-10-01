import { validateOpenAiPackage } from '../lib/openai-package.mjs';

const result = await validateOpenAiPackage();
if (result.errors.length) {
  console.error(`OpenAI package validation failed:\n${result.errors.map((error) => `- ${error}`).join('\n')}`);
  process.exit(1);
}
console.log(`OpenAI package validation passed for ${result.skillFiles} canonical skill files at version ${result.version}.`);