#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { loadBenchmark, resolveBenchmarkPath } from '../lib/benchmark-loader.mjs';
import { validateBenchmarkCases } from '../lib/case-loader.mjs';

const repoRoot = process.cwd();
const benchmarkIds = findBenchmarks(repoRoot);
const errors = [];

for (const id of benchmarkIds) {
  try {
    const benchmark = loadBenchmark(resolveBenchmarkPath(id, repoRoot));
    validateBenchmarkCases(benchmark, { failFast: false });

    resolveTargetSkill(benchmark.targetSkill.path);
  } catch (error) {
    errors.push(`${id}: ${error.message}`);
  }
}

if (errors.length > 0) {
  console.error('Skill lab validation failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${benchmarkIds.length} skill-lab benchmark(s).`);

function findBenchmarks(root) {
  const benchmarksRoot = path.join(root, 'skill-lab', 'benchmarks');
  if (!fs.existsSync(benchmarksRoot)) return [];
  return fs
    .readdirSync(benchmarksRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(benchmarksRoot, entry.name, 'benchmark.yaml')))
    .map((entry) => entry.name)
    .sort();
}

function resolveTargetSkill(targetSkillPath) {
  const skillsRoot = fs.realpathSync(path.join(repoRoot, 'skills'));
  const resolvedTarget = path.resolve(repoRoot, targetSkillPath);
  const relativeTarget = path.relative(skillsRoot, resolvedTarget);
  const isInsideSkills = relativeTarget && !relativeTarget.startsWith(`..${path.sep}`) && !path.isAbsolute(relativeTarget);
  if (!isInsideSkills || path.basename(resolvedTarget) !== 'SKILL.md' || !fs.existsSync(resolvedTarget)) {
    throw new Error(`target skill must be under skills/**/SKILL.md: ${targetSkillPath}`);
  }
  const realTarget = fs.realpathSync(resolvedTarget);
  const realRelativeTarget = path.relative(skillsRoot, realTarget);
  if (!realRelativeTarget || realRelativeTarget.startsWith(`..${path.sep}`) || path.isAbsolute(realRelativeTarget)) {
    throw new Error(`target skill must be under skills/**/SKILL.md: ${targetSkillPath}`);
  }
  return realTarget;
}
