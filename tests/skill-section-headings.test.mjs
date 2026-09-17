import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const incompleteSkill = `---
id: core.heading-fixture
name: Heading Fixture
description: Checks exact required section headings.
stack:
  - Angular
category: core
status: stable
version: 0.8.1
owner: NgAutoPilot
triggers:
  - heading fixture
---

# Heading Fixture

## Purpose

Fixture.

## When to Use

Fixture.

## Do Not

This deliberately does not include a Do heading.

## Review Checklist

- [ ] Fixture.

## Expected Output

Fixture.
`;

test('treats required Markdown section headings as exact lines', (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-heading-validation-'));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  const skillPath = path.join(fixtureRoot, 'skills', 'core', 'heading-fixture', 'SKILL.md');
  fs.mkdirSync(path.dirname(skillPath), { recursive: true });
  fs.writeFileSync(skillPath, incompleteSkill);

  const catalogResult = spawnSync(process.execPath, [path.join(root, 'scripts', 'generate-catalog.mjs')], {
    cwd: fixtureRoot,
    encoding: 'utf8',
  });
  assert.equal(catalogResult.status, 0, catalogResult.stderr);
  const catalog = JSON.parse(fs.readFileSync(path.join(fixtureRoot, 'catalog.json'), 'utf8'));
  assert.equal(catalog.skills[0].contentSignals.requiredSections, false);
  assert.deepEqual(catalog.skills[0].contentSignals.missingRequiredSections, ['## Do']);

  const validationResult = spawnSync(process.execPath, [path.join(root, 'scripts', 'validate-skills.mjs')], {
    cwd: fixtureRoot,
    encoding: 'utf8',
  });
  assert.notEqual(validationResult.status, 0);
  assert.match(validationResult.stderr, /missing section "## Do"/);
});
