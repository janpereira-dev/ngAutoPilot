import fs from 'node:fs';
import path from 'node:path';

const [, , adapterName] = process.argv;

const adapters = {
  generic: {
    source: 'AGENT.template.md',
    output: 'AGENT.md',
  },
  copilot: {
    source: 'copilot-instructions.template.md',
    output: 'copilot-instructions.md',
  },
  claude: {
    source: 'CLAUDE.template.md',
    output: 'CLAUDE.md',
  },
  codex: {
    source: 'AGENTS.template.md',
    output: 'AGENTS.md',
  },
  cursor: {
    source: 'cursor-rules.template.md',
    output: 'cursor-rules.md',
  },
  gemini: {
    source: 'GEMINI.template.md',
    output: 'GEMINI.md',
  },
};

if (!adapterName || !adapters[adapterName]) {
  console.error(`Usage: npm run skills:export -- <${Object.keys(adapters).join('|')}>`);
  process.exit(1);
}

const adapter = adapters[adapterName];
const sourcePath = path.join('adapters', adapterName, adapter.source);
const outputDir = path.join('dist', 'adapters', adapterName);
const outputPath = path.join(outputDir, adapter.output);

if (!fs.existsSync(sourcePath)) {
  console.error(`Adapter template not found: ${toPosixPath(sourcePath)}`);
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.copyFileSync(sourcePath, outputPath);

console.log(`Exported adapter: ${toPosixPath(outputPath)}`);

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
