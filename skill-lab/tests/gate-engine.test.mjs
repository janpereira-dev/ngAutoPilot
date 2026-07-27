import assert from 'node:assert/strict';
import test from 'node:test';

import { runGate } from '../lib/gate-engine.mjs';

test('runGate rejects critical regressions before considering soft improvement', () => {
  const result = runGate({
    frontmatterIsEqual: true,
    structureIsValid: true,
    securityPassed: true,
    baselineAggregate: { hardScore: 0.8, softMedian: 0.5 },
    candidateAggregate: { hardScore: 0.9, softMedian: 0.7, tokenCount: 1000, changedLinesPercent: 10 },
    improvedCases: ['ordinary-case'],
    criticalFailures: [],
    criticalRegressions: ['critical-case'],
    winningRuns: 3,
    crossHarnessRegressionCount: 0,
    testPassed: true,
    adversarialPassed: true,
    repositoryGatesPassed: true,
    limits: { maxCandidateTokens: 2200, maxChangedLinesPercent: 25 },
  });

  assert.equal(result.status, 'REJECTED_CRITICAL_REGRESSION');
});

test('runGate accepts only when all blocking conditions are satisfied', () => {
  const result = runGate({
    frontmatterIsEqual: true,
    structureIsValid: true,
    securityPassed: true,
    baselineAggregate: { hardScore: 0.8, softMedian: 0.5 },
    candidateAggregate: { hardScore: 0.9, softMedian: 0.53, tokenCount: 1000, changedLinesPercent: 10 },
    improvedCases: ['case-a'],
    criticalFailures: [],
    criticalRegressions: [],
    winningRuns: 2,
    crossHarnessRegressionCount: 0,
    testPassed: true,
    adversarialPassed: true,
    repositoryGatesPassed: true,
    limits: { maxCandidateTokens: 2200, maxChangedLinesPercent: 25 },
  });

  assert.equal(result.status, 'ACCEPTED_FOR_TEST');
});

test('runGate rejects candidates below configured minimum hard score', () => {
  const result = runGate({
    frontmatterIsEqual: true,
    structureIsValid: true,
    securityPassed: true,
    baselineAggregate: { hardScore: 0.8, softMedian: 0.5 },
    candidateAggregate: { hardScore: 0.9, softMedian: 0.7, tokenCount: 1000, changedLinesPercent: 10 },
    improvedCases: ['case-a'],
    criticalFailures: [],
    criticalRegressions: [],
    winningRuns: 2,
    crossHarnessRegressionCount: 0,
    testPassed: true,
    adversarialPassed: true,
    repositoryGatesPassed: true,
    limits: { maxCandidateTokens: 2200, maxChangedLinesPercent: 25 },
    gate: { minimumHardScore: 0.95, minimumSoftDelta: 0.02, requiredWinningRuns: 2 },
  });

  assert.equal(result.status, 'REJECTED_NO_IMPROVEMENT');
});

test('runGate rejects candidates above configured growth limit', () => {
  const result = runGate({
    frontmatterIsEqual: true,
    structureIsValid: true,
    securityPassed: true,
    baselineAggregate: { hardScore: 0.8, softMedian: 0.5 },
    candidateAggregate: { hardScore: 0.96, softMedian: 0.7, tokenCount: 1000, changedLinesPercent: 10, growthPercent: 21 },
    improvedCases: ['case-a'],
    criticalFailures: [],
    criticalRegressions: [],
    winningRuns: 2,
    crossHarnessRegressionCount: 0,
    testPassed: true,
    adversarialPassed: true,
    repositoryGatesPassed: true,
    limits: { maxCandidateTokens: 2200, maxChangedLinesPercent: 25, maxGrowthPercent: 20 },
    gate: { minimumHardScore: 0.95, minimumSoftDelta: 0.02, requiredWinningRuns: 2 },
  });

  assert.equal(result.status, 'REJECTED_SIZE');
});
