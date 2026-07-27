import fs from 'node:fs';
import path from 'node:path';

import { assertInsideLab } from './sandbox.mjs';

export function collectGateEvidence(runRoot, stage = 'validation') {
  const labRoot = path.resolve('skill-lab');
  const safeRunRoot = assertInsideLab(labRoot, runRoot);
  const testAggregate = readOptionalJson(path.join(safeRunRoot, 'candidate-results', 'test', 'aggregate.json'), null);
  const adversarialAggregate = readOptionalJson(path.join(safeRunRoot, 'candidate-results', 'adversarial', 'aggregate.json'), null);
  const repositoryGate = readOptionalJson(path.join(safeRunRoot, 'repository-gates', 'report.json'), null);
  const agenticGate = readOptionalJson(path.join(safeRunRoot, 'agentic-gate', 'gate-report.json'), null);
  const comparisonSummary = readOptionalJson(path.join(safeRunRoot, 'comparison', 'summary.json'), null);

  return {
    stage,
    testPassed: aggregatePassed(testAggregate),
    adversarialPassed: aggregatePassed(adversarialAggregate),
    repositoryGatesPassed: Boolean(repositoryGate?.passed),
    crossHarnessRegressionCount: agenticGate?.passed === true
      ? Number(agenticGate.crossHarnessRegressionCount ?? comparisonSummary?.crossHarnessRegressionCount ?? 0)
      : 1,
    winningRuns: Number(comparisonSummary?.winningRuns ?? 0),
    artifacts: {
      testAggregate: toRelative(safeRunRoot, path.join(safeRunRoot, 'candidate-results', 'test', 'aggregate.json')),
      adversarialAggregate: toRelative(safeRunRoot, path.join(safeRunRoot, 'candidate-results', 'adversarial', 'aggregate.json')),
      repositoryGate: toRelative(safeRunRoot, path.join(safeRunRoot, 'repository-gates', 'report.json')),
      agenticGate: toRelative(safeRunRoot, path.join(safeRunRoot, 'agentic-gate', 'gate-report.json')),
    },
    missingArtifacts: [
      ['testAggregate', testAggregate],
      ['adversarialAggregate', adversarialAggregate],
      ['repositoryGate', repositoryGate],
      ['agenticGate', agenticGate],
      ['comparisonSummary', comparisonSummary],
    ]
      .filter(([, value]) => value === null)
      .map(([name]) => name),
  };
}

export function changedLinesPercent(baselineSkill, candidateSkill) {
  const baseline = baselineSkill.split(/\r?\n/);
  const candidate = candidateSkill.split(/\r?\n/);
  const maxLines = Math.max(baseline.length, candidate.length, 1);
  const changed = maxLines - longestCommonSubsequenceLength(baseline, candidate);

  return Number(((changed / maxLines) * 100).toFixed(2));
}

function longestCommonSubsequenceLength(left, right) {
  let previous = Array(right.length + 1).fill(0);

  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    const current = Array(right.length + 1).fill(0);

    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      current[rightIndex + 1] = left[leftIndex] === right[rightIndex]
        ? previous[rightIndex] + 1
        : Math.max(previous[rightIndex + 1], current[rightIndex]);
    }

    previous = current;
  }

  return previous[right.length];
}

function aggregatePassed(aggregate) {
  if (!aggregate) return false;
  if ((aggregate.criticalFailures?.length ?? 0) > 0) return false;
  return aggregate.totalCases > 0 && aggregate.passedCases === aggregate.totalCases;
}

function readOptionalJson(filePath, fallback) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : fallback;
}

function toRelative(root, filePath) {
  return fs.existsSync(filePath) ? path.relative(root, filePath).split(path.sep).join('/') : null;
}
