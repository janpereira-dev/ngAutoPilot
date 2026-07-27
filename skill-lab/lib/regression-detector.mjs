export function detectRegressions(baselineResults, candidateResults) {
  const baselineById = new Map(baselineResults.map((item) => [item.id, item]));
  const regressions = [];
  const criticalRegressions = [];
  const improvements = [];
  const unchanged = [];

  for (const candidate of candidateResults) {
    const baseline = baselineById.get(candidate.id);

    if (!baseline) continue;

    if (baseline.passed && !candidate.passed) {
      const regression = { id: candidate.id, baseline, candidate };
      regressions.push(regression);

      if (baseline.criticality === 'critical' || candidate.criticalFailure) {
        criticalRegressions.push(regression);
      }
      continue;
    }

    if (!baseline.passed && candidate.passed) {
      improvements.push({ id: candidate.id, baseline, candidate });
      continue;
    }

    unchanged.push({ id: candidate.id, baseline, candidate });
  }

  return { regressions, criticalRegressions, improvements, unchanged };
}
