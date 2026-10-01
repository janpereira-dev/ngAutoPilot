import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { resolveAngularInstallation } from './agent-plugins/repository.mjs';
import { createRootGuard, safeWriteFile } from '../adapters/_shared/adapter-core.mjs';

const outputRelativePath = '.ngautopilot/work-plan.json';
const maxGoalLength = 500;

export function createWorkPlan({ repositoryRoot, projectRoot, goal, agent, validateAgent }) {
  const normalizedGoal = normalizeGoal(goal);
  const resolvedProjectRoot = locateProjectRoot(projectRoot);
  if (agent) validateAgent(agent);
  const packageJsonPath = path.join(resolvedProjectRoot, 'package.json');
  const packageJson = readJson(packageJsonPath);
  const evidence = {
    package: {
      path: packageJsonPath,
      contentHash: hashFile(packageJsonPath),
      name: packageJson.name,
      packageManager: detectPackageManager(resolvedProjectRoot),
    },
  };
  if (hasAngularDependency(packageJson)) {
    evidence.angular = resolveAngularInstallation({
      root: repositoryRoot,
      projectRoot: resolvedProjectRoot,
      profile: 'core',
    }).evidence;
  }
  const lockfile = evidence.angular?.lockfile?.path ?? findLockfile(resolvedProjectRoot);
  if (lockfile) evidence.lockfile = { path: lockfile, contentHash: hashFile(lockfile) };
  if (evidence.angular?.lockfile) evidence.package.packageManager = evidence.angular.lockfile.kind;
  return {
    version: 1,
    status: 'pending',
    approvalRequired: true,
    goal: normalizedGoal,
    projectRoot: resolvedProjectRoot,
    ...(agent ? { agent } : {}),
    evidence,
    authorizedOperations: [
      { id: 'inventory', description: 'Inventory project structure and relevant metadata.', mutatesProject: false },
      { id: 'inspect', description: 'Inspect files relevant to the stated goal.', mutatesProject: false },
      { id: 'validate', description: 'Run bounded, pre-declared validation checks.', mutatesProject: false },
      { id: 'report', description: 'Produce an evidence-based report without applying changes.', mutatesProject: false },
    ],
    constraints: {
      angularVersionAndPackageFiles: 'forbidden',
      arbitraryShell: 'forbidden',
      codeChanges: 'forbidden',
      gitChanges: 'forbidden',
      fullPackInstallation: 'forbidden',
      executeGoal: 'forbidden',
    },
    validation: {
      bounded: true,
      evidenceRequired: true,
      maxScope: 'goal-relevant files only',
      reportRequired: true,
    },
    output: { path: path.join(resolvedProjectRoot, outputRelativePath), relativePath: outputRelativePath },
  };
}

export function writeWorkPlan(plan) {
  const guard = createRootGuard(plan.projectRoot);
  safeWriteFile(guard, plan.output.relativePath, `${JSON.stringify(plan, null, 2)}\n`);
  return { path: plan.output.path };
}

function normalizeGoal(goal) {
  if (typeof goal !== 'string' || !goal.trim()) throw new Error('--goal is required and must not be empty');
  const value = goal.trim();
  if (value.length > maxGoalLength) throw new Error(`--goal must be at most ${maxGoalLength} characters`);
  return value;
}

function locateProjectRoot(start) {
  let current = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(current, 'package.json'))) return current;
    const parent = path.dirname(current);
    if (parent === current) throw new Error(`package.json not found from project root: ${start}`);
    current = parent;
  }
}

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function hashFile(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function hasAngularDependency(pkg) { return Boolean({ ...pkg.peerDependencies, ...pkg.dependencies, ...pkg.devDependencies }['@angular/core']); }
function findLockfile(root) {
  for (const name of ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock']) {
    const file = path.join(root, name);
    if (fs.existsSync(file)) return file;
  }
  return undefined;
}
function detectPackageManager(root) {
  const lockfile = findLockfile(root);
  if (!lockfile) return undefined;
  const name = path.basename(lockfile);
  if (name === 'package-lock.json') return 'npm';
  if (name === 'pnpm-lock.yaml') return 'pnpm';
  if (name === 'yarn.lock') return 'yarn';
  return undefined;
}
