#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { loadBenchmark, resolveBenchmarkPath } from '../lib/benchmark-loader.mjs';
import { loadBenchmarkCases } from '../lib/case-loader.mjs';
import { aggregateResults, scoreSkillAgainstCase } from '../lib/deterministic-scorer.mjs';
import { sha256File } from '../lib/hash-utils.mjs';
import { generateEvaluationReport } from '../lib/report-generator.mjs';
import { assertInsideLab } from '../lib/sandbox.mjs';

const args = parseArgs(process.argv.slice(2));
const benchmark = loadBenchmark(resolveBenchmarkPath(args.benchmark ?? 'angular-upgrade-validation-gate'));
const runRoot = args.run ? assertInsideLab(path.join('skill-lab', 'runs'), path.join('skill-lab', 'runs', args.run)) : null;
const skillPath = args.skill
  ? path.resolve(args.skill)
  : runRoot && fs.existsSync(path.join(runRoot, 'optimization', 'candidate.SKILL.md'))
    ? path.join(runRoot, 'optimization', 'candidate.SKILL.md')
    : path.resolve(benchmark.targetSkill.path);
const splits = (args.splits ?? 'validation').split(',').map((item) => item.trim());
const runs = Number(args.runs ?? 1);
const outputRoot = args.output
  ? assertInsideLab(path.resolve('skill-lab'), path.resolve(args.output))
  : args.run
    ? path.join(runRoot, 'candidate-results')
    : path.join('skill-lab', 'runs', 'manual-evaluation');
const skillContent = fs.readFileSync(skillPath, 'utf8');
const casesBySplit = loadBenchmarkCases(benchmark);

for (const split of splits) {
  const cases = casesBySplit[split];
  if (!cases) throw new Error(`Unknown split: ${split}`);

  const runResults = Array.from({ length: runs }, () => cases.map((item) => scoreSkillAgainstCase(skillContent, item, benchmark.root)));
  const results = runResults[0];
  const aggregate = {
    ...aggregateResults(results),
    runs,
    skillPath: path.relative(process.cwd(), skillPath).split(path.sep).join('/'),
    skillHash: sha256File(skillPath),
  };
  const splitRoot = path.join(outputRoot, split);
  fs.mkdirSync(splitRoot, { recursive: true });
  if (runs > 1) {
    runResults.forEach((runResult, index) => {
      const repeatedRoot = path.join(splitRoot, `run-${index + 1}`);
      fs.mkdirSync(repeatedRoot, { recursive: true });
      fs.writeFileSync(path.join(repeatedRoot, 'results.jsonl'), `${runResult.map((item) => JSON.stringify(item)).join('\n')}\n`, 'utf8');
      fs.writeFileSync(path.join(repeatedRoot, 'aggregate.json'), `${JSON.stringify({ ...aggregateResults(runResult), skillHash: aggregate.skillHash }, null, 2)}\n`, 'utf8');
    });
  }
  fs.writeFileSync(path.join(splitRoot, 'results.jsonl'), `${results.map((item) => JSON.stringify(item)).join('\n')}\n`, 'utf8');
  fs.writeFileSync(path.join(splitRoot, 'aggregate.json'), `${JSON.stringify(aggregate, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(splitRoot, 'report.md'), generateEvaluationReport({ benchmark, split, aggregate, results }), 'utf8');
  console.log(`${split}: ${aggregate.passedCases}/${aggregate.totalCases} passed`);
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index].startsWith('--')) result[argv[index].slice(2)] = argv[index + 1];
  }
  return result;
}
