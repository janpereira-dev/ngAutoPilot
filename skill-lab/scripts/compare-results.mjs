#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { detectRegressions } from '../lib/regression-detector.mjs';
import { sha256File } from '../lib/hash-utils.mjs';
import { assertInsideLab } from '../lib/sandbox.mjs';

const args = parseArgs(process.argv.slice(2));
const runRoot = assertInsideLab(path.join('skill-lab', 'runs'), path.join('skill-lab', 'runs', args.run ?? 'manual-evaluation'));
const repeatedComparisons = compareRepeatedRuns(runRoot, args);
const baseline = repeatedComparisons ? [] : readResults(args.baseline ?? path.join(runRoot, 'baseline-results', 'validation', 'results.jsonl'));
const candidate = repeatedComparisons ? [] : readResults(args.candidate ?? path.join(runRoot, 'candidate-results', 'validation', 'results.jsonl'));
const comparison = repeatedComparisons
  ? mergeComparisons(Object.values(repeatedComparisons))
  : detectRegressions(baseline, candidate);
const candidateHash = sha256File(path.join(runRoot, 'optimization', 'candidate.SKILL.md'));
const candidateAggregate = readOptionalJson(path.join(runRoot, 'candidate-results', 'validation', 'aggregate.json'), {});
const summary = {
  candidateHash,
  comparison: {
    improvements: comparison.improvements,
    criticalRegressions: comparison.criticalRegressions,
    missingBaselineCases: comparison.missingBaselineCases,
    missingCandidateCases: comparison.missingCandidateCases,
  },
  regressions: comparison.regressions.length,
  criticalRegressions: comparison.criticalRegressions.length,
  improvements: comparison.improvements.length,
  unchanged: comparison.unchanged.length,
  missingBaselineCases: comparison.missingBaselineCases.length,
  missingCandidateCases: comparison.missingCandidateCases.length,
  winningRuns: comparison.regressions.length === 0 && comparison.missingBaselineCases.length === 0 && comparison.missingCandidateCases.length === 0
    ? Number(candidateAggregate.runs ?? 1)
    : 0,
};
if (repeatedComparisons) {
  summary.comparedRuns = Object.keys(repeatedComparisons).length;
  summary.runComparisons = Object.fromEntries(Object.entries(repeatedComparisons).map(([runName, runComparison]) => [runName, {
    regressions: runComparison.regressions.length,
    missingBaselineCases: runComparison.missingBaselineCases.length,
    missingCandidateCases: runComparison.missingCandidateCases.length,
    winning: isWinningRun(runComparison),
  }]));
  summary.winningRuns = Object.values(repeatedComparisons).filter(isWinningRun).length;
}
const outputRoot = path.join(runRoot, 'comparison');
fs.mkdirSync(outputRoot, { recursive: true });

for (const [name, value] of Object.entries(comparison)) {
  fs.writeFileSync(path.join(outputRoot, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

fs.writeFileSync(path.join(outputRoot, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

console.log(`Regressions: ${comparison.regressions.length}; critical: ${comparison.criticalRegressions.length}; improvements: ${comparison.improvements.length}`);

function readResults(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function readOptionalJson(filePath, fallback) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : fallback;
}

function compareRepeatedRuns(runRoot, args) {
  if (args.baseline || args.candidate) return null;
  const baselineRoot = path.join(runRoot, 'baseline-results', 'validation');
  const candidateRoot = path.join(runRoot, 'candidate-results', 'validation');
  const runNames = new Set([...findRunNames(baselineRoot), ...findRunNames(candidateRoot)]);
  if (runNames.size === 0) return null;

  return Object.fromEntries([...runNames].sort().map((runName) => {
    const baselinePath = path.join(baselineRoot, runName, 'results.jsonl');
    const candidatePath = path.join(candidateRoot, runName, 'results.jsonl');
    const baseline = fs.existsSync(baselinePath) ? readResults(baselinePath) : [];
    const candidate = fs.existsSync(candidatePath) ? readResults(candidatePath) : [];
    return [runName, detectRegressions(baseline, candidate)];
  }));
}

function findRunNames(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^run-\d+$/.test(entry.name))
    .map((entry) => entry.name);
}

function mergeComparisons(comparisons) {
  return Object.fromEntries(['regressions', 'criticalRegressions', 'improvements', 'unchanged', 'missingBaselineCases', 'missingCandidateCases']
    .map((key) => [key, comparisons.flatMap((comparison) => comparison[key])]));
}

function isWinningRun(comparison) {
  return comparison.regressions.length === 0
    && comparison.missingBaselineCases.length === 0
    && comparison.missingCandidateCases.length === 0;
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index].startsWith('--')) result[argv[index].slice(2)] = argv[index + 1];
  }
  return result;
}
