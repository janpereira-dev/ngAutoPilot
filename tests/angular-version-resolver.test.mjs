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

test('accepts a package-only target within the declared Angular range', (t) => {
  const projectRoot = createProject(t, '12.2.17', { declaration: '^12.1.0', lockfile: false });
  const result = resolveAngularInstallation({ root: repositoryRoot, projectRoot, target: '12.2' });

  assert.deepEqual(result.target, { major: 12, minor: 2 });
});

test('rejects a package-only target outside the declared Angular range', (t) => {
  const projectRoot = createProject(t, '12.2.17', { declaration: '^12.1.0', lockfile: false });

  assert.throws(
    () => resolveAngularInstallation({ root: repositoryRoot, projectRoot, target: '12.0' }),
    /outside declared @angular\/core \^12\.1\.0/,
  );
});

test('derives an omitted target from parsed Angular evidence', (t) => {
  const projectRoot = createProject(t, '12.2.17');
  const result = resolveAngularInstallation({ root: repositoryRoot, projectRoot });

  assert.deepEqual(result.target, { major: 12, minor: 2 });
});

test('filters incompatible skills selected by capability packs', (t) => {
  const projectRoot = createProject(t, '12.2.17');
  const result = resolveAngularInstallation({
    root: repositoryRoot,
    projectRoot,
    target: 12,
    profile: 'performance',
    capabilities: ['state', 'ui'],
  });

  for (const skillId of [
    'angular.performance.angular-v22-performance-baseline',
    'angular.forms.angular-v22-signal-forms',
    'angular.signals.angular-v22-signals-state-and-forms',
  ]) {
    assert.equal(result.included.some((item) => item.id === skillId), false, skillId);
    assert.ok(result.excluded.some((item) => item.id === skillId && /requires Angular >=22; detected 12/.test(item.reason)), skillId);
  }
  assert.ok(result.included.some((item) => item.id === 'angular.performance.performance-audit'));
});

test('accepts a lockfile version within a declared Angular range', (t) => {
  const projectRoot = createProject(t, '12.2.17', { declaration: '^12.1.0' });
  const result = resolveAngularInstallation({ root: repositoryRoot, projectRoot, target: '12.2' });

  assert.equal(result.evidence.angular.version, '12.2.17');
  assert.equal(result.validation.level, 'lockfile-confirmed');
});

test('rejects a lockfile version outside an exact Angular declaration', (t) => {
  const projectRoot = createProject(t, '12.2.17', { declaration: '12.2.0' });

  assert.throws(
    () => resolveAngularInstallation({ root: repositoryRoot, projectRoot, target: '12.2' }),
    /package\.json @angular\/core 12\.2\.0 contradicts lockfile 12\.2\.17/,
  );
});

test('uses an ancestor package-lock.json for nested workspace packages', (t) => {
  const { root, projectRoot } = createNestedWorkspaceProject(t, '12.2.17', { declaration: '^12.1.0' });
  const result = resolveAngularInstallation({ root: repositoryRoot, projectRoot, target: '12.2' });

  assert.equal(result.evidence.lockfile.path, path.join(root, 'package-lock.json'));
  assert.equal(result.evidence.angular.source, 'package.json + lockfile');
});

test('does not use an unrelated ancestor package-lock.json', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-angular-unrelated-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const projectRoot = path.join(root, 'packages', 'library');
  fs.mkdirSync(projectRoot, { recursive: true });
  fs.writeFileSync(path.join(root, 'package.json'), `${JSON.stringify({ private: true }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, 'package-lock.json'), `${JSON.stringify({
    lockfileVersion: 3,
    packages: { 'node_modules/@angular/core': { version: '12.2.17' } },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(projectRoot, 'package.json'), `${JSON.stringify({
    private: true,
    dependencies: { '@angular/core': '^12.1.0', '@angular/common': '^12.1.0' },
  }, null, 2)}\n`);

  const result = resolveAngularInstallation({ root: repositoryRoot, projectRoot, target: '12.1' });

  assert.equal(result.validation.level, 'package-json-only');
});

test('prefers a workspace-local locked Angular version before the hoisted root', (t) => {
  const { root, projectRoot } = createNestedWorkspaceProject(t, '12.2.17', {
    declaration: '^12.1.0',
    nestedAngularVersion: '12.3.0',
  });
  const result = resolveAngularInstallation({ root: repositoryRoot, projectRoot, target: '12.3' });

  assert.equal(result.evidence.angular.version, '12.3.0');
  assert.equal(result.evidence.lockfile.path, path.join(root, 'package-lock.json'));
});

test('resolves Angular declarations from peerDependencies', (t) => {
  const projectRoot = createProject(t, '12.2.17', { dependencyField: 'peerDependencies', lockfile: false });
  const result = resolveAngularInstallation({ root: repositoryRoot, projectRoot, target: '12.2' });

  assert.deepEqual(result.evidence.angular.declarations, [
    { name: '@angular/common', version: '^12.2.17' },
    { name: '@angular/core', version: '^12.2.17' },
  ]);
});

test('detects compiler-cli mixed-major declarations', (t) => {
  const projectRoot = createProject(t, '12.2.17', { compilerCliVersion: '^22.0.0', lockfile: false });

  assert.throws(
    () => resolveAngularInstallation({ root: repositoryRoot, projectRoot, target: 12 }),
    /contradictory Angular major versions are declared/,
  );
});

test('fails closed for unsupported Angular dependency ranges', (t) => {
  const projectRoot = createProject(t, '12.2.17', { declaration: '12.2.0 || 13.0.0' });

  assert.throws(
    () => resolveAngularInstallation({ root: repositoryRoot, projectRoot, target: 12 }),
    /unsupported Angular dependency version/,
  );
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

function createProject(t, angularVersion, {
  compilerCliVersion,
  declaration,
  dependencyField = 'dependencies',
  lockfile = true,
} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-angular-resolver-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'apps', 'shell'), { recursive: true });
  const angularDependencies = angularVersion ? { '@angular/core': declaration ?? `^${angularVersion}`, '@angular/common': `^${angularVersion}` } : {};
  const packageJson = { private: true, [dependencyField]: angularDependencies };
  if (compilerCliVersion) packageJson.devDependencies = { '@angular/compiler-cli': compilerCliVersion };
  fs.writeFileSync(path.join(root, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);
  if (lockfile && angularVersion) {
    fs.writeFileSync(path.join(root, 'package-lock.json'), `${JSON.stringify({
      lockfileVersion: 3,
      packages: { 'node_modules/@angular/core': { version: angularVersion } },
    }, null, 2)}\n`);
  }
  return root;
}

function createNestedWorkspaceProject(t, angularVersion, { declaration, nestedAngularVersion } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-angular-workspace-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const projectRoot = path.join(root, 'packages', 'library');
  fs.mkdirSync(projectRoot, { recursive: true });
  fs.writeFileSync(path.join(root, 'package.json'), `${JSON.stringify({ private: true, workspaces: ['packages/*'] }, null, 2)}\n`);
  fs.writeFileSync(path.join(projectRoot, 'package.json'), `${JSON.stringify({
    name: '@example/library',
    private: true,
    dependencies: { '@angular/core': declaration ?? `^${angularVersion}`, '@angular/common': `^${angularVersion}` },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, 'package-lock.json'), `${JSON.stringify({
    lockfileVersion: 3,
    packages: {
      'node_modules/@angular/core': { version: angularVersion },
      ...(nestedAngularVersion ? { 'packages/library/node_modules/@angular/core': { version: nestedAngularVersion } } : {}),
    },
  }, null, 2)}\n`);
  return { root, projectRoot };
}
