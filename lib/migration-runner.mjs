import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRootGuard, safeWriteFile } from '../adapters/_shared/adapter-core.mjs';
import { assertNoSymlinkParents } from '../adapters/_shared/safe-fs.mjs';
import { resolveAngularLockfile } from './agent-plugins/repository.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stateRelativePath = '.ngautopilot/migration-run.json';

export function runMigration({ projectRoot, planPath, agent, approved = false }) {
  if (!approved) return failure('approval-required', 'approval_required', 'explicit --yes is required');
  const context = loadContext(projectRoot, planPath, agent);
  const statePath = path.join(context.projectRoot, stateRelativePath);
  if (fs.existsSync(statePath)) return failure('blocked', 'run_exists', 'a migration run already exists');
  const run = checkpoint(context);
  persist(context.projectRoot, run);
  return { ok: false, status: 'blocked', run, reason: run.reason };
}

export function resumeMigration({ projectRoot, runId, planPath, agent, approved = false }) {
  if (!approved) return failure('approval-required', 'approval_required', 'explicit --yes is required');
  const project = path.resolve(projectRoot);
  const stateFile = path.join(project, stateRelativePath);
  if (!fs.existsSync(stateFile)) return failure('failed', 'run_missing', 'persisted migration run is missing');
  let state;
  try { state = JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch { return failure('failed', 'run_invalid', 'persisted migration run is invalid'); }
  if (!runId || state.runId !== runId) return failure('failed', 'run_mismatch', 'requested run does not match persisted run');
  const selectedPlan = planPath || state.planPath;
  let context;
  try { context = loadContext(project, selectedPlan, agent); } catch (error) { return persistFailure(project, state, codeOf(error), error.message); }
  if (hashText(fs.readFileSync(context.planPath)) !== state.planHash) return persistFailure(project, state, 'plan_tampered', 'plan hash differs from persisted run');
  if (state.status === 'blocked' || state.phaseStatuses?.execution === 'awaiting-executor') return { ok: false, status: 'blocked', run: state, reason: state.reason };
  return persistFailure(project, state, 'gate_blocked', 'blocked migration gate cannot be skipped');
}

function loadContext(projectRoot, planPath, agent) {
  const project = path.resolve(projectRoot);
  const planFile = path.resolve(project, planPath || stateRelativePath.replace('migration-run', 'migration-plan'));
  if (!inside(project, planFile)) throw new Error('plan_path_unsafe: plan must be inside project root');
  if (!fs.existsSync(planFile)) throw new Error('plan_missing: migration plan is missing');
  let plan;
  try { plan = JSON.parse(fs.readFileSync(planFile, 'utf8')); } catch { throw new Error('plan_invalid: migration plan is invalid'); }
  if (typeof plan.projectRoot !== 'string' || path.resolve(plan.projectRoot) !== project) {
    throw new Error('project_mismatch: plan project root does not match the execution root');
  }
  if (!inside(project, planFile)) throw new Error('plan_path_unsafe: plan must be inside project root');
  if (plan.agent !== agent) throw new Error('agent_mismatch: plan agent does not match requested agent');
  if (plan.approvalRequired !== true || plan.status !== 'pending') throw new Error('plan_not_approved: plan is not an approved pending plan');
  if (!plan.evidence?.packageJson?.contentHash || !/^[a-f0-9]{64}$/.test(plan.evidence.packageJson.contentHash)) throw new Error('evidence_hash_missing: package evidence hash is missing or invalid');
  const packageEvidencePath = requireEvidenceInside(project, plan.evidence.packageJson.path, 'package_evidence_path_unsafe');
  checkHash(packageEvidencePath, plan.evidence.packageJson.contentHash, 'package_evidence_stale');
  if (plan.evidence.lockfile) {
    if (!/^[a-f0-9]{64}$/.test(plan.evidence.lockfile.contentHash || '')) throw new Error('evidence_hash_missing: lockfile evidence hash is missing or invalid');
    const selectedLock = resolveAngularLockfile(project);
    if (!selectedLock || typeof plan.evidence.lockfile.path !== 'string' || path.resolve(plan.evidence.lockfile.path) !== selectedLock.path) {
      throw new Error('lockfile_evidence_path_unsafe: lockfile must match the current owning workspace');
    }
    const workspaceRoot = path.dirname(selectedLock.path);
    if (workspaceRoot !== project) {
      const owner = plan.evidence.workspacePackageJson;
      if (plan.evidence.lockfile.workspaceRoot !== workspaceRoot || owner?.path !== path.join(workspaceRoot, 'package.json')
        || !/^[a-f0-9]{64}$/.test(owner?.contentHash || '')) {
        throw new Error('lockfile_evidence_path_unsafe: owning workspace evidence is required');
      }
      checkHash(requireEvidenceInside(workspaceRoot, owner.path, 'workspace_evidence_path_unsafe'), owner.contentHash, 'workspace_evidence_stale');
    }
    const lockfileEvidencePath = requireEvidenceInside(workspaceRoot, plan.evidence.lockfile.path, 'lockfile_evidence_path_unsafe');
    checkHash(lockfileEvidencePath, plan.evidence.lockfile.contentHash, 'lockfile_evidence_stale');
  }
  const hop = plan.route?.hops?.find((item) => item.status === 'pending') || plan.route?.hops?.[0];
  if (!hop?.pack?.id || !/^[a-f0-9]{64}$/.test(hop.pack.contentHash || '')) throw new Error('pack_hash_missing: selected hop pack hash is missing or invalid');
  checkHash(path.join(repositoryRoot, 'packs', `${hop.pack.id}.json`), hop.pack.contentHash, 'pack_tampered');
  return { projectRoot: project, planPath: planFile, plan, planHash: hashText(fs.readFileSync(planFile)), hop };
}

function checkpoint(context) {
  const now = new Date().toISOString();
  const runId = `migration-${now.replace(/[-:.TZ]/g, '')}-${crypto.randomBytes(4).toString('hex')}`;
  const reason = { code: 'awaiting-executor', message: 'validation checkpoint reached; no executable source migration transform is present in the hop pack' };
  return { version: 1, runId, status: 'blocked', planPath: path.relative(context.projectRoot, context.planPath).split(path.sep).join('/'), planHash: context.planHash, agent: context.plan.agent, selectedHop: context.hop, phaseStatuses: { inventory: 'passed', evidence: 'revalidated', hop: 'checkpointed', execution: 'awaiting-executor', gate: 'blocked' }, evidence: context.plan.evidence, startedAt: now, updatedAt: now, reason };
}

function persist(projectRoot, value) { safeWriteFile(createRootGuard(projectRoot), stateRelativePath, `${JSON.stringify(value, null, 2)}\n`); }
function persistFailure(project, state, code, message) { const failed = { ...state, status: 'failed', updatedAt: new Date().toISOString(), reason: { code, message }, phaseStatuses: { ...(state.phaseStatuses || {}), gate: 'failed' } }; persist(project, failed); return { ok: false, status: 'failed', run: failed, reason: failed.reason }; }
function failure(status, code, message) { return { ok: false, status, reason: { code, message } }; }
function checkHash(file, expected, code) { if (!fs.existsSync(file) || hashText(fs.readFileSync(file)) !== expected) throw new Error(`${code}: evidence hash does not match current file`); }
function hashText(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function codeOf(error) { return String(error.message).split(':', 1)[0] || 'validation_failed'; }
function inside(root, candidate) { const relative = path.relative(root, candidate); return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)); }
function requireEvidenceInside(root, file, code) {
  if (typeof file !== 'string' || !inside(root, path.resolve(file))) throw new Error(`${code}: evidence path must remain inside the project root`);
  assertNoSymlinkParents(createRootGuard(root), path.resolve(file));
  return path.resolve(file);
}
