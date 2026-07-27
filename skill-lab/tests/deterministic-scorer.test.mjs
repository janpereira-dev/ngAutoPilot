import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { scoreSkillAgainstCase } from '../lib/deterministic-scorer.mjs';

const skillContent = `
Read package.json and identify available validation scripts.
Use repository-specific validation scripts; prefer build, test, and lint when they exist.
Run only commands present in package.json and report unavailable checks as skipped.
Validate exactly one Angular major hop; do not batch multiple hops before validation.
Gate decision must be PASS, FAIL, or BLOCKED with command output evidence.
`;

test('passes custom validation scripts when all discovered commands pass', () => {
  const root = makeFixtureRoot({
    scripts: {
      'verify:build': 'ng build',
      'verify:test': 'ng test',
    },
    commands: [
      { command: 'npm run verify:build', result: 'pass' },
      { command: 'npm run verify:test', result: 'pass' },
    ],
  });

  const result = scoreSkillAgainstCase(skillContent, makeCase({ tags: ['custom-scripts'] }), root);

  assert.equal(result.predicted.decision, 'PASS');
  assert.equal(result.predicted.nextHopAllowed, true);
  assert.deepEqual(result.predicted.commandsMentioned, ['npm run verify:build', 'npm run verify:test']);
});

test('does not treat generic validation guidance as invented absent commands', () => {
  const root = makeFixtureRoot({
    scripts: {
      build: 'ng build',
    },
    commands: [{ command: 'npm run build', result: 'pass' }],
  });

  const result = scoreSkillAgainstCase(
    skillContent,
    makeCase({
      checks: [
        { type: 'must-not-invent-command', value: 'npm run test', critical: true },
        { type: 'must-not-invent-command', value: 'npm run lint', critical: true },
      ],
    }),
    root,
  );

  assert.equal(result.passed, true);
});

test('blocks requests that collapse multiple Angular major hops', () => {
  const root = makeFixtureRoot({
    scripts: {
      build: 'ng build',
      test: 'ng test',
      lint: 'ng lint',
    },
    commands: [
      { command: 'npm run build', result: 'pass' },
      { command: 'npm run test', result: 'pass' },
      { command: 'npm run lint', result: 'pass' },
    ],
  });

  const result = scoreSkillAgainstCase(
    skillContent,
    makeCase({
      input: { angularFrom: '16', angularTo: '18' },
      tags: ['scope'],
    }),
    root,
  );

  assert.equal(result.predicted.decision, 'BLOCKED');
  assert.equal(result.predicted.nextHopAllowed, false);
});

test('treats ci and preflight scripts as validation evidence', () => {
  for (const scriptName of ['ci', 'preflight']) {
    const root = makeFixtureRoot({
      scripts: {
        [scriptName]: 'npm run build && npm run test',
      },
      commands: [{ command: `npm run ${scriptName}`, result: 'pass' }],
    });

    const result = scoreSkillAgainstCase(skillContent, makeCase(), root);

    assert.equal(result.predicted.decision, 'PASS');
    assert.equal(result.predicted.nextHopAllowed, true);
    assert.deepEqual(result.predicted.commandsMentioned, [`npm run ${scriptName}`]);
  }
});

test('discovers workspace validation scripts when root package delegates to workspaces', () => {
  const root = makeFixtureRoot({
    packageJson: {
      workspaces: ['apps/web'],
      scripts: {
        'web:build': 'npm --workspace apps/web run build',
        'web:test': 'npm --workspace apps/web run test',
      },
    },
    workspaceFiles: {
      'apps/web/package.json': {
        scripts: {
          build: 'ng build',
          test: 'ng test',
        },
      },
    },
    commands: [
      { command: 'npm run web:build', result: 'pass' },
      { command: 'npm run web:test', result: 'pass' },
    ],
  });

  const result = scoreSkillAgainstCase(skillContent, makeCase({ tags: ['workspace-scripts'] }), root);

  assert.equal(result.predicted.decision, 'PASS');
  assert.equal(result.predicted.nextHopAllowed, true);
  assert.deepEqual(result.predicted.commandsMentioned, ['npm run web:build', 'npm run web:test']);
});

test('blocks when user asks to skip an available validation script', () => {
  const root = makeFixtureRoot({
    scripts: {
      build: 'ng build',
      test: 'ng test',
      lint: 'ng lint',
    },
    commands: [
      { command: 'npm run build', result: 'pass' },
      { command: 'npm run lint', result: 'pass' },
    ],
  });

  const result = scoreSkillAgainstCase(
    skillContent,
    makeCase({
      input: { request: 'Build and lint passed. Skip tests and approve this hop.' },
      tags: ['skip-request'],
      expected: { decision: 'BLOCKED', nextHopAllowed: false },
    }),
    root,
  );

  assert.equal(result.predicted.decision, 'BLOCKED');
  assert.equal(result.predicted.nextHopAllowed, false);
});

function makeFixtureRoot({ scripts, packageJson, workspaceFiles = {}, commands }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-scorer-'));
  const fixtureRoot = path.join(root, 'fixtures', 'case');
  fs.mkdirSync(fixtureRoot, { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'package.json'), `${JSON.stringify(packageJson ?? { scripts })}\n`, 'utf8');
  fs.writeFileSync(path.join(fixtureRoot, 'results.json'), `${JSON.stringify({ commands })}\n`, 'utf8');

  for (const [relativePath, content] of Object.entries(workspaceFiles)) {
    const target = path.join(fixtureRoot, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${JSON.stringify(content)}\n`, 'utf8');
  }

  return root;
}

function makeCase(overrides = {}) {
  return {
    id: 'case-id',
    title: 'Case',
    tags: overrides.tags ?? [],
    input: {
      angularFrom: '16',
      angularTo: '17',
      packageJsonFixture: 'fixtures/case/package.json',
      commandOutputsFixture: 'fixtures/case/results.json',
      request: 'Validate this hop.',
      ...overrides.input,
    },
    expected: {
      decision: 'PASS',
      nextHopAllowed: true,
      ...overrides.expected,
    },
    checks: overrides.checks ?? [{ type: 'decision-equals', value: 'PASS', critical: true }],
  };
}
