import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test, { after } from 'node:test';

import { buildSkillOptContract } from '../lib/skillopt-contract.mjs';
import { sha256File } from '../lib/hash-utils.mjs';

const repoRoot = process.cwd();
const targetSkill = path.join(repoRoot, 'skills/angular/upgrades/angular-upgrade-validation-gate/SKILL.md');
const createdRuns = [];

after(() => {
  for (const runRoot of createdRuns) {
    fs.rmSync(runRoot, { recursive: true, force: true });
  }
});

test('buildSkillOptContract keeps candidate output inside skill-lab and hides promotion splits', () => {
  const runRoot = prepareRun('phase-d-contract');
  const contract = buildSkillOptContract({
    benchmarkId: 'angular-upgrade-validation-gate',
    runRoot,
    epochs: 2,
    editBudget: 3,
    seed: 99,
  });

  assert.equal(contract.benchmark, 'angular-upgrade-validation-gate');
  assert.equal(contract.epochs, 2);
  assert.equal(contract.editBudget, 3);
  assert.equal(contract.seed, 99);
  assert.equal(contract.splits.train.endsWith('datasets/train.jsonl'), true);
  assert.equal(contract.splits.validation.endsWith('datasets/validation.jsonl'), true);
  assert.equal('test' in contract.splits, false);
  assert.equal('adversarial' in contract.splits, false);
  assert.match(contract.outputDirectory, /skill-lab[\\/]runs[\\/]phase-d-contract[\\/]optimization$/);
  assert.throws(
    () => buildSkillOptContract({ benchmarkId: 'angular-upgrade-validation-gate', runRoot: path.resolve('skills') }),
    /outside skill-lab/,
  );
});

test('SkillOpt bridge reports unsupported installed API without writing a candidate', () => {
  const runRoot = prepareRun('phase-d-unsupported-skillopt-api');
  const fakeModuleRoot = path.join(runRoot, 'fake-python');
  const fakeSkillOptRoot = path.join(fakeModuleRoot, 'skillopt');
  fs.mkdirSync(fakeSkillOptRoot, { recursive: true });
  fs.writeFileSync(path.join(fakeSkillOptRoot, '__init__.py'), '__version__ = "0.2.0"\n', 'utf8');
  fs.rmSync(path.join(runRoot, 'optimization/candidate.SKILL.md'), { force: true });
  const contractPath = path.join(runRoot, 'optimization/skillopt-contract.json');
  writeJson(contractPath, {
    outputDirectory: path.join(runRoot, 'optimization'),
    splits: {
      train: 'skill-lab/benchmarks/angular-upgrade-validation-gate/datasets/train.jsonl',
      validation: 'skill-lab/benchmarks/angular-upgrade-validation-gate/datasets/validation.jsonl',
    },
  });

  const result = spawnSync(
    process.env.PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3'),
    ['-m', 'ngautopilot_skillopt.bridge', contractPath],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        PYTHONPATH: [fakeModuleRoot, path.join(repoRoot, 'skill-lab/python'), process.env.PYTHONPATH]
          .filter(Boolean)
          .join(path.delimiter),
      },
    },
  );

  assert.equal(result.status, 2);
  assert.match(result.stderr, /SkillOpt 0\.2\.0 does not expose a direct optimize API/);
  assert.match(result.stderr, /NgAutoPilot bridge needs a SkillOpt EnvAdapter integration/);
  assert.equal(fs.existsSync(path.join(runRoot, 'optimization/candidate.SKILL.md')), false);
});

test('optimize-skill omits dependency install guidance when SkillOpt API is unsupported', () => {
  const runId = 'phase-d-optimize-unsupported-api';
  const runRoot = prepareRun(runId);
  const fakeModuleRoot = path.join(runRoot, 'fake-python');
  const fakeSkillOptRoot = path.join(fakeModuleRoot, 'skillopt');
  fs.mkdirSync(fakeSkillOptRoot, { recursive: true });
  fs.writeFileSync(path.join(fakeSkillOptRoot, '__init__.py'), '__version__ = "0.2.0"\n', 'utf8');
  fs.rmSync(path.join(runRoot, 'optimization/candidate.SKILL.md'), { force: true });

  const result = spawnSync(
    process.execPath,
    ['skill-lab/scripts/optimize-skill.mjs', '--run', runId],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        PYTHONPATH: [fakeModuleRoot, path.join(repoRoot, 'skill-lab/python'), process.env.PYTHONPATH]
          .filter(Boolean)
          .join(path.delimiter),
      },
    },
  );

  assert.equal(result.status, 2);
  assert.match(result.stderr, /SkillOpt 0\.2\.0 does not expose a direct optimize API/);
  assert.doesNotMatch(result.stderr, /Install the local bridge dependencies/);
});

test('run-gate rejects when promotion evidence artifacts are missing', () => {
  const runId = 'phase-d-missing-evidence';
  const runRoot = prepareRun(runId);
  writeValidationEvidence(runRoot);

  const result = runNode(['skill-lab/scripts/run-gate.mjs', '--run', runId]);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /REJECTED_CROSS_HARNESS_REGRESSION/);
  const report = readJson(path.join(runRoot, 'gate/gate-report.json'));
  assert.equal(report.evidence.testPassed, false);
  assert.equal(report.evidence.repositoryGatesPassed, false);
  assert.equal(report.evidence.crossHarnessRegressionCount, 1);
});

test('evaluate-skill writes results under an explicit run id', () => {
  const runId = 'phase-d-evaluate-run';
  const runRoot = prepareRun(runId);
  fs.rmSync(path.join(repoRoot, 'skill-lab/runs/manual-evaluation'), { recursive: true, force: true });

  const result = runNode(['skill-lab/scripts/evaluate-skill.mjs', '--run', runId, '--splits', 'validation']);

  assert.equal(result.status, 0);
  assert.equal(fs.existsSync(path.join(runRoot, 'candidate-results/validation/results.jsonl')), true);
  assert.equal(fs.existsSync(path.join(repoRoot, 'skill-lab/runs/manual-evaluation/validation/results.jsonl')), false);
});

test('evaluate-skill writes repeated run artifacts when runs is configured', () => {
  const runId = 'phase-d-evaluate-runs';
  const runRoot = prepareRun(runId);

  const result = runNode(['skill-lab/scripts/evaluate-skill.mjs', '--run', runId, '--splits', 'validation', '--runs', '3']);

  assert.equal(result.status, 0);
  for (const runName of ['run-1', 'run-2', 'run-3']) {
    assert.equal(fs.existsSync(path.join(runRoot, 'candidate-results/validation', runName, 'results.jsonl')), true);
  }
  const aggregate = readJson(path.join(runRoot, 'candidate-results/validation/aggregate.json'));
  assert.equal(aggregate.runs, 3);
  assert.equal(aggregate.skillHash, sha256File(path.join(runRoot, 'optimization/candidate.SKILL.md')));
});

test('compare-results writes summary evidence for downstream gate stability checks', () => {
  const runId = 'phase-d-comparison-summary';
  const runRoot = prepareRun(runId);
  fs.mkdirSync(path.join(runRoot, 'baseline-results/validation'), { recursive: true });
  fs.mkdirSync(path.join(runRoot, 'candidate-results/validation'), { recursive: true });
  fs.writeFileSync(
    path.join(runRoot, 'baseline-results/validation/results.jsonl'),
    `${JSON.stringify({ id: 'case-a', passed: false, criticalFailure: false })}\n`,
    'utf8',
  );
  fs.writeFileSync(
    path.join(runRoot, 'candidate-results/validation/results.jsonl'),
    `${JSON.stringify({ id: 'case-a', passed: true, criticalFailure: false })}\n`,
    'utf8',
  );

  const result = runNode(['skill-lab/scripts/compare-results.mjs', '--run', runId]);

  assert.equal(result.status, 0);
  assert.deepEqual(readJson(path.join(runRoot, 'comparison/summary.json')), {
    regressions: 0,
    criticalRegressions: 0,
    improvements: 1,
    unchanged: 0,
    missingBaselineCases: 0,
    missingCandidateCases: 0,
    winningRuns: 1,
  });
});

test('run-gate rejects stale evaluation aggregates from another candidate', () => {
  const runId = 'phase-d-gate-stale-aggregate';
  const runRoot = prepareRun(runId);
  writeValidationEvidence(runRoot);
  writePromotionEvidence(runRoot);
  const aggregatePath = path.join(runRoot, 'candidate-results/validation/aggregate.json');
  const aggregate = readJson(aggregatePath);
  writeJson(aggregatePath, { ...aggregate, skillHash: 'not-current-candidate' });

  const result = runNode(['skill-lab/scripts/run-gate.mjs', '--run', runId]);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /REJECTED_STRUCTURE/);
});

test('run-gate rejects missing agentic gate report instead of treating it as parity', () => {
  const runId = 'phase-d-gate-missing-agentic';
  const runRoot = prepareRun(runId);
  writeValidationEvidence(runRoot);
  writePromotionEvidence(runRoot);
  fs.rmSync(path.join(runRoot, 'agentic-gate'), { recursive: true, force: true });

  const result = runNode(['skill-lab/scripts/run-gate.mjs', '--run', runId]);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /REJECTED_CROSS_HARNESS_REGRESSION/);
});

test('agentic gate consumes safe harness evidence and feeds cross-harness gate data', () => {
  const runId = 'phase-d-agentic';
  const runRoot = prepareRun(runId);
  const evidencePath = path.join(runRoot, 'agentic', 'codex', 'evidence.json');
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  writeJson(evidencePath, {
    harness: 'codex',
    candidate: 'skill-lab/runs/phase-d-agentic/optimization/candidate.SKILL.md',
    candidateHash: sha256File(path.join(runRoot, 'optimization/candidate.SKILL.md')),
    passed: true,
    regressions: [],
    summary: 'Synthetic harness evidence passed.',
  });

  const result = runNode(['skill-lab/scripts/run-agentic-gate.mjs', '--run', runId, '--harness', 'codex']);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /AGENTIC_GATE_PASSED/);
  const report = readJson(path.join(runRoot, 'agentic-gate/gate-report.json'));
  assert.equal(report.passed, true);
  assert.equal(report.crossHarnessRegressionCount, 0);
});

test('agentic gate rejects evidence from another candidate', () => {
  const runId = 'phase-d-agentic-hash-mismatch';
  const runRoot = prepareRun(runId);
  const evidencePath = path.join(runRoot, 'agentic', 'codex', 'evidence.json');
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  writeJson(evidencePath, {
    harness: 'codex',
    candidate: 'skill-lab/runs/other-run/optimization/candidate.SKILL.md',
    candidateHash: 'not-this-candidate',
    passed: true,
    regressions: [],
    summary: 'Wrong candidate evidence.',
  });

  const result = runNode(['skill-lab/scripts/run-agentic-gate.mjs', '--run', runId, '--harness', 'codex']);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /AGENTIC_GATE_FAILED/);
});

test('prepare-promotion writes complete review packet without touching canonical skills', () => {
  const runId = 'phase-d-promotion';
  const runRoot = prepareRun(runId);
  fs.appendFileSync(path.join(runRoot, 'optimization/candidate.SKILL.md'), '\nAdditional validated guidance.\n', 'utf8');
  writeValidationEvidence(runRoot);
  writePromotionEvidence(runRoot);

  const gate = runNode(['skill-lab/scripts/run-gate.mjs', '--run', runId]);
  assert.equal(gate.status, 0);

  const result = runNode(['skill-lab/scripts/generate-promotion-packet.mjs', '--run', runId]);
  assert.equal(result.status, 0);

  const promotionRoot = path.join(runRoot, 'promotion');
  for (const file of [
    'candidate.SKILL.md',
    'canonical.diff',
    'gate-report.json',
    'report.md',
    'pr-body.md',
    'evidence-summary.json',
    'hashes.json',
  ]) {
    assert.equal(fs.existsSync(path.join(promotionRoot, file)), true, `${file} should exist`);
  }

  assert.equal(fs.readFileSync(path.join(promotionRoot, 'candidate.SKILL.md'), 'utf8'), fs.readFileSync(path.join(runRoot, 'optimization/candidate.SKILL.md'), 'utf8'));
  assert.match(fs.readFileSync(path.join(promotionRoot, 'pr-body.md'), 'utf8'), /Manual promotion only/);
  const canonicalDiff = fs.readFileSync(path.join(promotionRoot, 'canonical.diff'), 'utf8');
  assert.match(canonicalDiff, /--- a\/skills\/angular\/upgrades\/angular-upgrade-validation-gate\/SKILL\.md/);
  assert.match(canonicalDiff, /\+\+\+ b\/skills\/angular\/upgrades\/angular-upgrade-validation-gate\/SKILL\.md/);
});

test('prepare-promotion rejects candidates whose hash differs from accepted gate report', () => {
  const runId = 'phase-d-promotion-hash-mismatch';
  const runRoot = prepareRun(runId);
  writeValidationEvidence(runRoot);
  writePromotionEvidence(runRoot);

  const gate = runNode(['skill-lab/scripts/run-gate.mjs', '--run', runId]);
  assert.equal(gate.status, 0);
  fs.appendFileSync(path.join(runRoot, 'optimization/candidate.SKILL.md'), '\nChanged after gate.\n', 'utf8');

  const result = runNode(['skill-lab/scripts/generate-promotion-packet.mjs', '--run', runId]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /candidate hash does not match accepted gate report/);
});

test('snapshot-baseline keeps explicit run ids inside skill-lab runs', () => {
  const result = runNode(['skill-lab/scripts/snapshot-baseline.mjs', '--run', '../outside']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /outside skill-lab/);
});

test('snapshot-baseline uses the benchmark baseline fixture and records benchmark input hashes', () => {
  const runId = 'phase-d-snapshot-default-baseline';
  const runRoot = path.join(repoRoot, 'skill-lab', 'runs', runId);
  createdRuns.push(runRoot);
  fs.rmSync(runRoot, { recursive: true, force: true });

  const result = runNode(['skill-lab/scripts/snapshot-baseline.mjs', '--run', runId]);

  assert.equal(result.status, 0);
  const baseline = fs.readFileSync(path.join(runRoot, 'baseline.SKILL.md'), 'utf8');
  const target = fs.readFileSync(targetSkill, 'utf8');
  assert.notEqual(baseline, target);
  const manifest = readJson(path.join(runRoot, 'manifest.json'));
  assert.equal(typeof manifest.benchmarkHash, 'string');
  assert.equal(typeof manifest.rubricHash, 'string');
  assert.equal(typeof manifest.caseSetHash, 'string');
});

function prepareRun(runId) {
  const runRoot = path.join(repoRoot, 'skill-lab', 'runs', runId);
  createdRuns.push(runRoot);
  fs.rmSync(runRoot, { recursive: true, force: true });
  fs.mkdirSync(path.join(runRoot, 'optimization'), { recursive: true });
  fs.copyFileSync(targetSkill, path.join(runRoot, 'baseline.SKILL.md'));
  fs.copyFileSync(targetSkill, path.join(runRoot, 'optimization/candidate.SKILL.md'));
  writeJson(path.join(runRoot, 'manifest.json'), {
    runId,
    repository: 'janpereira-dev/ngAutoPilot',
    repositoryCommit: 'test-commit',
    targetSkillPath: 'skills/angular/upgrades/angular-upgrade-validation-gate/SKILL.md',
    targetSkillHash: 'placeholder-hash',
    benchmarkId: 'angular-upgrade-validation-gate',
    benchmarkVersion: '1.0.0',
  });
  return runRoot;
}

function writeValidationEvidence(runRoot) {
  const baselineSkill = path.join(runRoot, 'baseline.SKILL.md');
  const candidateSkill = path.join(runRoot, 'optimization/candidate.SKILL.md');
  writeJson(path.join(runRoot, 'baseline-results/validation/aggregate.json'), {
    totalCases: 2,
    passedCases: 1,
    criticalFailures: [],
    hardScore: 0.8,
    softMedian: 0.5,
    skillHash: sha256File(baselineSkill),
  });
  writeJson(path.join(runRoot, 'candidate-results/validation/aggregate.json'), {
    totalCases: 2,
    passedCases: 2,
    criticalFailures: [],
    hardScore: 0.96,
    softMedian: 0.53,
    skillHash: sha256File(candidateSkill),
  });
  writeJson(path.join(runRoot, 'comparison/improvements.json'), [{ id: 'case-a' }]);
  writeJson(path.join(runRoot, 'comparison/criticalRegressions.json'), []);
  writeJson(path.join(runRoot, 'comparison/summary.json'), { winningRuns: 2 });
}

function writePromotionEvidence(runRoot) {
  writeJson(path.join(runRoot, 'candidate-results/test/aggregate.json'), {
    totalCases: 1,
    passedCases: 1,
    criticalFailures: [],
    hardScore: 1,
    softMedian: 0.8,
  });
  writeJson(path.join(runRoot, 'candidate-results/adversarial/aggregate.json'), {
    totalCases: 1,
    passedCases: 1,
    criticalFailures: [],
    hardScore: 1,
    softMedian: 0.8,
  });
  writeJson(path.join(runRoot, 'repository-gates/report.json'), {
    passed: true,
    commands: [{ command: 'npm run release:validate', status: 0 }],
  });
  writeJson(path.join(runRoot, 'agentic-gate/gate-report.json'), {
    passed: true,
    crossHarnessRegressionCount: 0,
  });
}

function runNode(args) {
  return spawnSync(process.execPath, args, { cwd: repoRoot, encoding: 'utf8' });
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
