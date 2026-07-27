import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { loadBenchmark } from '../lib/benchmark-loader.mjs';
import { loadCaseFile, validateBenchmarkCases } from '../lib/case-loader.mjs';

test('loadCaseFile parses JSONL cases and rejects duplicate IDs in one file', () => {
  const directory = makeTempLab();
  const caseFile = path.join(directory, 'cases.jsonl');
  fs.writeFileSync(
    caseFile,
    `${JSON.stringify(makeCase('same-id'))}\n${JSON.stringify(makeCase('same-id'))}\n`,
    'utf8',
  );

  assert.throws(() => loadCaseFile(caseFile), /duplicate case id "same-id"/);
});

test('validateBenchmarkCases rejects cases duplicated across splits', () => {
  const directory = makeTempLab();
  writeBenchmark(directory, {
    train: [makeCase('shared-id')],
    validation: [makeCase('shared-id')],
    test: [makeCase('test-id')],
    adversarial: [makeCase('adv-id')],
  });

  const benchmark = loadBenchmark(path.join(directory, 'benchmark.yaml'));

  assert.throws(() => validateBenchmarkCases(benchmark), /case id "shared-id" appears in multiple splits/);
});

test('validateBenchmarkCases rejects unknown check types and missing fixtures', () => {
  const directory = makeTempLab();
  const broken = makeCase('broken-id');
  broken.checks.push({ type: 'model-defined-javascript', critical: true });
  broken.input.packageJsonFixture = 'fixtures/missing/package.json';
  writeBenchmark(directory, {
    train: [broken],
    validation: [makeCase('validation-id')],
    test: [makeCase('test-id')],
    adversarial: [makeCase('adv-id')],
  });

  const benchmark = loadBenchmark(path.join(directory, 'benchmark.yaml'));

  assert.throws(() => validateBenchmarkCases(benchmark), /unknown check type "model-defined-javascript"/);
  assert.throws(() => validateBenchmarkCases(benchmark, { failFast: false }), /missing fixture/);
});

test('validateBenchmarkCases rejects cases missing committed schema fields', () => {
  const directory = makeTempLab();
  const broken = makeCase('broken-schema');
  delete broken.schemaVersion;
  delete broken.title;
  delete broken.taskType;
  delete broken.criticality;
  delete broken.input.request;
  delete broken.expected.nextHopAllowed;
  writeBenchmark(directory, {
    train: [broken],
    validation: [makeCase('validation-id')],
    test: [makeCase('test-id')],
    adversarial: [makeCase('adv-id')],
  });

  const benchmark = loadBenchmark(path.join(directory, 'benchmark.yaml'));

  assert.throws(
    () => validateBenchmarkCases(benchmark, { failFast: false }),
    /missing schemaVersion[\s\S]*missing title[\s\S]*missing taskType[\s\S]*missing criticality[\s\S]*missing input.request[\s\S]*missing expected.nextHopAllowed/,
  );
});

function makeTempLab() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-skill-lab-'));
}

function writeBenchmark(directory, splits) {
  const datasetRoot = path.join(directory, 'datasets');
  const fixtureRoot = path.join(directory, 'fixtures', 'default');
  fs.mkdirSync(datasetRoot, { recursive: true });
  fs.mkdirSync(fixtureRoot, { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'package.json'), '{"scripts":{"build":"ng build"}}\n', 'utf8');
  fs.writeFileSync(path.join(fixtureRoot, 'results.json'), '{"commands":[]}\n', 'utf8');

  for (const [split, cases] of Object.entries(splits)) {
    fs.writeFileSync(path.join(datasetRoot, `${split}.jsonl`), `${cases.map((item) => JSON.stringify(item)).join('\n')}\n`, 'utf8');
  }

  fs.writeFileSync(
    path.join(directory, 'benchmark.yaml'),
    [
      'id: test-benchmark',
      'version: 1.0.0',
      'targetSkill:',
      '  path: skills/angular/upgrades/angular-upgrade-validation-gate/SKILL.md',
      '  protectFrontmatter: true',
      'splits:',
      '  train: datasets/train.jsonl',
      '  validation: datasets/validation.jsonl',
      '  test: datasets/test.jsonl',
      '  adversarial: datasets/adversarial.jsonl',
      '',
    ].join('\n'),
    'utf8',
  );
}

function makeCase(id) {
  return {
    schemaVersion: '1.0.0',
    id,
    title: `Case ${id}`,
    taskType: 'upgrade-validation',
    criticality: 'critical',
    tags: ['build'],
    input: {
      packageJsonFixture: 'fixtures/default/package.json',
      commandOutputsFixture: 'fixtures/default/results.json',
      request: 'Validate this hop.',
    },
    expected: {
      decision: 'PASS',
      nextHopAllowed: true,
    },
    checks: [{ type: 'decision-equals', value: 'PASS', critical: true }],
  };
}
