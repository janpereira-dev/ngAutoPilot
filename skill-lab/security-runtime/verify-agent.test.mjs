import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { manifest } from './manifest.mjs';
import { oracle, verifyAgent } from './verify-agent.mjs';

function valid() {
  const sources = manifest();
  const run = { id: 'unit-run', status: 'passed', testCount: 25, passed: 25, failed: 0, skipped: 0,
    sourceUnchanged: true, sources, caseHashes: Object.fromEntries(oracle.map(({ id }) => [`${id}.json`, 'a'.repeat(64)])) };
  const response = { runId: run.id, guidesRead: sources.guides, commands: [{ command: 'npm test', exitCode: 0 }],
    limitations: ['Synthetic fixture only'], cases: oracle.map(({ id, guide, decision }) => ({ id, guide, decision,
      evidence: [`observations/cases/${id}.json`], reason: 'Known unit input used only to exercise the grader' })) };
  return { response, run };
}

test('the independent oracle covers all 25 canonical review scenarios and their documented decisions', () => {
  assert.equal(oracle.length, 25); assert.equal(new Set(oracle.map(({ id }) => id)).size, 25);
  for (const entry of oracle) {
    const guide = fs.readFileSync(new URL(`../../skills/angular/security/${entry.guide}/SKILL.md`, import.meta.url), 'utf8');
    const row = guide.split('\n').find((line) => line.startsWith(`| ${entry.scenario} |`));
    assert.ok(row, entry.scenario); assert.equal(row.split('|').at(-2).trim(), entry.decision);
  }
});

test('accepts complete, correctly bound and classified input', () => {
  const { response, run } = valid(); assert.deepEqual(verifyAgent(response, run), []);
});

test('rejects blanket approvals, incomplete cases, duplicates and foreign evidence', () => {
  for (const mutate of [
    (response) => response.cases.forEach((item) => { item.decision = 'PASS'; }),
    (response) => response.cases.pop(),
    (response) => { response.cases[0] = response.cases[1]; },
    (response) => { response.cases[0].evidence = ['../private/file']; },
    (response) => { response.cases[0].evidence = ['C:/private/file']; },
    (response) => { response.cases[0].reason = ''; },
    (response) => { response.cases[0].guide = 'unrelated-guide'; },
  ]) {
    const { response, run } = valid(); mutate(response); assert.ok(verifyAgent(response, run).length);
  }
});

test('rejects stale, partial, failed or unexecuted evidence', () => {
  for (const mutate of [
    (response) => { response.runId = 'other-run'; },
    (response) => { response.guidesRead = {}; },
    (response) => { response.commands = []; },
    (response) => { response.limitations = []; },
    (response, run) => { run.sources = {}; },
    (response, run) => { run.caseHashes = {}; },
    (response, run) => { run.passed = 24; run.skipped = 1; },
    (response, run) => { run.failed = 1; },
    (response, run) => { run.sourceUnchanged = false; },
  ]) {
    const { response, run } = valid(); mutate(response, run); assert.ok(verifyAgent(response, run).length);
  }
  assert.ok(verifyAgent(null, null).length);
  assert.ok(verifyAgent({ cases: [null] }, {}).length);
});

test('recorded evidence resolves from the lab root even when the caller uses a different directory', () => {
  const cli = fileURLToPath(new URL('verify-agent.mjs', import.meta.url));
  const evidence = fileURLToPath(new URL('evidence/2026-10-31/observations/agent-response.json', import.meta.url));
  const run = fileURLToPath(new URL('evidence/2026-10-31/observations/run.json', import.meta.url));
  const result = spawnSync(process.execPath, [cli, evidence, run], { cwd: os.tmpdir(), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).cases, 25);
});
