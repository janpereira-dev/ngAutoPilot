#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { loadBenchmark, resolveBenchmarkPath } from '../lib/benchmark-loader.mjs';
import { resolveFixturePath } from '../lib/case-loader.mjs';
import { sha256, sha256File } from '../lib/hash-utils.mjs';
import { assertInsideLab } from '../lib/sandbox.mjs';

const args = parseArgs(process.argv.slice(2));
const benchmarkId = args.benchmark ?? 'angular-upgrade-validation-gate';
const benchmark = loadBenchmark(resolveBenchmarkPath(benchmarkId));
const targetSkillPath = path.resolve(benchmark.targetSkill.path);
const baselineSkillPath = path.resolve(benchmark.baselineSkill?.path ?? benchmark.targetSkill.path);
const runId = args.run ?? `${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}-${benchmark.id}`;
const runRoot = assertInsideLab(path.join('skill-lab', 'runs'), path.join('skill-lab', 'runs', runId));
fs.mkdirSync(runRoot, { recursive: true });

const baselineTarget = path.join(runRoot, 'baseline.SKILL.md');
fs.copyFileSync(baselineSkillPath, baselineTarget);
fs.writeFileSync(path.join(runRoot, 'baseline.sha256'), `${sha256File(baselineSkillPath)}\n`, 'utf8');

const manifest = {
  runId,
  repository: 'janpereira-dev/ngAutoPilot',
  repositoryCommit: currentGitSha(),
  targetSkillPath: benchmark.targetSkill.path,
  targetSkillHash: sha256File(targetSkillPath),
  baselineSkillPath: path.relative(process.cwd(), baselineSkillPath).split(path.sep).join('/'),
  baselineSkillHash: sha256File(baselineSkillPath),
  benchmarkId: benchmark.id,
  benchmarkVersion: benchmark.version,
  benchmarkPath: path.relative(process.cwd(), benchmark.path).split(path.sep).join('/'),
  benchmarkHash: sha256File(benchmark.path),
  rubricHash: sha256File(path.join(benchmark.root, 'rubric.json')),
  caseSetHash: hashCaseSet(benchmark),
  fixtureHash: hashReferencedFixtures(benchmark),
  createdAt: new Date().toISOString(),
};

fs.writeFileSync(path.join(runRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(runRoot, 'benchmark.snapshot.json'), `${JSON.stringify(benchmark, null, 2)}\n`, 'utf8');
console.log(runRoot);

function currentGitSha() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : 'unknown';
}

function hashCaseSet(benchmark) {
  const contents = Object.entries(benchmark.splits)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([split, relativePath]) => `${split}\n${fs.readFileSync(path.join(benchmark.root, relativePath), 'utf8')}`)
    .join('\n');
  return sha256(contents);
}

function hashReferencedFixtures(benchmark) {
  const fixturePaths = new Set();

  for (const relativePath of Object.values(benchmark.splits)) {
    const cases = fs.readFileSync(path.join(benchmark.root, relativePath), 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    for (const item of cases) {
      for (const key of ['packageJsonFixture', 'commandOutputsFixture']) {
        if (item.input?.[key]) fixturePaths.add(item.input[key]);
      }
    }
  }

  return sha256([...fixturePaths]
    .sort((left, right) => left.localeCompare(right))
    .map((relativePath) => `${relativePath}\n${fs.readFileSync(resolveFixturePath(benchmark.root, relativePath), 'utf8')}`)
    .join('\n'));
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index].startsWith('--')) result[argv[index].slice(2)] = argv[index + 1];
  }
  return result;
}
