export function runGate(input) {
  const status = firstFailure(input) ?? 'ACCEPTED_FOR_TEST';

  return {
    status,
    accepted: status === 'ACCEPTED_FOR_TEST',
  };
}

function firstFailure(input) {
  if (!input.frontmatterIsEqual) return 'REJECTED_STRUCTURE';
  if (!input.structureIsValid) return 'REJECTED_STRUCTURE';
  if (!input.securityPassed) return 'REJECTED_SECURITY';
  if ((input.criticalFailures?.length ?? 0) > 0) return 'REJECTED_CRITICAL_FAILURE';
  if ((input.criticalRegressions?.length ?? 0) > 0) return 'REJECTED_CRITICAL_REGRESSION';
  if (input.candidateAggregate.hardScore < input.baselineAggregate.hardScore) return 'REJECTED_NO_IMPROVEMENT';
  if (input.candidateAggregate.softMedian < input.baselineAggregate.softMedian + 0.02) return 'REJECTED_NO_IMPROVEMENT';
  if ((input.improvedCases?.length ?? 0) < 1) return 'REJECTED_NO_IMPROVEMENT';
  if ((input.winningRuns ?? 0) < 2) return 'REJECTED_UNSTABLE';
  if (input.candidateAggregate.tokenCount > input.limits.maxCandidateTokens) return 'REJECTED_SIZE';
  if (input.candidateAggregate.changedLinesPercent > input.limits.maxChangedLinesPercent) return 'REJECTED_SIZE';
  if ((input.crossHarnessRegressionCount ?? 0) > 0) return 'REJECTED_CROSS_HARNESS_REGRESSION';
  if (!input.testPassed) return 'REJECTED_TEST';
  if (!input.adversarialPassed) return 'REJECTED_ADVERSARIAL';
  if (!input.repositoryGatesPassed) return 'REJECTED_REPOSITORY_GATES';
  return null;
}
