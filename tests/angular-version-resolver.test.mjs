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

test('reports complete toolchain evidence and workspace structure', (t) => {
  const projectRoot = createProject(t, '16.2.12', {
    toolchain: {
      '@angular/cli': '^16.2.12',
      typescript: '5.1.6',
      rxjs: '^7.8.1',
      '@angular-devkit/build-angular': '^16.2.12',
      karma: '^6.4.2',
      jest: '^29.7.0',
    },
    workspaceFiles: ['angular.json', 'project.json'],
  });
  const evidence = resolveAngularInstallation({ root: repositoryRoot, projectRoot, target: 16 }).evidence;

  assert.equal(evidence.toolchain['@angular/core'].status, 'lockfile-confirmed');
  assert.equal(evidence.toolchain.typescript.locked, '5.1.6');
  assert.equal(evidence.toolchain.builder.package, '@angular-devkit/build-angular');
  assert.deepEqual(evidence.toolchain.testRunner.packages, ['jest', 'karma']);
  assert.equal(evidence.workspace.packageRoot, projectRoot);
  assert.equal(evidence.workspace.files.angularJson, true);
  assert.equal(evidence.workspace.files.projectJson, true);
  assert.equal(evidence.workspace.files.workspaceJson, false);
});

test('rejects a lockfile mismatch for a declared toolchain package', (t) => {
  const projectRoot = createProject(t, '16.2.12', {
    toolchain: { typescript: '~5.1.6' },
    lockVersions: { typescript: '5.2.0' },
  });
  assert.throws(
    () => resolveAngularInstallation({ root: repositoryRoot, projectRoot, target: 16 }),
    (error) => error.code === 'toolchain-lock-mismatch' && error.package === 'typescript' && /typescript/.test(error.message),
  );
});

test('marks missing optional toolchain entries without inventing versions', (t) => {
  const projectRoot = createProject(t, '16.2.12');
  const evidence = resolveAngularInstallation({ root: repositoryRoot, projectRoot, target: 16 }).evidence;

  assert.equal(evidence.toolchain.typescript.status, 'missing');
  assert.equal(evidence.toolchain.builder.status, 'missing');
  assert.deepEqual(evidence.toolchain.testRunner.packages, []);
  assert.equal(evidence.toolchain.testRunner.status, 'missing');
});

test('uses the nearest nested package root and records workspace markers', (t) => {
  const projectRoot = createProject(t, '17.3.10', { nestedPackage: true, workspaceFiles: ['workspace.json'] });
  const evidence = resolveAngularInstallation({
    root: repositoryRoot,
    projectRoot: path.join(projectRoot, 'apps', 'shell', 'src'),
    target: 17,
  }).evidence;

  assert.equal(evidence.workspace.packageRoot, path.join(projectRoot, 'apps', 'shell'));
  assert.equal(evidence.packageJson, path.join(projectRoot, 'apps', 'shell', 'package.json'));
  assert.equal(evidence.workspace.files.workspaceJson, true);
  assert.equal(evidence.workspace.files.angularJson, false);
});

function createProject(t, angularVersion, {
  lockfile = true,
  toolchain = {},
  lockVersions = {},
  workspaceFiles = [],
  nestedPackage = false,
} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-angular-resolver-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'apps', 'shell'), { recursive: true });
  const packageRoot = nestedPackage ? path.join(root, 'apps', 'shell') : root;
  const dependencies = angularVersion
    ? { '@angular/core': `^${angularVersion}`, '@angular/common': `^${angularVersion}`, ...toolchain }
    : {};
  fs.writeFileSync(path.join(packageRoot, 'package.json'), `${JSON.stringify({ private: true, dependencies }, null, 2)}\n`);
  for (const workspaceFile of workspaceFiles) fs.writeFileSync(path.join(packageRoot, workspaceFile), '{}\n');
  if (lockfile && angularVersion) {
    const versions = { '@angular/core': angularVersion, ...Object.fromEntries(
      Object.entries(toolchain).map(([name, value]) => [name, lockVersions[name] ?? value.replace(/^[^0-9]*/, '')]),
    ), ...lockVersions };
    fs.writeFileSync(path.join(root, 'package-lock.json'), `${JSON.stringify({
      lockfileVersion: 3,
      packages: Object.fromEntries(Object.entries(versions).map(([name, version]) => [`node_modules/${name}`, { version }])),
    }, null, 2)}\n`);
  }
  return root;
}
