import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const script = path.resolve(import.meta.dirname, '../scripts/check-generated-drift.mjs');

test('generated drift detects tracked changes and omitted files restored by regeneration', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-generated-drift-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  const commit = () => git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
    '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'test: generated fixture');
  const check = () => spawnSync(process.execPath, [script, '.agents/skills'], { cwd: root, encoding: 'utf8' });
  const relative = '.agents/skills/example/references/procedure.md';
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, '# Complete procedure\n');
  git('init', '--quiet');
  git('add', '.agents');
  commit();
  fs.writeFileSync(path.join(root, 'unrelated.txt'), 'outside the selected generated paths\n');
  assert.equal(check().status, 0);

  fs.appendFileSync(file, 'Changed procedure\n');
  assert.equal(check().status, 1, 'unstaged generated changes must fail');
  git('add', relative);
  assert.equal(check().status, 1, 'staged generated changes must fail');
  commit();
  assert.equal(check().status, 0);

  git('rm', '--quiet', relative);
  commit();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, '# Recreated by the generator\n');
  assert.equal(git('diff', '--exit-code', '--', '.agents/skills'), '', 'old drift command misses this case');
  const recreated = check();
  assert.equal(recreated.status, 1, 'regenerated but uncommitted resources must fail');
  assert.match(recreated.stderr, /\?\? .*procedure\.md/);
});
