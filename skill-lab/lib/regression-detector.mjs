export function detectRegressions(baselineResults, candidateResults) {
  const baselineById = new Map(baselineResults.map((item) => [item.id, item]));
  const candidateById = new Map(candidateResults.map((item) => [item.id, item]));
  const regressions = [];
  const criticalRegressions = [];
  const improvements = [];
  const unchanged = [];
  const missingBaselineCases = [];
  const missingCandidateCases = [];

  for (const candidate of candidateResults) {
    const baseline = baselineById.get(candidate.id);

    if (!baseline) {
      missingBaselineCases.push(candidate);
      continue;
    }

    if (baseline.passed && !candidate.passed) {
      const regression = { id: candidate.id, baseline, candidate };
      regressions.push(regression);

      if (baseline.criticality === 'critical' || candidate.criticalFailure) {
        criticalRegressions.push(regression);
      }
      continue;
    }

    if (!baseline.passed && !candidate.passed && scoreValue(candidate) < scoreValue(baseline)) {
      regressions.push({ id: candidate.id, baseline, candidate });
      continue;
    }

    if (!baseline.passed && candidate.passed) {
      improvements.push({ id: candidate.id, baseline, candidate });
      continue;
    }

    unchanged.push({ id: candidate.id, baseline, candidate });
  }

  for (const baseline of baselineResults) {
    if (!candidateById.has(baseline.id)) {
      missingCandidateCases.push(baseline);
    }
  }

  return { regressions, criticalRegressions, improvements, unchanged, missingBaselineCases, missingCandidateCases };
}

function scoreValue(result) {
  const softScore = typeof result.softScore === 'number' ? result.softScore : 0;
  return (result.hardScore ?? 0) + softScore / 100;
}
