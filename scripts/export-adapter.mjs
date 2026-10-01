import path from 'node:path';
import { exportAdapter } from '../adapters/_shared/exporter.mjs';
const [, , agent, packId = 'ngautopilot-core', output = path.join('dist', 'adapters', agent ?? 'unknown')] = process.argv;
try {
  if (!agent) throw new Error('Usage: npm run skills:export -- <adapter> [pack] [output]');
  const result = exportAdapter({ sourceRoot: process.cwd(), agent, packId, output });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
