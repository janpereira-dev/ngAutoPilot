import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { catalogQuality, createRepositoryTools } from '../../lib/agent-plugins/repository.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('searches catalog and resolves packs without writes', () => {
  const tools = createRepositoryTools({ root });

  assert.ok(tools.catalogSearch({ query: 'typed forms' }).matches.some(({ id }) => id.includes('typed-forms')));
  assert.deepEqual(tools.packResolve({ packId: 'ngautopilot-angular-testing' }).packs, ['ngautopilot-core', 'ngautopilot-angular-testing']);
  assert.equal(tools.repositoryValidate().mutatesRepository, false);
});

test('derives stack, route, compatibility, and upgrade data from repository files', () => {
  const tools = createRepositoryTools({ root });

  assert.equal(tools.stackDetect().node.minimum, '>=24.0.0 <25');
  assert.ok(tools.skillRoute({ request: 'Angular typed forms' }).matches.length > 0);
  assert.equal(tools.compatibilityCheck({ target: 'angular-21-to-22' }).supported, true);
  assert.throws(() => tools.compatibilityCheck({ target: 'x/../../package' }), /invalid compatibility target/);
  assert.deepEqual(tools.upgradePlan({ from: 20, to: 22 }).hops, ['20-to-21', '21-to-22']);
  assert.throws(() => tools.upgradePlan({ from: 2, to: 3 }), /Angular 3/);
});

test('reports platform assets and deterministic content signals without semantic-quality claims', () => {
  const tools = createRepositoryTools({ root });
  const inventory = tools.platformInventory();
  const quality = tools.catalogQuality();

  assert.equal(inventory.skills.count, 413);
  assert.equal(inventory.angular.unsupportedMajor.includes(3), true);
  assert.equal(inventory.angular.upgradeHops.some(({ from, to }) => from === 2 && to === 4), true);
  assert.equal(inventory.adapters.length, 10);
  assert.equal(inventory.subagents.length, 8);
  assert.equal(inventory.distribution.mcpServer.availability, 'npm-and-agent-plugin');
  assert.equal(inventory.distribution.openaiPackage.availability, 'source-only');
  const mirroredTools = createRepositoryTools({ root: path.join(root, 'agent-plugins', 'ngautopilot-tools', 'data') });
  assert.deepEqual(mirroredTools.platformInventory().distribution, inventory.distribution);
  assert.equal(quality.summary.skillCount, 413);
  assert.match(quality.semanticEvaluation, /does not claim semantic value/);
  assert.ok(quality.skills.every(({ signals }) => signals.requiredSections));
});

test('reports cached missing required sections and falls back to local source when detail is absent', (t) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-catalog-quality-'));
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  const legacySkillPath = path.join(temporaryRoot, 'skills', 'core', 'legacy-incomplete', 'SKILL.md');
  fs.mkdirSync(path.dirname(legacySkillPath), { recursive: true });
  fs.writeFileSync(legacySkillPath, `## Purpose

Fixture.

## When to Use

Fixture.

## Do Not

Fixture.

## Review Checklist

- [ ] Fixture.

## Expected Output

Fixture.
`);
  fs.writeFileSync(path.join(temporaryRoot, 'catalog.json'), `${JSON.stringify({
    skills: [
      {
        id: 'core.incomplete',
        path: 'skills/core/incomplete/SKILL.md',
        contentSignals: {
          requiredSections: false,
          missingRequiredSections: ['## Do'],
          hasProcedure: false,
          hasRisks: false,
          wordCount: 12,
        },
      },
      {
        id: 'core.legacy-incomplete',
        path: 'skills/core/legacy-incomplete/SKILL.md',
        contentSignals: {
          requiredSections: false,
          hasProcedure: false,
          hasRisks: false,
          wordCount: 12,
        },
      },
    ],
  }, null, 2)}\n`);

  const quality = catalogQuality(temporaryRoot);

  assert.equal(quality.summary.reviewNeededCount, 2);
  assert.deepEqual(quality.skills.find(({ id }) => id === 'core.incomplete').missingSections, ['## Do']);
  assert.deepEqual(quality.skills.find(({ id }) => id === 'core.legacy-incomplete').missingSections, ['## Do']);
  assert.deepEqual(quality.skills[0].reviewNeeded, ['missing-required-sections']);
});
