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
const createdPaths = [];

after(() => {
  for (const runRoot of createdRuns) {
    fs.rmSync(runRoot, { recursive: true, force: true });
  }
  for (const itemPath of createdPaths) {
    fs.rmSync(itemPath, { recursive: true, force: true });
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

test('buildSkillOptContract uses documented default SkillOpt models', () => {
  const runRoot = prepareRun('phase-d-default-models');
  const previousOptimizer = process.env.SKILL_LAB_OPTIMIZER_MODEL;
  const previousTarget = process.env.SKILL_LAB_TARGET_MODEL;
  process.env.SKILL_LAB_OPTIMIZER_MODEL = '';
  process.env.SKILL_LAB_TARGET_MODEL = '';

  try {
    const contract = buildSkillOptContract({ benchmarkId: 'angular-upgrade-validation-gate', runRoot });
    assert.equal(contract.optimizerModel, 'gpt-4.1-mini');
    assert.equal(contract.targetModel, 'gpt-4.1-mini');
  } finally {
    restoreEnv('SKILL_LAB_OPTIMIZER_MODEL', previousOptimizer);
    restoreEnv('SKILL_LAB_TARGET_MODEL', previousTarget);
  }
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

test('SkillOpt bridge can drive the installed EnvAdapter trainer path', () => {
  const runRoot = prepareRun('phase-d-skillopt-env-adapter');
  const fakeModuleRoot = path.join(runRoot, 'fake-python');
  writeFakeSkillOptTrainer(fakeModuleRoot);
  fs.rmSync(path.join(runRoot, 'optimization/candidate.SKILL.md'), { force: true });
  const contractPath = path.join(runRoot, 'optimization/skillopt-contract.json');
  writeJson(contractPath, {
    benchmark: 'angular-upgrade-validation-gate',
    outputDirectory: path.join(runRoot, 'optimization'),
    baselineSkill: path.join(runRoot, 'baseline.SKILL.md'),
    targetSkill: 'skills/angular/upgrades/angular-upgrade-validation-gate/SKILL.md',
    epochs: 1,
    editBudget: 1,
    seed: 7,
    optimizerModel: 'optimizer-test',
    targetModel: 'target-test',
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

  assert.equal(result.status, 0, result.stderr);
  assert.match(fs.readFileSync(path.join(runRoot, 'optimization/candidate.SKILL.md'), 'utf8'), /SkillOpt Candidate/);
});

test('SkillOpt bridge removes stale candidates before unsupported optimization runs', () => {
  const runRoot = prepareRun('phase-d-stale-skillopt-candidate');
  const fakeModuleRoot = path.join(runRoot, 'fake-python');
  const fakeSkillOptRoot = path.join(fakeModuleRoot, 'skillopt');
  fs.mkdirSync(fakeSkillOptRoot, { recursive: true });
  fs.writeFileSync(path.join(fakeSkillOptRoot, '__init__.py'), '__version__ = "0.2.0"\n', 'utf8');
  const staleCandidate = path.join(runRoot, 'optimization/candidate.SKILL.md');
  fs.writeFileSync(staleCandidate, 'stale candidate', 'utf8');
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
  assert.equal(fs.existsSync(staleCandidate), false);
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

test('optimize-skill reports missing SkillOpt model config without dependency install guidance', () => {
  const runId = 'phase-d-optimize-missing-model-config';
  const runRoot = prepareRun(runId);
  const contractPath = path.join(runRoot, 'optimization/skillopt-contract.json');
  writeJson(contractPath, {
    outputDirectory: path.join(runRoot, 'optimization'),
    baselineSkill: path.join(runRoot, 'baseline.SKILL.md'),
    optimizerModel: '',
    targetModel: '',
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
        PYTHONPATH: [path.join(repoRoot, 'skill-lab/python'), process.env.PYTHONPATH]
          .filter(Boolean)
          .join(path.delimiter),
      },
    },
  );

  assert.equal(result.status, 2);
  assert.match(result.stderr, /requires optimizerModel and targetModel/);
  assert.doesNotMatch(result.stderr, /Install the local bridge dependencies/);
});

test('Skill Lab README documents default models and complete workflow', () => {
  const readme = fs.readFileSync(path.join(repoRoot, 'skill-lab/README.md'), 'utf8');

  assert.match(readme, /Default Models/);
  assert.match(readme, /gpt-4\.1-mini/);
  assert.match(readme, /OPENAI_API_KEY/);
  assert.match(readme, /skill-lab:prepare-promotion/);
});

test('optimize-skill uses default models when no model flags are provided', () => {
  const runId = 'phase-d-optimize-default-models';
  const runRoot = prepareRun(runId);
  const fakeModuleRoot = path.join(runRoot, 'fake-python');
  writeFakeSkillOptTrainer(fakeModuleRoot, {
    optimizerModel: 'gpt-4.1-mini',
    targetModel: 'gpt-4.1-mini',
  });
  fs.rmSync(path.join(runRoot, 'optimization/candidate.SKILL.md'), { force: true });

  const result = spawnSync(
    process.execPath,
    ['skill-lab/scripts/optimize-skill.mjs', '--run', runId, '--epochs', '1', '--editBudget', '1'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        PYTHONPATH: [fakeModuleRoot, path.join(repoRoot, 'skill-lab/python'), process.env.PYTHONPATH]
          .filter(Boolean)
          .join(path.delimiter),
        SKILL_LAB_OPTIMIZER_MODEL: '',
        SKILL_LAB_TARGET_MODEL: '',
      },
    },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /candidate\.SKILL\.md/);
  assert.match(fs.readFileSync(path.join(runRoot, 'optimization/candidate.SKILL.md'), 'utf8'), /SkillOpt Candidate/);
});

test('optimize-skill tells users to snapshot a baseline before optimizing', () => {
  const runId = 'phase-d-optimize-missing-baseline';
  const runRoot = prepareRun(runId);
  fs.rmSync(path.join(runRoot, 'baseline.SKILL.md'), { force: true });

  const result = spawnSync(
    process.execPath,
    ['skill-lab/scripts/optimize-skill.mjs', '--run', runId],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 2);
  assert.match(result.stderr, /baseline skill not found/i);
  assert.match(result.stderr, /skill-lab:baseline/);
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

test('evaluate-skill keeps explicit output paths inside skill-lab', () => {
  const outside = path.join(repoRoot, 'outside-evaluation-results');
  fs.rmSync(outside, { recursive: true, force: true });

  const result = runNode(['skill-lab/scripts/evaluate-skill.mjs', '--output', outside, '--splits', 'validation']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /outside skill-lab/);
  assert.equal(fs.existsSync(outside), false);
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

test('validate-lab rejects benchmark targets outside canonical source skills', () => {
  const benchmarkRoot = path.join(repoRoot, 'skill-lab/benchmarks/phase-d-plugin-target');
  createdPaths.push(benchmarkRoot);
  fs.rmSync(benchmarkRoot, { recursive: true, force: true });
  fs.mkdirSync(path.join(benchmarkRoot, 'datasets'), { recursive: true });
  const item = JSON.stringify({
    schemaVersion: '1.0.0',
    id: 'case-a',
    title: 'Case A',
    taskType: 'upgrade-validation',
    criticality: 'critical',
    input: { request: 'Validate.', packageJsonFixture: 'fixtures/package.json', commandOutputsFixture: 'fixtures/results.json' },
    expected: { decision: 'PASS', nextHopAllowed: true },
    checks: [{ type: 'decision-equals', value: 'PASS', critical: true }],
  });
  for (const split of ['train', 'validation', 'test', 'adversarial']) {
    fs.writeFileSync(path.join(benchmarkRoot, 'datasets', `${split}.jsonl`), `${item.replace('case-a', `case-${split}`)}\n`, 'utf8');
  }
  fs.mkdirSync(path.join(benchmarkRoot, 'fixtures'), { recursive: true });
  fs.writeFileSync(path.join(benchmarkRoot, 'fixtures/package.json'), '{"scripts":{"build":"ng build"}}\n', 'utf8');
  fs.writeFileSync(path.join(benchmarkRoot, 'fixtures/results.json'), '{"commands":[]}\n', 'utf8');
  fs.writeFileSync(
    path.join(benchmarkRoot, 'benchmark.yaml'),
    [
      'id: phase-d-plugin-target',
      'version: 1.0.0',
      'targetSkill:',
      '  path: plugins/ngautopilot-angular/skills/angular/upgrades/angular-upgrade-validation-gate/SKILL.md',
      'splits:',
      '  train: datasets/train.jsonl',
      '  validation: datasets/validation.jsonl',
      '  test: datasets/test.jsonl',
      '  adversarial: datasets/adversarial.jsonl',
      '',
    ].join('\n'),
    'utf8',
  );

  const result = runNode(['skill-lab/scripts/validate-lab.mjs']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /target skill must be under skills\//);
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

function writeFakeSkillOptTrainer(fakeModuleRoot, options = {}) {
  const optimizerModel = options.optimizerModel ?? 'optimizer-test';
  const targetModel = options.targetModel ?? 'target-test';
  fs.mkdirSync(path.join(fakeModuleRoot, 'skillopt/envs'), { recursive: true });
  fs.mkdirSync(path.join(fakeModuleRoot, 'skillopt/engine'), { recursive: true });
  fs.writeFileSync(path.join(fakeModuleRoot, 'skillopt/__init__.py'), '__version__ = "0.2.0"\n', 'utf8');
  fs.writeFileSync(path.join(fakeModuleRoot, 'skillopt/envs/__init__.py'), '', 'utf8');
  fs.writeFileSync(path.join(fakeModuleRoot, 'skillopt/engine/__init__.py'), '', 'utf8');
  fs.writeFileSync(
    path.join(fakeModuleRoot, 'skillopt/envs/base.py'),
    [
      'class EnvAdapter:',
      '    def setup(self, cfg):',
      '        self._cfg = dict(cfg)',
      '    def get_dataloader(self):',
      '        return None',
      '',
    ].join('\n'),
    'utf8',
  );
  fs.writeFileSync(
    path.join(fakeModuleRoot, 'skillopt/engine/trainer.py'),
    [
      'import pathlib',
      '',
      'class ReflACTTrainer:',
      '    def __init__(self, cfg, adapter):',
      '        self.cfg = cfg',
      '        self.adapter = adapter',
      '    def train(self):',
      `        assert self.cfg["optimizer_model"] == "${optimizerModel}"`,
      `        assert self.cfg["target_model"] == "${targetModel}"`,
      '        assert self.cfg["num_epochs"] == 1',
      '        assert self.cfg["edit_budget"] == 1',
      '        assert self.cfg["train_size"] > 0',
      '        self.adapter.setup(self.cfg)',
      '        assert self.adapter.get_task_types() == ["upgrade-validation"]',
      '        env = self.adapter.build_train_env(batch_size=1, seed=7, out_root=self.cfg["out_root"])',
      '        results = self.adapter.rollout(env, pathlib.Path(self.cfg["skill_init"]).read_text(encoding="utf-8"), self.cfg["out_root"])',
      '        assert results and "hard" in results[0] and "soft" in results[0]',
      '        candidate = pathlib.Path(self.cfg["skill_init"]).read_text(encoding="utf-8").rstrip() + "\\n\\n## SkillOpt Candidate\\n"',
      '        pathlib.Path(self.cfg["out_root"]).mkdir(parents=True, exist_ok=True)',
      '        pathlib.Path(self.cfg["out_root"], "best_skill.md").write_text(candidate, encoding="utf-8")',
      '        return {"best_selection_hard": 1}',
      '',
    ].join('\n'),
    'utf8',
  );
}

function restoreEnv(name, value) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
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
