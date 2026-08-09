import { validateAgentPlugins } from './validate-agent-plugins.mjs';

const result = validateAgentPlugins();
if (result.errors.length) {
  console.error(result.errors.join('\n'));
  process.exit(1);
}
console.log(`Agent Plugins smoke passed for ${result.plugins.length} plugins.`);
