import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { resolveAngularInstallation } from '../lib/agent-plugins/repository.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('resolves a nested Angular 12 project deterministically without migration hops', (t) => {
  const projectRoot = createProject(t, '12.2.17');
  const result = resolveAngularInstallation({
    root: repositoryRoot,
    projectRoot: path.join(projectRoot, 'apps', 'shell'),
    target: '12.2',
    profile: 'core',
    capabilities: ['testing', 'ui'],
  });

  assert.equal(result.projectRoot, projectRoot);
  assert.deepEqual(result.target, { major: 12, minor: 2 });
  assert.equal(result.evidence.angular.source, 'package.json + lockfile');
  assert.equal(result.validation.level, 'lockfile-confirmed');
  assert.deepEqual(result.included.filter((item) => item.type === 'pack').map((item) => item.id), [
    'ngautopilot-angular-testing',
    'ngautopilot-angular-ui',
    'ngautopilot-core',
  ]);
  assert.ok(result.included.some((item) => item.type === 'skill' && item.id === 'angular.versioning.angular-version-gates'));
  assert.equal(result.included.some((item) => item.id === 'angular.versioning.angular-v22-feature-index'), false);
  assert.ok(result.excluded.some((item) => item.id === 'angular.versioning.angular-v22-feature-index' && /requires Angular >=22/.test(item.reason)));
  assert.ok(result.excluded.some((item) => item.selector === 'angular.upgrade.hops.*'));
});

test('resolves Angular 15 package-only evidence and keeps capabilities deterministic', (t) => {
  const projectRoot = createProject(t, '15.1.6', { lockfile: false });
  const result = resolveAngularInstallation({
    root: repositoryRoot,
    projectRoot,
    target: { major: 15, minor: 1 },
    profile: 'core',
    capabilities: ['runtime', 'foundations'],
  });

  assert.equal(result.validation.level, 'package-json-only');
  assert.deepEqual(result.capabilities, ['foundations', 'runtime']);
  assert.deepEqual(result.included.filter((item) => item.type === 'pack').map((item) => item.id), [
    'ngautopilot-angular-foundations',
    'ngautopilot-angular-runtime',
    'ngautopilot-core',
  ]);
  assert.equal(result.included.some((item) => item.id === 'angular.versioning.angular-v22-risk-matrix'), false);
});

test('maps declared profiles to existing packs and includes Angular 22 versioning skills only for Angular 22', (t) => {
  const angularTwelve = createProject(t, '12.2.17');
  const essentials = resolveAngularInstallation({ root: repositoryRoot, projectRoot: angularTwelve, target: 12, profile: 'essentials' });
  const architecture = resolveAngularInstallation({ root: repositoryRoot, projectRoot: angularTwelve, target: 12, profile: 'architecture' });
  const migration = resolveAngularInstallation({ root: repositoryRoot, projectRoot: angularTwelve, target: 12, profile: 'migration' });
  assert.ok(essentials.included.some((item) => item.type === 'pack' && item.id === 'ngautopilot-angular-foundations'));
  assert.ok(architecture.included.some((item) => item.type === 'pack' && item.id === 'ngautopilot-angular-foundations'));
  assert.ok(migration.included.some((item) => item.type === 'pack' && item.id === 'ngautopilot-core'));
  assert.equal(migration.included.some((item) => item.id.includes('angular.upgrade.hops')), false);

  const angularTwentyTwo = createProject(t, '22.0.1');
  const performance = resolveAngularInstallation({ root: repositoryRoot, projectRoot: angularTwentyTwo, target: '22.0', profile: 'performance' });
  const testing = resolveAngularInstallation({ root: repositoryRoot, projectRoot: angularTwentyTwo, target: 22, profile: 'testing' });
  assert.ok(performance.included.some((item) => item.type === 'pack' && item.id === 'ngautopilot-angular-runtime'));
  assert.ok(testing.included.some((item) => item.type === 'pack' && item.id === 'ngautopilot-angular-testing'));
  assert.ok(performance.included.some((item) => item.id === 'angular.versioning.angular-v22-feature-index'));
  assert.equal(performance.excluded.some((item) => item.id === 'angular.versioning.angular-v22-feature-index'), false);
  assert.throws(
    () => resolveAngularInstallation({ root: repositoryRoot, projectRoot: angularTwelve, target: 12, profile: 'unknown' }),
    /unsupported Angular installation profile/,
  );
});

test('rejects unknown Angular evidence and contradictory targets', (t) => {
  const unknownProject = createProject(t, undefined);
  assert.throws(
    () => resolveAngularInstallation({ root: repositoryRoot, projectRoot: unknownProject, target: 12 }),
    /@angular\/core is not declared/,
  );

  const angularProject = createProject(t, '12.2.17');
  assert.throws(
    () => resolveAngularInstallation({ root: repositoryRoot, projectRoot: angularProject, target: '15.1' }),
    /contradicts detected 12\.2\.17/,
  );
  assert.throws(
    () => resolveAngularInstallation({ root: repositoryRoot, projectRoot: angularProject, target: '12.2', capabilities: ['upgrade'] }),
    /unsupported Angular installation capability/,
  );
});

function createProject(t, angularVersion, { lockfile = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-angular-resolver-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'apps', 'shell'), { recursive: true });
  const dependencies = angularVersion ? { '@angular/core': `^${angularVersion}`, '@angular/common': `^${angularVersion}` } : {};
  fs.writeFileSync(path.join(root, 'package.json'), `${JSON.stringify({ private: true, dependencies }, null, 2)}\n`);
  if (lockfile && angularVersion) {
    fs.writeFileSync(path.join(root, 'package-lock.json'), `${JSON.stringify({
      lockfileVersion: 3,
      packages: { 'node_modules/@angular/core': { version: angularVersion } },
    }, null, 2)}\n`);
  }
  return root;
}
