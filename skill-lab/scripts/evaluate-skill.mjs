#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { loadBenchmark, resolveBenchmarkPath } from '../lib/benchmark-loader.mjs';
import { loadBenchmarkCases } from '../lib/case-loader.mjs';
import { aggregateResults, scoreSkillAgainstCase } from '../lib/deterministic-scorer.mjs';
import { generateEvaluationReport } from '../lib/report-generator.mjs';

const args = parseArgs(process.argv.slice(2));
const benchmark = loadBenchmark(resolveBenchmarkPath(args.benchmark ?? 'angular-upgrade-validation-gate'));
const skillPath = args.skill ? path.resolve(args.skill) : path.resolve(benchmark.targetSkill.path);
const splits = (args.splits ?? 'validation').split(',').map((item) => item.trim());
const outputRoot = args.output ? path.resolve(args.output) : path.join('skill-lab', 'runs', 'manual-evaluation');
const skillContent = fs.readFileSync(skillPath, 'utf8');
const casesBySplit = loadBenchmarkCases(benchmark);

for (const split of splits) {
  const cases = casesBySplit[split];
  if (!cases) throw new Error(`Unknown split: ${split}`);

  const results = cases.map((item) => scoreSkillAgainstCase(skillContent, item, benchmark.root));
  const aggregate = aggregateResults(results);
  const splitRoot = path.join(outputRoot, split);
  fs.mkdirSync(splitRoot, { recursive: true });
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
