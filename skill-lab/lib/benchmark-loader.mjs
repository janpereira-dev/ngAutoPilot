import fs from 'node:fs';
import path from 'node:path';

import { parseSimpleYaml } from './simple-yaml.mjs';

export function loadBenchmark(benchmarkPath) {
  const root = path.dirname(path.resolve(benchmarkPath));
  const benchmark = parseSimpleYaml(fs.readFileSync(benchmarkPath, 'utf8'));

  if (!benchmark.id) throw new Error(`${benchmarkPath}: missing benchmark id`);
  if (!benchmark.version) throw new Error(`${benchmarkPath}: missing benchmark version`);
  if (!benchmark.targetSkill?.path) throw new Error(`${benchmarkPath}: missing targetSkill.path`);
  if (!benchmark.splits) throw new Error(`${benchmarkPath}: missing splits`);

  return { ...benchmark, root, path: path.resolve(benchmarkPath) };
}

export function resolveBenchmarkPath(benchmarkId, repoRoot = process.cwd()) {
  return path.join(repoRoot, 'skill-lab', 'benchmarks', benchmarkId, 'benchmark.yaml');
}
