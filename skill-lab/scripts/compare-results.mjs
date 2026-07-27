#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { detectRegressions } from '../lib/regression-detector.mjs';

const args = parseArgs(process.argv.slice(2));
const runRoot = path.resolve('skill-lab', 'runs', args.run ?? 'manual-evaluation');
const baseline = readResults(args.baseline ?? path.join(runRoot, 'baseline-results', 'validation', 'results.jsonl'));
const candidate = readResults(args.candidate ?? path.join(runRoot, 'candidate-results', 'validation', 'results.jsonl'));
const comparison = detectRegressions(baseline, candidate);
const outputRoot = path.join(runRoot, 'comparison');
fs.mkdirSync(outputRoot, { recursive: true });

for (const [name, value] of Object.entries(comparison)) {
  fs.writeFileSync(path.join(outputRoot, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

console.log(`Regressions: ${comparison.regressions.length}; critical: ${comparison.criticalRegressions.length}; improvements: ${comparison.improvements.length}`);

function readResults(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index].startsWith('--')) result[argv[index].slice(2)] = argv[index + 1];
  }
  return result;
}
