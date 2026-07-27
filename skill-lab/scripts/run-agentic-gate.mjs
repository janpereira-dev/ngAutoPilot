#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { runAgenticGate } from '../lib/agentic-gate.mjs';
import { assertInsideLab } from '../lib/sandbox.mjs';

const args = parseArgs(process.argv.slice(2));
const runId = args.run ?? 'manual-evaluation';
const runRoot = assertInsideLab(path.resolve('skill-lab'), path.resolve('skill-lab', 'runs', runId));
const result = runAgenticGate({
  runRoot,
  harness: args.harness ?? 'codex',
  evidencePath: args.evidence ? path.resolve(args.evidence) : undefined,
});

const outputRoot = path.join(runRoot, 'agentic-gate');
fs.mkdirSync(outputRoot, { recursive: true });
fs.writeFileSync(path.join(outputRoot, 'gate-report.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(result.status);
process.exit(result.passed ? 0 : 1);

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index].startsWith('--')) result[argv[index].slice(2)] = argv[index + 1];
  }
  return result;
}
