// NgAutoPilot Adapter Contract — shared core.
//
// One interface, declarative manifests, no per-agent code duplication.
// Each adapter directory provides a `manifest.json` (validated against
// schemas/adapter.schema.json) plus optional thin hooks; the installer
// core drives detect/plan/backup/install/update/verify/uninstall/restore.
//
// Strict TypeScript-style JSDoc. No `any`. Cross-platform via safe-fs.

import { createRootGuard, safeReadFile, safeWriteFile, safeRemoveFile, safeCopyInto, safeCopyDirInto, safePruneManagedDir, safeExists, sha256, verifyChecksum, resolveUserRoot, SafeFsError } from './safe-fs.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * @typedef {Object} DetectionContext
 * @property {string} cwd Current working directory.
 * @property {string} [home] Override home directory.
 * @property {boolean} [nonInteractive]
 */

/**
 * @typedef {Object} DetectionResult
 * @property {boolean} present Whether this agent appears configured in the cwd/home.
 * @property {string[]} evidence Files that triggered the detection.
 */

/**
 * @typedef {Object} InstallRequest
 * @property {string} agent Adapter id.
 * @property {string} pack Pack id.
 * @property {('project'|'user')} scope
 * @property {boolean} [dryRun]
 * @property {boolean} [force]
 * @property {boolean} [yes]
 */

/**
 * @typedef {Object} PlannedFile
 * @property {string} path Relative to install root.
 * @property {('create'|'update'|'managed-section'|'skip')} action
 * @property {string} [checksum]
 */

/**
 * @typedef {Object} InstallPlan
 * @property {string} agent
 * @property {('project'|'user')} scope
 * @property {string} pack
 * @property {string} installRoot Absolute install root.
 * @property {string} manifestPath Absolute path to install-manifest.json.
 * @property {PlannedFile[]} files
 * @property {string[]} warnings
 */

/**
 * @typedef {Object} ApplyResult
 * @property {boolean} ok
 * @property {number} created
 * @property {number} updated
 * @property {number} skipped
 * @property {string} manifestPath
 * @property {string[]} warnings
 */

/**
 * @typedef {Object} BackupResult
 * @property {boolean} ok
 * @property {string} backupPath Absolute path to backup snapshot.
 * @property {string[]} backedUp Relative paths backed up.
 */

/**
 * @typedef {Object} VerifyContext
 * @property {string} installRoot
 * @property {string} manifestPath
 */

/**
 * @typedef {Object} VerificationResult
 * @property {boolean} ok
 * @property {string[]} verifiedFiles
 * @property {string[]} missingFiles
 * @property {string[]} hashMismatches
 * @property {string[]} warnings
 */

/**
 * @typedef {Object} UninstallPlan
 * @property {string} installRoot
 * @property {string} manifestPath
 * @property {boolean} [dryRun]
 */

/**
 * @typedef {Object} BackupReference
 * @property {string} backupPath
 * @property {string} manifestPath
 */

/**
 * @typedef {Object} RestoreResult
 * @property {boolean} ok
 * @property {number} restoredFiles
 * @property {string[]} warnings
 */

const MANIFEST_NAME = '.ngautopilot-manifest.json';

/**
 * Load and validate an adapter manifest from disk.
 * @param {string} adaptersRoot Absolute adapters/ directory.
 * @param {string} agentId
 * @returns {Object} manifest
 */
export function loadAdapterManifest(adaptersRoot, agentId) {
  const file = path.join(adaptersRoot, agentId, 'manifest.json');
  if (!fs.existsSync(file)) {
    throw new AdapterError('manifest_missing', `no manifest.json for adapter ${agentId}`);
  }
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!json.id || json.id !== agentId) {
    throw new AdapterError('manifest_invalid', `manifest id mismatch: ${json.id} vs ${agentId}`);
  }
  if (!Array.isArray(json.scope) || json.scope.length === 0) {
    throw new AdapterError('manifest_invalid', `adapter ${agentId} missing scope`);
  }
  return json;
}

/**
 * List adapter ids present on disk.
 * @param {string} adaptersRoot
 * @returns {string[]}
 */
export function listAdapters(adaptersRoot) {
  if (!fs.existsSync(adaptersRoot)) return [];
  const dirs = fs.readdirSync(adaptersRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== '_shared')
    .map((d) => d.name);
  return dirs.filter((id) => fs.existsSync(path.join(adaptersRoot, id, 'manifest.json')));
}

export class AdapterError extends Error {
  constructor(code, message) {
    super(`${code}: ${message}`);
    this.name = 'AdapterError';
    this.code = code;
  }
}

/**
 * Concrete adapter implementation driven by a manifest.
 * One instance per agent. All operations go through safe-fs.
 */
export class Adapter {
  /**
   * @param {Object} manifest
   * @param {string} adaptersRoot Absolute adapters/ directory.
   * @param {string} sourceRoot Absolute NgAutoPilot source root (skills/, agents/,_catalog.json).
   */
  constructor(manifest, adaptersRoot, sourceRoot) {
    this.manifest = manifest;
    this.id = manifest.id;
    this.adaptersRoot = adaptersRoot;
    this.sourceRoot = sourceRoot;
  }

  /** @returns {string} */
  id() { return this.manifest.id; }

  /**
   * Detect presence in scope.
   * Project scope: cwd has AGENTS.md / CLAUDE.md / .codex / .cursorrules / .claude / etc.
   * User scope: home has the user-base directory or instruction file.
   * @param {DetectionContext} ctx
   * @returns {DetectionResult}
   */
  detect(ctx) {
    const evidence = [];
    const instructionFile = this.manifest.formats.instructions;
    if (ctx.scope === 'project') {
      const cwd = ctx.cwd || process.cwd();
      const base = path.join(cwd, this.manifest.paths.project);
      if (fs.existsSync(base) && fs.statSync(base).isDirectory()) evidence.push(base);
      const inst = path.join(cwd, instructionFile);
      if (fs.existsSync(inst)) evidence.push(inst);
    } else {
      const home = ctx.home || process.env.USERPROFILE || process.env.HOME || '/';
      const base = path.join(home, this.manifest.paths.user);
      if (fs.existsSync(base) && fs.statSync(base).isDirectory()) evidence.push(base);
      const inst = path.join(home, instructionFile);
      if (fs.existsSync(inst)) evidence.push(inst);
    }
    return { present: evidence.length > 0, evidence };
  }

  /**
   * Compute the install root for scope.
   * @param {('project'|'user')} scope
   * @param {string} [cwd]
   * @returns {string}
   */
  resolveInstallRoot(scope, cwd) {
    if (scope === 'project') {
      return path.resolve(cwd || process.cwd(), this.manifest.paths.project);
    }
    return resolveUserRoot(this.manifest.paths.user);
  }

  /**
   * Compute manifest path for an installation.
   * @param {string} installRoot
   * @returns {string}
   */
  resolveManifestPath(installRoot) {
    return path.join(installRoot, MANIFEST_NAME);
  }
}

export { createRootGuard, safeReadFile, safeWriteFile, safeRemoveFile, safeCopyInto, safeCopyDirInto, safePruneManagedDir, safeExists, sha256, verifyChecksum, SafeFsError, resolveUserRoot };
export const MANIFEST_FILE = MANIFEST_NAME;