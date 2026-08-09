#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { runGate } from '../lib/gate-engine.mjs';
import { scanCandidateSecurity } from '../lib/candidate-security.mjs';
import { changedLinesPercent, collectGateEvidence } from '../lib/gate-evidence.mjs';
import { sha256 } from '../lib/hash-utils.mjs';
import { loadBenchmark, resolveBenchmarkPath } from '../lib/benchmark-loader.mjs';
import { frontmatterIsByteEqual } from '../lib/protected-metadata.mjs';
import { assertInsideLab } from '../lib/sandbox.mjs';
import { validateSkillStructure } from '../lib/skill-parser.mjs';

const args = parseArgs(process.argv.slice(2));
const benchmark = loadBenchmark(resolveBenchmarkPath(args.benchmark ?? 'angular-upgrade-validation-gate'));
const runRoot = assertInsideLab(path.resolve('skill-lab'), path.resolve('skill-lab', 'runs', args.run ?? 'manual-evaluation'));
const baselineSkill = fs.readFileSync(args.baseline ?? path.join(runRoot, 'baseline.SKILL.md'), 'utf8');
const candidateSkill = fs.readFileSync(args.candidate ?? path.join(runRoot, 'optimization', 'candidate.SKILL.md'), 'utf8');
const baselineAggregate = readJson(args.baselineAggregate ?? path.join(runRoot, 'baseline-results', args.stage ?? 'validation', 'aggregate.json'));
const candidateAggregate = readJson(args.candidateAggregate ?? path.join(runRoot, 'candidate-results', args.stage ?? 'validation', 'aggregate.json'));
const structure = validateSkillStructure(candidateSkill);
const baselineTokenCount = approximateTokens(baselineSkill);
const candidateTokenCount = approximateTokens(candidateSkill);
const limits = benchmark.limits ?? { maxCandidateTokens: 2200, maxChangedLinesPercent: 25, maxGrowthPercent: 20 };
const baselineHash = sha256(baselineSkill);
const candidateHash = sha256(candidateSkill);
const securityFindings = scanCandidateSecurity(candidateSkill);
const evidence = collectGateEvidence(runRoot, candidateHash);
const comparison = evidence.comparison ?? emptyComparison();
const result = runGate({
  frontmatterIsEqual: frontmatterIsByteEqual(baselineSkill, candidateSkill),
  structureIsValid: structure.valid && aggregateHashesMatch({ baselineAggregate, candidateAggregate, baselineHash, candidateHash }),
  securityPassed: securityFindings.length === 0,
  baselineAggregate,
  candidateAggregate: {
    ...candidateAggregate,
    tokenCount: candidateTokenCount,
    growthPercent: growthPercent(baselineTokenCount, candidateTokenCount),
    changedLinesPercent: changedLinesPercent(baselineSkill, candidateSkill),
  },
  improvedCases: comparison.improvements?.map((item) => item.id) ?? [],
  criticalFailures: candidateAggregate.criticalFailures ?? [],
  criticalRegressions: comparison.criticalRegressions?.map((item) => item.id) ?? [],
  missingBaselineCases: comparison.missingBaselineCases?.map((item) => item.id) ?? [],
  missingCandidateCases: comparison.missingCandidateCases?.map((item) => item.id) ?? [],
  winningRuns: evidence.winningRuns,
  crossHarnessRegressionCount: evidence.crossHarnessRegressionCount,
  testPassed: evidence.testPassed,
  adversarialPassed: evidence.adversarialPassed,
  repositoryGatesPassed: evidence.repositoryGatesPassed,
  limits,
  gate: benchmark.gate ?? {},
});

fs.mkdirSync(path.join(runRoot, 'gate'), { recursive: true });
fs.writeFileSync(path.join(runRoot, 'gate', 'gate-report.json'), `${JSON.stringify({ ...result, structure, evidence: { ...evidence, baselineHash, candidateHash, securityFindings, targetSkillPath: benchmark.targetSkill.path } }, null, 2)}\n`, 'utf8');
console.log(result.status);
process.exit(result.accepted ? 0 : 1);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function emptyComparison() {
  return {
    improvements: [],
    criticalRegressions: [],
    missingBaselineCases: [],
    missingCandidateCases: [],
  };
}

function approximateTokens(value) {
  return Math.ceil(value.split(/\s+/).filter(Boolean).length * 1.3);
}

function growthPercent(baselineTokenCount, candidateTokenCount) {
  if (baselineTokenCount === 0) return candidateTokenCount === 0 ? 0 : 100;
  return Number((((candidateTokenCount - baselineTokenCount) / baselineTokenCount) * 100).toFixed(2));
}

function aggregateHashesMatch({ baselineAggregate, candidateAggregate, baselineHash, candidateHash }) {
  return baselineAggregate.skillHash === baselineHash && candidateAggregate.skillHash === candidateHash;
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index].startsWith('--')) result[argv[index].slice(2)] = argv[index + 1];
  }
  return result;
}
