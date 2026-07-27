#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { buildSkillOptContract } from '../lib/skillopt-contract.mjs';
import { assertInsideLab } from '../lib/sandbox.mjs';

const args = parseArgs(process.argv.slice(2));
const runId = args.run ?? 'manual-evaluation';
const runRoot = assertInsideLab(path.resolve('skill-lab'), path.resolve('skill-lab', 'runs', runId));
const outputDirectory = path.join(runRoot, 'optimization');
const contract = buildSkillOptContract({
  benchmarkId: args.benchmark ?? 'angular-upgrade-validation-gate',
  runRoot,
  epochs: args.epochs,
  editBudget: args.editBudget,
  seed: args.seed,
});
if (args.optimizerModel) contract.optimizerModel = args.optimizerModel;
if (args.targetModel) contract.targetModel = args.targetModel;
const contractPath = path.join(outputDirectory, 'skillopt-contract.json');

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`, 'utf8');

const pythonPath = path.resolve('skill-lab', 'python');
const result = spawnSync(pythonExecutable(), ['-m', 'ngautopilot_skillopt.bridge', contractPath], {
  encoding: 'utf8',
  env: {
    ...process.env,
    PYTHONPATH: process.env.PYTHONPATH ? `${pythonPath}${path.delimiter}${process.env.PYTHONPATH}` : pythonPath,
  },
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

const candidatePath = path.join(outputDirectory, 'candidate.SKILL.md');
if (result.status !== 0 || !fs.existsSync(candidatePath)) {
  const guidance = [
    'SkillOpt bridge did not produce candidate.SKILL.md.',
    `Contract: ${path.relative(process.cwd(), contractPath).split(path.sep).join('/')}`,
  ];

  if (/does not expose a direct optimize API/.test(result.stderr ?? '')) {
    guidance.push('Implement the NgAutoPilot SkillOpt EnvAdapter in skill-lab/python/ngautopilot_skillopt/bridge.py.');
  } else {
    guidance.push('Install the local bridge dependencies with: python -m pip install -e skill-lab/python');
    guidance.push('If SkillOpt changed its Python API, update only skill-lab/python/ngautopilot_skillopt/bridge.py.');
  }

  console.error(guidance.join('\n'));
  process.exit(result.status === 0 ? 2 : result.status ?? 2);
}

console.log(path.relative(process.cwd(), candidatePath).split(path.sep).join('/'));

function pythonExecutable() {
  return process.env.PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3');
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index].startsWith('--')) result[argv[index].slice(2)] = argv[index + 1];
  }
  return result;
}
