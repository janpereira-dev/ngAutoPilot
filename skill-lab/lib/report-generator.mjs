export function generateEvaluationReport({ benchmark, split, aggregate, results }) {
  const lines = [
    `# ${benchmark.id} ${split} Evaluation`,
    '',
    `Benchmark version: ${benchmark.version}`,
    `Cases: ${aggregate.totalCases}`,
    `Passed: ${aggregate.passedCases}`,
    `Hard score: ${aggregate.hardScore.toFixed(3)}`,
    `Soft median: ${aggregate.softMedian.toFixed(3)}`,
    '',
    '## Cases',
    '',
    '| Case | Passed | Hard | Soft | Critical failure |',
    '| --- | --- | ---: | ---: | --- |',
    ...results.map((item) => `| ${item.id} | ${item.passed ? 'yes' : 'no'} | ${item.hardScore.toFixed(3)} | ${item.softScore.toFixed(3)} | ${item.criticalFailure ? 'yes' : 'no'} |`),
    '',
  ];

  return lines.join('\n');
}
