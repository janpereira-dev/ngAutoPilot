import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { resolveAngularInstallation, resolveAngularSnapshot } from '../lib/agent-plugins/repository.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

test('accepts compound npm toolchain ranges and rejects contradictory locked versions', (t) => {
  const toolchain = { typescript: '>=4.8.2 <5.0', rxjs: '^6.5.3 || ^7.4.0', jest: '29.x' };
  const lockVersions = { typescript: '4.9.5', rxjs: '7.8.1', jest: '29.7.0' };
  const projectRoot = createProject(t, '15.2.10', { toolchain, lockVersions });
  const resolved = resolveAngularInstallation({ root: repositoryRoot, projectRoot, target: 15 });
  assert.equal(resolved.evidence.toolchain.typescript.status, 'lockfile-confirmed');
  assert.equal(resolved.evidence.toolchain.rxjs.locked, '7.8.1');
  const snapshot = { manifest: { dependencies: { '@angular/core': '^15.2.10', ...toolchain } },
    lockfile: { kind: 'npm', packages: { '@angular/core': '15.2.10', ...lockVersions } } };
  assert.equal(resolveAngularSnapshot({ root: repositoryRoot, snapshot, target: 15 }).evidence.toolchain.typescript.locked, '4.9.5');
  snapshot.lockfile.packages.typescript = '5.0.1';
  assert.throws(() => resolveAngularSnapshot({ root: repositoryRoot, snapshot, target: 15 }), error => error.code === 'toolchain-lock-mismatch');
  snapshot.manifest.dependencies.typescript = 'not-a-range';
  assert.throws(() => resolveAngularSnapshot({ root: repositoryRoot, snapshot, target: 15 }), /toolchain dependency range/);
  const declaredOnly = createProject(t, '15.2.10', { toolchain, lockfile: false });
  assert.equal(resolveAngularInstallation({ root: repositoryRoot, projectRoot: declaredOnly, target: 15 }).evidence.toolchain.typescript.status, 'declared-only');
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
