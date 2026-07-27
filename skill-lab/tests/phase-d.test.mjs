import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test, { after } from 'node:test';

import { buildSkillOptContract } from '../lib/skillopt-contract.mjs';

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

test('run-gate rejects when promotion evidence artifacts are missing', () => {
  const runId = 'phase-d-missing-evidence';
  const runRoot = prepareRun(runId);
  writeValidationEvidence(runRoot);

  const result = runNode(['skill-lab/scripts/run-gate.mjs', '--run', runId]);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /REJECTED_TEST/);
  const report = readJson(path.join(runRoot, 'gate/gate-report.json'));
  assert.equal(report.evidence.testPassed, false);
  assert.equal(report.evidence.repositoryGatesPassed, false);
});

test('agentic gate consumes safe harness evidence and feeds cross-harness gate data', () => {
  const runId = 'phase-d-agentic';
  const runRoot = prepareRun(runId);
  const evidencePath = path.join(runRoot, 'agentic', 'codex', 'evidence.json');
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  writeJson(evidencePath, {
    harness: 'codex',
    candidate: 'skill-lab/runs/phase-d-agentic/optimization/candidate.SKILL.md',
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

test('prepare-promotion writes complete review packet without touching canonical skills', () => {
  const runId = 'phase-d-promotion';
  const runRoot = prepareRun(runId);
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
    benchmarkId: 'angular-upgrade-validation-gate',
    benchmarkVersion: '1.0.0',
  });
  return runRoot;
}

function writeValidationEvidence(runRoot) {
  writeJson(path.join(runRoot, 'baseline-results/validation/aggregate.json'), {
    totalCases: 2,
    passedCases: 1,
    criticalFailures: [],
    hardScore: 0.8,
    softMedian: 0.5,
  });
  writeJson(path.join(runRoot, 'candidate-results/validation/aggregate.json'), {
    totalCases: 2,
    passedCases: 2,
    criticalFailures: [],
    hardScore: 0.9,
    softMedian: 0.53,
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
