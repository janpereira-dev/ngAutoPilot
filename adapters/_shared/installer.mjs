// Installer engine: backup, apply, verify, uninstall, restore.
// All operations go through safe-fs and use the install manifest.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { createRootGuard, safeWriteFile, safeReadFile, safeRemoveFile, safeExists, sha256, verifyChecksum, SafeFsError } from './safe-fs.mjs';
import { loadAdapterManifest } from './adapter-core.mjs';

const MANIFEST_NAME = '.ngautopilot-manifest.json';

function guard(installRoot) {
  return createRootGuard(installRoot);
}

function safeHome() {
  return process.env.USERPROFILE || process.env.HOME || '/';
}

function newInstallationId() {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Load existing manifest (if any) at installRoot.
 * @returns {Object|null}
 */
export function loadManifest(installRoot) {
  const abs = path.join(installRoot, MANIFEST_NAME);
  if (!fs.existsSync(abs)) return null;
  return JSON.parse(fs.readFileSync(abs, 'utf8'));
}

export function saveManifest(installRoot, manifest) {
  const guardRoot = guard(installRoot);
  const updated = { ...manifest, updatedAt: new Date().toISOString() };
  safeWriteFile(guardRoot, MANIFEST_NAME, JSON.stringify(updated, null, 2) + '\n');
  return updated;
}

/**
 * Build a fresh installation record from a plan.
 */
export function manifestFromPlan(plan, existing) {
  const files = plan.files.filter((f) => f.action === 'create' || f.action === 'update' || f.action === 'managed-section')
    .map((f) => ({ path: f.path, checksum: '', owner: 'ngautopilot' }));

  // Merge with existing files (preserving unknown entries is not allowed — only ngautopilot-owned).
  return {
    version: 1,
    installationId: existing?.installationId || newInstallationId(),
    agent: plan.agent,
    scope: plan.scope,
    pack: plan.pack,
    ngautopilotVersion: currentVersion(),
    createdAt: existing?.createdAt || new Date().toISOString(),
    files,
  };
}

function currentVersion() {
  try {
    const pj = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    return pj.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * Create a backup snapshot of the install root managed files.
 * Backup is stored under os.tmpdir()/ngautopilot-backups/<id>/.
 * Returns BackupResult { ok, backupPath, backedUp }.
 */
export function backup(plan, options = {}) {
  const { installRoot, files, pack } = plan;
  if (!fs.existsSync(installRoot)) {
    return { ok: true, backupPath: '', backedUp: [] };
  }
  const id = options.id || newInstallationId();
  const backupRoot = path.join(options.backupDir || path.join(os.tmpdir(), 'ngautopilot-backups'), id);
  fs.mkdirSync(backupRoot, { recursive: true });
  const backedUp = [];
  for (const file of files) {
    const abs = path.join(installRoot, file.path);
    if (!fs.existsSync(abs)) continue;
    const dest = path.join(backupRoot, file.path);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(abs, dest);
    backedUp.push(file.path);
  }
  // Persist the pre-backup manifest so we can restore precisely.
  const manifest = loadManifest(installRoot);
  if (manifest) {
    manifest.installRoot = installRoot;
    fs.writeFileSync(path.join(backupRoot, MANIFEST_NAME), JSON.stringify(manifest, null, 2));
  }
  return { ok: true, backupPath: backupRoot, backedUp };
}

/**
 * Apply an InstallPlan. Idempotent. Updates the install manifest.
 * Refuses to overwrite files NgAutoPilot does not own unless force.
 */
function computeDryRun(plan, force) {
  const existing = fs.existsSync(plan.installRoot) ? loadManifest(plan.installRoot) : null;
  const existingOwned = new Map((existing?.files || []).map((f) => [f.path, f]));
  let wouldCreate = 0;
  let wouldUpdate = 0;
  let wouldSkip = 0;
  const warnings = [];
  for (const file of plan.files) {
    const destAbs = path.join(plan.installRoot, file.path);
    const exists = fs.existsSync(destAbs);
    if (exists) {
      const currentChecksum = sha256(fs.readFileSync(destAbs, 'utf8'));
      const sourceContent = file.source ? fs.readFileSync(file.source, 'utf8') : '';
      const sourceChecksum = sha256(sourceContent);
      if (currentChecksum === sourceChecksum) {
        wouldSkip += 1;
      } else if (!existingOwned.has(file.path) && !force) {
        warnings.push(`would refuse to overwrite unmanaged file: ${file.path}`);
        wouldSkip += 1;
      } else {
        wouldUpdate += 1;
      }
    } else {
      wouldCreate += 1;
    }
  }
  return { ok: true, created: wouldCreate, updated: wouldUpdate, skipped: wouldSkip, manifestPath: path.join(plan.installRoot, MANIFEST_NAME), warnings };
}

export function applyPlan(plan, opts = {}) {
  const { dryRun = false, force = false } = opts;
  // In dry-run mode do not create the install root or guard.
  if (!dryRun && !fs.existsSync(plan.installRoot)) {
    fs.mkdirSync(plan.installRoot, { recursive: true });
  }
  if (dryRun) {
    return computeDryRun(plan, force);
  }
  const guardRoot = guard(plan.installRoot);
  const existing = loadManifest(plan.installRoot);
  const existingOwned = new Map((existing?.files || []).map((f) => [f.path, f]));
  const warnings = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const manifestFiles = [];

  for (const file of plan.files) {
    // Compute current checksum if exists.
    let currentChecksum = '';
    const destAbs = path.join(plan.installRoot, file.path);
    if (fs.existsSync(destAbs)) {
      currentChecksum = sha256(fs.readFileSync(destAbs, 'utf8'));
    }
    // Skip if unchanged and it's an update.
    if (file.source) {
      const sourceContent = fs.readFileSync(file.source, 'utf8');
      const sourceChecksum = sha256(sourceContent);
      if (currentChecksum === sourceChecksum) {
        skipped += 1;
        manifestFiles.push({ path: file.path, checksum: sourceChecksum, owner: 'ngautopilot' });
        continue;
      }
      // If file exists but NOT in existing manifest and NOT force => warn & skip.
      if (currentChecksum && !existingOwned.has(file.path) && !force) {
        warnings.push(`refuse to overwrite unmanaged file: ${file.path}`);
        skipped += 1;
        continue;
      }
      if (!dryRun) {
        const res = safeWriteFile(guardRoot, file.path, sourceContent);
        manifestFiles.push({ path: file.path, checksum: res.checksum, owner: 'ngautopilot' });
      }
      if (currentChecksum) updated += 1; else created += 1;
    }
  }

  if (!dryRun) {
    const record = {
      version: 1,
      installationId: existing?.installationId || newInstallationId(),
      agent: plan.agent,
      scope: plan.scope,
      pack: plan.pack,
      ngautopilotVersion: currentVersion(),
      createdAt: existing?.createdAt || new Date().toISOString(),
      files: manifestFiles,
    };
    saveManifest(plan.installRoot, record);
  }

  return { ok: true, created, updated, skipped, manifestPath: path.join(plan.installRoot, MANIFEST_NAME), warnings };
}

/**
 * Verify the install against the manifest.
 */
export function verifyInstall(plan) {
  const manifest = loadManifest(plan.installRoot);
  const verifiedFiles = [];
  const missingFiles = [];
  const hashMismatches = [];
  const warnings = [];
  if (!manifest) {
    return { ok: false, verifiedFiles: [], missingFiles: [], hashMismatches: [], warnings: ['install manifest missing'] };
  }
  for (const entry of manifest.files) {
    const guardRoot = guard(plan.installRoot);
    if (!safeExists(guardRoot, entry.path)) {
      missingFiles.push(entry.path);
      continue;
    }
    if (!verifyChecksum(guardRoot, entry.path, entry.checksum)) {
      hashMismatches.push(entry.path);
      continue;
    }
    verifiedFiles.push(entry.path);
  }
  return {
    ok: missingFiles.length === 0 && hashMismatches.length === 0,
    verifiedFiles,
    missingFiles,
    hashMismatches,
    warnings,
  };
}

/**
 * Uninstall: remove only files the manifest owns. Refuses files changed since install.
 */
export function uninstall(plan, opts = {}) {
  const { dryRun = false, force = false } = opts;
  const manifest = loadManifest(plan.installRoot);
  if (!manifest) {
    return { ok: false, removed: [], refused: [], warnings: ['manifest missing; nothing to uninstall'] };
  }
  const guardRoot = guard(plan.installRoot);
  const removed = [];
  const refused = [];
  for (const entry of manifest.files) {
    const destAbs = path.join(plan.installRoot, entry.path);
    if (!fs.existsSync(destAbs)) continue;
    const current = sha256(fs.readFileSync(destAbs, 'utf8'));
    if (current !== entry.checksum && !force) {
      refused.push({ path: entry.path, reason: 'user modified since install' });
      continue;
    }
    if (!dryRun) {
      try {
        safeRemoveFile(guardRoot, entry.path);
        removed.push(entry.path);
      } catch (e) {
        if (e instanceof SafeFsError) {
          refused.push({ path: entry.path, reason: e.code });
        } else {
          throw e;
        }
      }
    } else {
      removed.push(entry.path);
    }
  }
  // Remove manifest if empty.
  if (!dryRun && removed.length === manifest.files.length) {
    safeRemoveFile(guardRoot, MANIFEST_NAME);
  }
  return { ok: refused.length === 0, removed, refused };
}

/**
 * Restore from a backup ref.
 */
export function restore(backupRef, installRootOverride) {
  const { backupPath } = backupRef;
  if (!backupPath || !fs.existsSync(backupPath)) {
    return { ok: false, restoredFiles: 0, warnings: ['backup path missing'] };
  }
  const manifestPath = path.join(backupPath, MANIFEST_NAME);
  if (!fs.existsSync(manifestPath)) {
    return { ok: false, restoredFiles: 0, warnings: ['backup manifest missing'] };
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const installRoot = installRootOverride || manifest.installRoot;
  if (!installRoot) {
    return { ok: false, restoredFiles: 0, warnings: ['installRoot not provided and not in backup manifest'] };
  }
  const guardRoot = guard(installRoot);
  let restoredFiles = 0;
  for (const entry of manifest.files) {
    const src = path.join(backupPath, entry.path);
    if (!fs.existsSync(src)) continue;
    const content = fs.readFileSync(src, 'utf8');
    safeWriteFile(guardRoot, entry.path, content);
    restoredFiles += 1;
  }
  saveManifest(installRoot, manifest);
  return { ok: true, restoredFiles, warnings: [] };
}