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
if (!Number.isInteger(runs) || runs < 1) throw new Error('--runs must be a positive integer');
if (runs > 1) {
  throw new Error('The deterministic local evaluator cannot produce independent stability runs; use --runs 1.');
}
const outputRoot = args.output
  ? assertInsideLab(path.resolve('skill-lab'), path.resolve(args.output))
  : args.run
    ? path.join(runRoot, 'candidate-results')
    : path.join('skill-lab', 'runs', 'manual-evaluation');
const skillContent = fs.readFileSync(skillPath, 'utf8');
const casesBySplit = loadBenchmarkCases(benchmark);
const rubricWeights = loadRubricWeights(benchmark.root);

for (const split of splits) {
  const cases = casesBySplit[split];
  if (!cases) throw new Error(`Unknown split: ${split}`);

  const results = cases.map((item) => scoreSkillAgainstCase(skillContent, item, benchmark.root));
  const aggregate = {
    ...aggregateResults(results, rubricWeights),
    runs,
    skillPath: path.relative(process.cwd(), skillPath).split(path.sep).join('/'),
    skillHash: sha256File(skillPath),
  };
  const splitRoot = path.join(outputRoot, split);
  fs.mkdirSync(splitRoot, { recursive: true });
  fs.writeFileSync(path.join(splitRoot, 'results.jsonl'), `${results.map((item) => JSON.stringify(item)).join('\n')}\n`, 'utf8');
  fs.writeFileSync(path.join(splitRoot, 'aggregate.json'), `${JSON.stringify(aggregate, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(splitRoot, 'report.md'), generateEvaluationReport({ benchmark, split, aggregate, results }), 'utf8');
  console.log(`${split}: ${aggregate.passedCases}/${aggregate.totalCases} passed`);
}

function loadRubricWeights(benchmarkRoot) {
  const rubric = JSON.parse(fs.readFileSync(path.join(benchmarkRoot, 'rubric.json'), 'utf8'));
  if (!rubric.softScore || typeof rubric.softScore !== 'object') {
    throw new Error(`${benchmarkRoot}: rubric.json must define softScore weights`);
  }
  return rubric.softScore;
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index].startsWith('--')) result[argv[index].slice(2)] = argv[index + 1];
  }
  return result;
}
