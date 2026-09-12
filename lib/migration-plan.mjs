import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { createRepositoryTools, resolveAngularInstallation } from './agent-plugins/repository.mjs';
import { createRootGuard, safeWriteFile } from '../adapters/_shared/adapter-core.mjs';

const planPath = '.ngautopilot/migration-plan.json';

export function createMigrationPlan({ repositoryRoot, projectRoot, from, to, agent }) {
  const source = parseMajor(from, '--from');
  const target = parseMajor(to, '--to');
  if (source >= target) throw new Error('migration route must use ascending Angular major versions');

  const selection = resolveAngularInstallation({
    root: repositoryRoot,
    projectRoot,
    target: source,
    profile: 'migration',
  });
  const route = createRepositoryTools({ root: repositoryRoot }).upgradePlan({ from: source, to: target });
  if (!route.supported) throw new Error(`unsupported migration route: missing ${route.missing.join(', ')}`);

  const resolvedProjectRoot = selection.projectRoot;
  const hops = route.hops.map((hop) => {
    const packId = `ngautopilot-angular-${hop}`;
    const packPath = path.join(repositoryRoot, 'packs', `${packId}.json`);
    return {
      id: hop,
      from: Number(hop.split('-to-')[0]),
      to: Number(hop.split('-to-')[1]),
      status: 'pending',
      pack: { id: packId, contentHash: hashFile(packPath) },
    };
  });
  const packageJsonPath = path.join(repositoryRoot, 'package.json');
  const catalogPath = path.join(repositoryRoot, 'catalog.json');
  return {
    version: 1,
    status: 'pending',
    approvalRequired: true,
    agent,
    from: source,
    to: target,
    projectRoot: resolvedProjectRoot,
    output: { path: path.join(resolvedProjectRoot, planPath), relativePath: planPath },
    evidence: {
      angular: selection.evidence.angular,
      packageJson: { path: selection.evidence.packageJson, contentHash: hashFile(selection.evidence.packageJson) },
      lockfile: selection.evidence.lockfile && { ...selection.evidence.lockfile, contentHash: hashFile(selection.evidence.lockfile.path) },
      validation: selection.validation,
    },
    route: { supported: true, hops },
    catalog: {
      path: catalogPath,
      contentHash: hashFile(catalogPath),
      version: JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).version,
    },
    authorizedOperations: [
      { id: 'inventory', description: 'Inspect the project and record compatibility evidence.', mutatesProject: false },
      { id: 'validate-hop', description: 'Validate one approved hop before any later hop can be considered.', mutatesProject: false },
    ],
    executionBoundary: {
      mode: 'plan-only',
      shell: 'forbidden',
      codeChanges: 'forbidden',
      packageChanges: 'forbidden',
      gitChanges: 'forbidden',
      unsupportedCommands: ['migrate run', 'migrate resume'],
    },
  };
}

export function writeMigrationPlan(plan) {
  const guard = createRootGuard(plan.projectRoot);
  safeWriteFile(guard, plan.output.relativePath, `${JSON.stringify(plan, null, 2)}\n`);
  return { path: plan.output.path };
}

function parseMajor(value, label) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new Error(`${label} must be an Angular major version`);
  const major = Number(value);
  if (!Number.isSafeInteger(major) || major < 2 || major === 3) throw new Error(`${label} is not a supported Angular major version`);
  return major;
}

function hashFile(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`required migration content is missing: ${filePath}`);
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}
