import path from 'node:path';

import { loadBenchmark, resolveBenchmarkPath } from './benchmark-loader.mjs';
import { assertInsideLab } from './sandbox.mjs';

export function buildSkillOptContract({ benchmarkId, runRoot, epochs, editBudget, seed }) {
  const benchmark = loadBenchmark(resolveBenchmarkPath(benchmarkId));
  const labRoot = path.resolve('skill-lab');
  const safeRunRoot = assertInsideLab(labRoot, runRoot);
  const outputDirectory = assertInsideLab(labRoot, path.join(safeRunRoot, 'optimization'));

  return {
    benchmark: benchmark.id,
    benchmarkVersion: benchmark.version,
    baselineSkill: toPosixPath(assertInsideLab(labRoot, path.join(safeRunRoot, 'baseline.SKILL.md'))),
    outputDirectory: toPosixPath(outputDirectory),
    epochs: clampInteger(epochs, benchmark.limits?.maxEpochs ?? 3),
    editBudget: clampInteger(editBudget, benchmark.limits?.maxEditsPerEpoch ?? 4),
    seed: Number.isInteger(Number(seed)) ? Number(seed) : 42,
    optimizerModel: modelOrDefault(process.env.SKILL_LAB_OPTIMIZER_MODEL),
    targetModel: modelOrDefault(process.env.SKILL_LAB_TARGET_MODEL),
    targetSkill: benchmark.targetSkill.path,
    protectFrontmatter: Boolean(benchmark.targetSkill.protectFrontmatter),
    splits: {
      train: toPosixPath(path.join(benchmark.root, benchmark.splits.train)),
      validation: toPosixPath(path.join(benchmark.root, benchmark.splits.validation)),
    },
    limits: benchmark.limits ?? {},
  };
}

function clampInteger(value, fallback) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, fallback);
}

function modelOrDefault(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : 'gpt-4.1-mini';
}

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
