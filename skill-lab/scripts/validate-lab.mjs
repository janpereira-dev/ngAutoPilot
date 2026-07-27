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

    const targetSkill = path.join(repoRoot, benchmark.targetSkill.path);
    if (!fs.existsSync(targetSkill)) {
      errors.push(`${id}: target skill does not exist: ${benchmark.targetSkill.path}`);
    }
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
