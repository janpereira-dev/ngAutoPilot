#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { runGate } from '../lib/gate-engine.mjs';
import { changedLinesPercent, collectGateEvidence } from '../lib/gate-evidence.mjs';
import { frontmatterIsByteEqual } from '../lib/protected-metadata.mjs';
import { assertInsideLab } from '../lib/sandbox.mjs';
import { validateSkillStructure } from '../lib/skill-parser.mjs';

const args = parseArgs(process.argv.slice(2));
const runRoot = assertInsideLab(path.resolve('skill-lab'), path.resolve('skill-lab', 'runs', args.run ?? 'manual-evaluation'));
const baselineSkill = fs.readFileSync(args.baseline ?? path.join(runRoot, 'baseline.SKILL.md'), 'utf8');
const candidateSkill = fs.readFileSync(args.candidate ?? path.join(runRoot, 'optimization', 'candidate.SKILL.md'), 'utf8');
const baselineAggregate = readJson(args.baselineAggregate ?? path.join(runRoot, 'baseline-results', args.stage ?? 'validation', 'aggregate.json'));
const candidateAggregate = readJson(args.candidateAggregate ?? path.join(runRoot, 'candidate-results', args.stage ?? 'validation', 'aggregate.json'));
const comparison = readComparison(runRoot);
const structure = validateSkillStructure(candidateSkill);
const evidence = collectGateEvidence(runRoot, args.stage ?? 'validation');
const limits = { maxCandidateTokens: 2200, maxChangedLinesPercent: 25 };
const result = runGate({
  frontmatterIsEqual: frontmatterIsByteEqual(baselineSkill, candidateSkill),
  structureIsValid: structure.valid,
  securityPassed: !/curl\b[^\n|]*\|\s*(?:sudo\s+)?(?:ba)?sh/i.test(candidateSkill),
  baselineAggregate,
  candidateAggregate: {
    ...candidateAggregate,
    tokenCount: approximateTokens(candidateSkill),
    changedLinesPercent: changedLinesPercent(baselineSkill, candidateSkill),
  },
  improvedCases: comparison.improvements?.map((item) => item.id) ?? [],
  criticalFailures: candidateAggregate.criticalFailures ?? [],
  criticalRegressions: comparison.criticalRegressions?.map((item) => item.id) ?? [],
  winningRuns: evidence.winningRuns,
  crossHarnessRegressionCount: evidence.crossHarnessRegressionCount,
  testPassed: evidence.testPassed,
  adversarialPassed: evidence.adversarialPassed,
  repositoryGatesPassed: evidence.repositoryGatesPassed,
  limits,
});

fs.mkdirSync(path.join(runRoot, 'gate'), { recursive: true });
fs.writeFileSync(path.join(runRoot, 'gate', 'gate-report.json'), `${JSON.stringify({ ...result, structure, evidence }, null, 2)}\n`, 'utf8');
console.log(result.status);
process.exit(result.accepted ? 0 : 1);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readComparison(root) {
  const comparisonRoot = path.join(root, 'comparison');
  return {
    improvements: readOptionalJson(path.join(comparisonRoot, 'improvements.json'), []),
    criticalRegressions: readOptionalJson(path.join(comparisonRoot, 'criticalRegressions.json'), []),
  };
}

function readOptionalJson(filePath, fallback) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : fallback;
}

function approximateTokens(value) {
  return Math.ceil(value.split(/\s+/).filter(Boolean).length * 1.3);
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index].startsWith('--')) result[argv[index].slice(2)] = argv[index + 1];
  }
  return result;
}
