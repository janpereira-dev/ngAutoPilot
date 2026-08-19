#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadBenchmark, resolveBenchmarkPath } from '../lib/benchmark-loader.mjs';
import { validateBenchmarkCases } from '../lib/case-loader.mjs';

const repoRoot = process.cwd();
if (isMainModule()) runValidation(repoRoot);

export function runValidation(root = process.cwd()) {
  const benchmarkIds = findBenchmarks(root);
  const errors = validateCanonicalFixtureManifests(root);

  for (const id of benchmarkIds) {
    try {
      const benchmark = loadBenchmark(resolveBenchmarkPath(id, root));
      validateBenchmarkCases(benchmark, { failFast: false });

      resolveTargetSkill(benchmark.targetSkill.path, root);
    } catch (error) {
      errors.push(`${id}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    const message = `Skill lab validation failed:\n\n${errors.map((error) => `- ${error}`).join('\n')}`;
    if (isMainModule()) {
      console.error(message);
      process.exitCode = 1;
      return false;
    }
    throw new Error(message);
  }

  if (isMainModule()) console.log(`Validated ${benchmarkIds.length} skill-lab benchmark(s).`);
  return true;
}

function findBenchmarks(root) {
  const benchmarksRoot = path.join(root, 'skill-lab', 'benchmarks');
  if (!fs.existsSync(benchmarksRoot)) return [];
  return fs
    .readdirSync(benchmarksRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(benchmarksRoot, entry.name, 'benchmark.yaml')))
    .map((entry) => entry.name)
    .sort();
}

function resolveTargetSkill(targetSkillPath, root) {
  const skillsRoot = fs.realpathSync(path.join(root, 'skills'));
  const resolvedTarget = path.resolve(root, targetSkillPath);
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

export function validateCanonicalFixtureManifests(root) {
  const benchmarksRoot = path.join(root, 'skill-lab', 'benchmarks');
  if (!fs.existsSync(benchmarksRoot)) return [];

  const violations = [];
  for (const benchmark of findBenchmarks(root)) {
    const fixturesRoot = path.join(benchmarksRoot, benchmark, 'fixtures');
    if (!fs.existsSync(fixturesRoot)) continue;
    if (fs.lstatSync(fixturesRoot).isSymbolicLink()) {
      const relativePath = path.relative(root, fixturesRoot).split(path.sep).join('/');
      violations.push(`${relativePath}: benchmark fixtures must not contain symlinks`);
      continue;
    }
    collectFixtureManifestViolations(fixturesRoot, root, violations);
  }

  return violations.sort((left, right) => left.localeCompare(right));
}

function collectFixtureManifestViolations(currentPath, root, violations) {
  for (const entry of fs.readdirSync(currentPath, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    const entryPath = path.join(currentPath, entry.name);
    const relativePath = path.relative(root, entryPath).split(path.sep).join('/');
    const stat = fs.lstatSync(entryPath);

    if (stat.isSymbolicLink()) {
      violations.push(`${relativePath}: benchmark fixtures must not contain symlinks`);
    } else if (stat.isDirectory()) {
      collectFixtureManifestViolations(entryPath, root, violations);
    } else if (entry.name === 'package.json') {
      violations.push(`${relativePath}: benchmark fixtures must use package.fixture.json instead of package.json to avoid dependency-scanner false positives`);
    }
  }
}

function isMainModule() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}
