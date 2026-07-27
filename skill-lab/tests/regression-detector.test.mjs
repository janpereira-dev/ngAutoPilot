import assert from 'node:assert/strict';
import test from 'node:test';

import { detectRegressions } from '../lib/regression-detector.mjs';

test('detectRegressions flags critical pass to fail even when aggregate improves', () => {
  const baseline = [
    { id: 'critical-case', passed: true, criticalFailure: false, hardScore: 1, softScore: 0.8 },
    { id: 'ordinary-case', passed: false, criticalFailure: false, hardScore: 0, softScore: 0.2 },
  ];
  const candidate = [
    { id: 'critical-case', passed: false, criticalFailure: true, hardScore: 0, softScore: 0.9 },
    { id: 'ordinary-case', passed: true, criticalFailure: false, hardScore: 1, softScore: 1 },
  ];

  const result = detectRegressions(baseline, candidate);

  assert.deepEqual(result.criticalRegressions.map((item) => item.id), ['critical-case']);
  assert.deepEqual(result.improvements.map((item) => item.id), ['ordinary-case']);
});

test('detectRegressions reports missing baseline and candidate cases', () => {
  const baseline = [
    { id: 'shared-case', passed: true, criticalFailure: false, hardScore: 1, softScore: 0.8 },
    { id: 'baseline-only', passed: true, criticalFailure: false, hardScore: 1, softScore: 0.7 },
  ];
  const candidate = [
    { id: 'shared-case', passed: true, criticalFailure: false, hardScore: 1, softScore: 0.9 },
    { id: 'candidate-only', passed: true, criticalFailure: false, hardScore: 1, softScore: 0.6 },
  ];

  const result = detectRegressions(baseline, candidate);

  assert.deepEqual(result.missingBaselineCases.map((item) => item.id), ['candidate-only']);
  assert.deepEqual(result.missingCandidateCases.map((item) => item.id), ['baseline-only']);
});
