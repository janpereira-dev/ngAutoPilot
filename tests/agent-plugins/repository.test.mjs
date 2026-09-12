import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createRepositoryTools, resolveAngularInstallation } from '../../lib/agent-plugins/repository.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packagedDataRoot = path.join(root, 'agent-plugins', 'ngautopilot-tools', 'data');

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

test('resolves a locked Angular snapshot through the CLI selection core without caller paths', (t) => {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-mcp-angular-'));
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));
  const snapshot = {
    manifest: {
      dependencies: {
        '@angular/core': '^16.2.12',
        '@angular/common': '^16.2.12',
        typescript: '~5.1.6',
      },
    },
    lockfile: {
      kind: 'npm',
      packages: {
        '@angular/core': '16.2.12',
        '@angular/common': '16.2.12',
        typescript: '5.1.6',
      },
    },
    workspace: { angularJson: true },
  };
  fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify(snapshot.manifest));
  fs.writeFileSync(path.join(projectRoot, 'package-lock.json'), JSON.stringify({
    lockfileVersion: 3,
    packages: Object.fromEntries(Object.entries(snapshot.lockfile.packages).map(([name, version]) => [`node_modules/${name}`, { version }])),
  }));
  fs.writeFileSync(path.join(projectRoot, 'angular.json'), '{}');

  const cli = resolveAngularInstallation({ root, projectRoot, target: '16.2', profile: 'testing', capabilities: ['ui'] });
  const mcp = createRepositoryTools({ root }).angularResolve({ snapshot, target: '16.2', profile: 'testing', capabilities: ['ui'] });

  assert.deepEqual(
    { target: mcp.target, profile: mcp.profile, capabilities: mcp.capabilities, included: mcp.included, excluded: mcp.excluded },
    { target: cli.target, profile: cli.profile, capabilities: cli.capabilities, included: cli.included, excluded: cli.excluded },
  );
  assert.equal('projectRoot' in mcp, false);
  assert.deepEqual(mcp.evidence.packageJson, { provenance: 'snapshot.manifest' });
  assert.equal(mcp.evidence.lockfile.provenance, 'snapshot.lockfile');
  assert.equal(mcp.evidence.workspace.provenance, 'snapshot.workspace');
});

test('resolves a snapshot from the packaged data root without caller paths', () => {
  const result = createRepositoryTools({ root: packagedDataRoot }).angularResolve({
    snapshot: {
      manifest: { dependencies: { '@angular/core': '^16.2.12' } },
      lockfile: { kind: 'npm', packages: { '@angular/core': '16.2.12' } },
    },
    target: 16,
  });

  assert.equal(result.target.major, 16);
  assert.ok(result.included.some(({ id }) => id === 'ngautopilot-core'));
  assert.equal('projectRoot' in result, false);
  assert.deepEqual(result.evidence.packageJson, { provenance: 'snapshot.manifest' });
});

test('fails closed for unlocked or malformed Angular snapshots', () => {
  const tools = createRepositoryTools({ root });
  assert.throws(() => tools.angularResolve({
    snapshot: {
      manifest: { dependencies: { '@angular/core': '^16.2.12' } },
      lockfile: { kind: 'npm', packages: {} },
    },
    target: 16,
  }), /@angular\/core is not recorded in snapshot lockfile/);
  assert.throws(() => tools.angularResolve({
    snapshot: { manifest: { dependencies: { '@angular/core': '^16.2.12' } }, projectRoot: 'C:\\private' },
    target: 16,
  }), /Angular snapshot contains unsupported fields/);
});
