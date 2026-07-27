#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { loadBenchmark, resolveBenchmarkPath } from '../lib/benchmark-loader.mjs';
import { sha256File } from '../lib/hash-utils.mjs';
import { assertInsideLab } from '../lib/sandbox.mjs';

const args = parseArgs(process.argv.slice(2));
const benchmarkId = args.benchmark ?? 'angular-upgrade-validation-gate';
const benchmark = loadBenchmark(resolveBenchmarkPath(benchmarkId));
const targetSkillPath = path.resolve(benchmark.targetSkill.path);
const runId = args.run ?? `${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}-${benchmark.id}`;
const runRoot = assertInsideLab(path.join('skill-lab', 'runs'), path.join('skill-lab', 'runs', runId));
fs.mkdirSync(runRoot, { recursive: true });

const baselineTarget = path.join(runRoot, 'baseline.SKILL.md');
fs.copyFileSync(targetSkillPath, baselineTarget);
fs.writeFileSync(path.join(runRoot, 'baseline.sha256'), `${sha256File(targetSkillPath)}\n`, 'utf8');

const manifest = {
  runId,
  repository: 'janpereira-dev/ngAutoPilot',
  repositoryCommit: currentGitSha(),
  targetSkillPath: benchmark.targetSkill.path,
  targetSkillHash: sha256File(targetSkillPath),
  benchmarkId: benchmark.id,
  benchmarkVersion: benchmark.version,
  benchmarkPath: path.relative(process.cwd(), benchmark.path).split(path.sep).join('/'),
  createdAt: new Date().toISOString(),
};

fs.writeFileSync(path.join(runRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(runRoot, 'benchmark.snapshot.json'), `${JSON.stringify(benchmark, null, 2)}\n`, 'utf8');
console.log(runRoot);

function currentGitSha() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : 'unknown';
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index].startsWith('--')) result[argv[index].slice(2)] = argv[index + 1];
  }
  return result;
}
