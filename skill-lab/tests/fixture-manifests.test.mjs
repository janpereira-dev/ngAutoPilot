import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { loadBenchmark } from '../lib/benchmark-loader.mjs';
import { resolveFixturePath, validateBenchmarkCases } from '../lib/case-loader.mjs';
import { scoreSkillAgainstCase } from '../lib/deterministic-scorer.mjs';
import { validateCanonicalFixtureManifests } from '../scripts/validate-lab.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const canonicalBenchmarkRoot = path.join(repoRoot, 'skill-lab', 'benchmarks', 'angular-upgrade-validation-gate');

test('canonical fixtures use package.fixture.json and their dataset references resolve', () => {
  assert.deepEqual(validateCanonicalFixtureManifests(repoRoot), []);
  const benchmark = loadBenchmark(path.join(canonicalBenchmarkRoot, 'benchmark.yaml'));
  assert.doesNotThrow(() => validateBenchmarkCases(benchmark));
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(canonicalBenchmarkRoot, 'fixtures', 'tests-fail', 'package.fixture.json'), 'utf8')).dependencies['@angular/core'],
    '16.0.0',
  );
});

test('canonical fixture package.json manifests are rejected deterministically', () => {
  const root = makeCanonicalBenchmark();
  const fixturePath = path.join(root, 'skill-lab', 'benchmarks', 'example', 'fixtures', 'case', 'package.json');
  fs.writeFileSync(fixturePath, '{}\n', 'utf8');

  assert.deepEqual(validateCanonicalFixtureManifests(root), [
    'skill-lab/benchmarks/example/fixtures/case/package.json: benchmark fixtures must use package.fixture.json instead of package.json to avoid dependency-scanner false positives',
  ]);
});

test('canonical fixture scans do not follow symlinks', (t) => {
  const root = makeCanonicalBenchmark();
  const fixturesRoot = path.join(root, 'skill-lab', 'benchmarks', 'example', 'fixtures');
  const outside = path.join(path.dirname(root), 'outside-fixtures');
  fs.mkdirSync(outside, { recursive: true });

  try {
    fs.renameSync(fixturesRoot, `${fixturesRoot}-original`);
    fs.symlinkSync(outside, fixturesRoot, 'junction');
  } catch (error) {
    if (error.code === 'EPERM') t.skip('Creating symlinks is not permitted by this Windows environment.');
    else throw error;
    return;
  }

  assert.deepEqual(validateCanonicalFixtureManifests(root), [
    'skill-lab/benchmarks/example/fixtures: benchmark fixtures must not contain symlinks',
  ]);
});

test('fixture resolution rejects path traversal and symlinks that escape the benchmark', (t) => {
  const root = makeBenchmarkRoot();
  const outside = path.join(path.dirname(root), 'outside.fixture.json');
  fs.writeFileSync(outside, '{}\n', 'utf8');

  assert.throws(() => resolveFixturePath(root, '../outside.fixture.json'), /escapes benchmark root/);

  const link = path.join(root, 'fixtures', 'default', 'escaped.fixture.json');
  try {
    fs.symlinkSync(outside, link, 'file');
  } catch (error) {
    if (error.code === 'EPERM') t.skip('Creating symlinks is not permitted by this Windows environment.');
    else throw error;
    return;
  }
  assert.throws(() => resolveFixturePath(root, 'fixtures/default/escaped.fixture.json'), /resolves outside benchmark root/);
});

test('missing fixtures remain validation errors', () => {
  const root = makeBenchmarkRoot();
  const benchmark = loadBenchmark(path.join(root, 'benchmark.yaml'));
  const caseItem = readCase(root);
  caseItem.input.packageJsonFixture = 'fixtures/missing/package.fixture.json';
  fs.writeFileSync(path.join(root, 'datasets', 'train.json'), `${JSON.stringify(caseItem)}\n`, 'utf8');

  assert.throws(() => validateBenchmarkCases(benchmark), /missing fixture fixtures\/missing\/package.fixture.json/);
});

test('renamed package fixture content remains readable by the deterministic scorer', () => {
  const root = makeBenchmarkRoot();
  const item = readCase(root);
  const result = scoreSkillAgainstCase('Evidence: command output. Decision: PASS.', item, root);
  assert.equal(result.predicted.decision, 'PASS');
});

function makeCanonicalBenchmark() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-fixture-manifest-'));
  const benchmarkRoot = path.join(root, 'skill-lab', 'benchmarks', 'example');
  fs.mkdirSync(path.join(benchmarkRoot, 'fixtures', 'case'), { recursive: true });
  fs.writeFileSync(path.join(benchmarkRoot, 'benchmark.yaml'), 'id: example\n', 'utf8');
  fs.writeFileSync(path.join(benchmarkRoot, 'fixtures', 'case', 'package.fixture.json'), '{}\n', 'utf8');
  return root;
}

function makeBenchmarkRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-fixture-resolution-'));
  const fixtureRoot = path.join(root, 'fixtures', 'default');
  fs.mkdirSync(fixtureRoot, { recursive: true });
  fs.mkdirSync(path.join(root, 'datasets'), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'package.fixture.json'), '{"scripts":{"build":"ng build"}}\n', 'utf8');
  fs.writeFileSync(path.join(fixtureRoot, 'results.json'), '{"commands":[{"command":"npm run build","result":"pass"}]}\n', 'utf8');
  fs.writeFileSync(path.join(root, 'benchmark.yaml'), [
    'id: fixture-resolution',
    'version: 1.0.0',
    'targetSkill:',
    '  path: skills/angular/upgrades/angular-upgrade-validation-gate/SKILL.md',
    'splits:',
    '  train: datasets/train.json',
    '',
  ].join('\n'), 'utf8');
  fs.writeFileSync(path.join(root, 'datasets', 'train.json'), `${JSON.stringify({
    schemaVersion: '1.0.0', id: 'case', title: 'Case', taskType: 'upgrade-validation', criticality: 'critical',
    input: { request: 'Validate.', packageJsonFixture: 'fixtures/default/package.fixture.json', commandOutputsFixture: 'fixtures/default/results.json' },
    expected: { decision: 'PASS', nextHopAllowed: true }, checks: [{ type: 'decision-equals', value: 'PASS' }],
  })}\n`, 'utf8');
  return root;
}

function readCase(root) {
  return JSON.parse(fs.readFileSync(path.join(root, 'datasets', 'train.json'), 'utf8'));
}
