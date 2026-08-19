// Installer engine: backup, apply, verify, uninstall, restore.
// All operations go through safe-fs and use the install manifest.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { assertNoSymlinkParents, createRootGuard, safeWriteFile, safeReadFile, safeRemoveFile, safeExists, sha256, verifyChecksum, SafeFsError } from './safe-fs.mjs';
import { loadAdapterManifest } from './adapter-core.mjs';

const MANIFEST_NAME = '.ngautopilot-manifest.json';
const MANAGED_SECTION_START = '<!-- ngautopilot:instructions:start -->';
const MANAGED_SECTION_END = '<!-- ngautopilot:instructions:end -->';

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

function legacyInstallRoot(plan) {
  if (plan.agent !== 'codex') return undefined;
  return plan.legacyInstallRoot || path.join(plan.installRoot, '.codex');
}

function loadInstallation(plan) {
  const manifest = loadManifest(plan.installRoot);
  if (manifest) return { manifest, installRoot: plan.installRoot, legacy: false };

  const legacyRoot = legacyInstallRoot(plan);
  if (legacyRoot && fs.existsSync(legacyRoot) && fs.lstatSync(legacyRoot).isSymbolicLink()) return null;
  const legacyManifest = legacyRoot && loadManifest(legacyRoot);
  return legacyManifest ? { manifest: legacyManifest, installRoot: legacyRoot, legacy: true } : null;
}

function renderManagedSection(template) {
  return `${MANAGED_SECTION_START}\n${template.trimEnd()}\n${MANAGED_SECTION_END}\n`;
}

function extractManagedSection(content) {
  const start = content.indexOf(MANAGED_SECTION_START);
  const end = content.indexOf(MANAGED_SECTION_END);
  if (start === -1 && end === -1) return null;
  if (start === -1 || end === -1 || start > end || content.indexOf(MANAGED_SECTION_START, start + 1) !== -1 || content.indexOf(MANAGED_SECTION_END, end + 1) !== -1) {
    throw new SafeFsError('managed_section_invalid', 'instruction file has unbalanced NgAutoPilot managed-section markers');
  }
  const bodyStart = start + MANAGED_SECTION_START.length;
  return {
    start,
    end: end + MANAGED_SECTION_END.length,
    body: content.slice(bodyStart, end).replace(/^\r?\n/, '').replace(/\r?\n$/, ''),
  };
}

function mergeManagedSection(content, template) {
  const section = renderManagedSection(template);
  const existing = extractManagedSection(content);
  if (!existing) {
    return content.trimEnd() ? `${content.trimEnd()}\n\n${section}` : section;
  }
  return `${content.slice(0, existing.start)}${section}${content.slice(existing.end).replace(/^\r?\n/, '')}`;
}

function removeManagedSection(content) {
  const section = extractManagedSection(content);
  if (!section) throw new SafeFsError('managed_section_missing', 'instruction file has no NgAutoPilot managed section');
  return `${content.slice(0, section.start)}${content.slice(section.end).replace(/^\r?\n/, '')}`.replace(/^\s*\n/, '');
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
  const installation = loadInstallation(plan);
  const installRoot = installation?.installRoot || plan.installRoot;
  const files = installation?.manifest.files.map((file) => ({ path: file.path })) || plan.files;
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
  const manifest = installation?.manifest || loadManifest(installRoot);
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
  const desiredPaths = new Set(plan.files.map((file) => file.path));
  let wouldCreate = 0;
  let wouldUpdate = 0;
  let wouldSkip = 0;
  let wouldRemove = 0;
  const warnings = [];
  const guardRoot = guard(plan.installRoot);

  for (const entry of existing?.files || []) {
    if (!desiredPaths.has(entry.path) && safeExists(guardRoot, entry.path)) {
      const currentChecksum = sha256(safeReadFile(guardRoot, entry.path));
      if (currentChecksum === entry.checksum || force) wouldRemove += 1;
      else warnings.push(`would refuse to remove user-modified file: ${entry.path}`);
    }
  }

  for (const file of plan.files) {
    const destAbs = guardRoot.resolve(file.path);
    assertNoSymlinkParents(guardRoot, destAbs);
    const exists = safeExists(guardRoot, file.path);
    if (file.managedSection) {
      try {
        const currentContent = exists ? safeReadFile(guardRoot, file.path) : '';
        const nextContent = mergeManagedSection(currentContent, fs.readFileSync(file.source, 'utf8'));
        if (currentContent === nextContent) wouldSkip += 1;
        else if (exists) wouldUpdate += 1;
        else wouldCreate += 1;
      } catch (error) {
        warnings.push(`would refuse to update managed instructions: ${file.path} (${error instanceof SafeFsError ? error.code : error.message})`);
        wouldSkip += 1;
      }
      continue;
    }
    if (exists) {
      const currentChecksum = sha256(safeReadFile(guardRoot, file.path));
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
  return { ok: true, created: wouldCreate, updated: wouldUpdate, skipped: wouldSkip, removed: wouldRemove, manifestPath: path.join(plan.installRoot, MANIFEST_NAME), warnings };
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
  const legacy = !existing ? loadInstallation({ ...plan, legacyInstallRoot: legacyInstallRoot(plan) }) : null;
  const existingOwned = new Map((existing?.files || []).map((f) => [f.path, f]));
  const desiredPaths = new Set(plan.files.map((file) => file.path));
  const warnings = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let removed = 0;
  const manifestFiles = [];

  for (const entry of existing?.files || []) {
    if (desiredPaths.has(entry.path)) {
      continue;
    }

    if (!safeExists(guardRoot, entry.path)) {
      continue;
    }

    const currentChecksum = sha256(safeReadFile(guardRoot, entry.path));
    if (currentChecksum !== entry.checksum && !force) {
      warnings.push(`refuse to remove user-modified file: ${entry.path}`);
      continue;
    }

    safeRemoveFile(guardRoot, entry.path);
    removed += 1;
  }

  for (const file of plan.files) {
    // Compute current checksum if exists.
    let currentChecksum = '';
    if (safeExists(guardRoot, file.path)) {
      currentChecksum = sha256(safeReadFile(guardRoot, file.path));
    }
    // Skip if unchanged and it's an update.
    if (file.source && file.managedSection) {
      const sourceContent = fs.readFileSync(file.source, 'utf8');
      const sectionChecksum = sha256(sourceContent.trimEnd());
      try {
        const currentContent = safeExists(guardRoot, file.path) ? safeReadFile(guardRoot, file.path) : '';
        const mergedContent = mergeManagedSection(currentContent, sourceContent);
        if (currentContent === mergedContent) {
          skipped += 1;
        } else {
          const result = safeWriteFile(guardRoot, file.path, mergedContent);
          if (result.wrote) {
            if (currentContent) updated += 1; else created += 1;
          } else {
            skipped += 1;
          }
        }
        manifestFiles.push({ path: file.path, checksum: sectionChecksum, owner: 'ngautopilot', managedSection: true });
      } catch (error) {
        if (error instanceof SafeFsError) {
          warnings.push(`refuse to update managed instructions: ${file.path} (${error.code})`);
          const owned = existingOwned.get(file.path);
          if (owned) manifestFiles.push(owned);
          skipped += 1;
          continue;
        }
        throw error;
      }
      continue;
    }
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
        const owned = existingOwned.get(file.path);
        if (owned) manifestFiles.push(owned);
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
      installationId: existing?.installationId || legacy?.manifest.installationId || newInstallationId(),
      agent: plan.agent,
      scope: plan.scope,
      pack: plan.pack,
      ngautopilotVersion: currentVersion(),
      createdAt: existing?.createdAt || legacy?.manifest.createdAt || new Date().toISOString(),
      files: manifestFiles,
    };
    saveManifest(plan.installRoot, record);
    warnings.push(...migrateLegacyCodexInstall(plan, legacy?.legacy === true, new Set(manifestFiles.map((file) => file.path))));
  }

  return { ok: warnings.length === 0, created, updated, skipped, removed, manifestPath: path.join(plan.installRoot, MANIFEST_NAME), warnings };
}

function migrateLegacyCodexInstall(plan, shouldMigrate, installedPaths) {
  const legacyRoot = legacyInstallRoot(plan);
  if (!shouldMigrate || !legacyRoot || path.resolve(legacyRoot) === path.resolve(plan.installRoot)) {
    return [];
  }

  const legacyManifest = loadManifest(legacyRoot);
  if (!legacyManifest || legacyManifest.agent !== 'codex' || legacyManifest.scope !== plan.scope) return [];
  if (fs.lstatSync(legacyRoot).isSymbolicLink()) {
    return [`legacy Codex installation was not migrated because its root is a symlink: ${legacyRoot}`];
  }

  const legacyGuard = guard(legacyRoot);
  const warnings = [];
  let complete = true;
  for (const entry of legacyManifest.files || []) {
    const legacyPath = entry.path;
    const absolutePath = path.join(legacyRoot, legacyPath);
    const isCurrentDestination = plan.files.some((file) => path.resolve(plan.installRoot, file.path) === path.resolve(absolutePath));
    const destination = legacyDestination(plan, legacyPath);
    if (isCurrentDestination) {
      if (destination && installedPaths.has(destination)) continue;
      complete = false;
      warnings.push(`legacy Codex file was preserved because its current destination was not installed: ${legacyPath}`);
      continue;
    }
    if (!safeExists(legacyGuard, legacyPath)) continue;
    if (!destination || !installedPaths.has(destination)) {
      complete = false;
      warnings.push(`legacy Codex file was preserved because its new destination was not installed: ${legacyPath}`);
      continue;
    }
    try {
      if (sha256(safeReadFile(legacyGuard, legacyPath)) !== entry.checksum) {
        complete = false;
        warnings.push(`legacy Codex file was modified and was preserved: ${legacyPath}`);
        continue;
      }
      safeRemoveFile(legacyGuard, legacyPath);
    } catch (error) {
      complete = false;
      warnings.push(`legacy Codex file was preserved: ${legacyPath} (${error instanceof SafeFsError ? error.code : error.message})`);
    }
  }

  if (complete) {
    try {
      safeRemoveFile(legacyGuard, MANIFEST_NAME);
    } catch (error) {
      warnings.push(`legacy Codex manifest was preserved (${error instanceof SafeFsError ? error.code : error.message})`);
    }
  }
  return warnings;
}

function legacyDestination(plan, legacyPath) {
  const normalizedPath = toPosixPath(legacyPath);
  if (normalizedPath === 'AGENTS.md') {
    return plan.files.find((file) => file.managedSection)?.path;
  }
  if (normalizedPath.startsWith('skills/') || normalizedPath.startsWith('agents/')) {
    return `.agents/${normalizedPath}`;
  }
  return undefined;
}

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

/**
 * Verify the install against the manifest.
 */
export function verifyInstall(plan) {
  const installation = loadInstallation(plan);
  const manifest = installation?.manifest;
  const verifiedFiles = [];
  const missingFiles = [];
  const hashMismatches = [];
  const warnings = [];
  if (!manifest) {
    return { ok: false, verifiedFiles: [], missingFiles: [], hashMismatches: [], warnings: ['install manifest missing'] };
  }
  for (const entry of manifest.files) {
    const guardRoot = guard(installation.installRoot);
    if (!safeExists(guardRoot, entry.path)) {
      missingFiles.push(entry.path);
      continue;
    }
    if (entry.managedSection) {
      try {
        const section = extractManagedSection(safeReadFile(guardRoot, entry.path));
        if (!section || sha256(section.body) !== entry.checksum) hashMismatches.push(entry.path);
      } catch {
        hashMismatches.push(entry.path);
      }
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
  const installation = loadInstallation(plan);
  const manifest = installation?.manifest;
  if (!manifest) {
    return { ok: false, removed: [], refused: [], warnings: ['manifest missing; nothing to uninstall'] };
  }
  const guardRoot = guard(installation.installRoot);
  const removed = [];
  const refused = [];
  for (const entry of manifest.files) {
    if (!safeExists(guardRoot, entry.path)) continue;
    let current;
    if (entry.managedSection) {
      try {
        const section = extractManagedSection(safeReadFile(guardRoot, entry.path));
        current = section ? sha256(section.body) : '';
      } catch (error) {
        refused.push({ path: entry.path, reason: error instanceof SafeFsError ? error.code : 'managed_section_invalid' });
        continue;
      }
    } else {
      current = sha256(safeReadFile(guardRoot, entry.path));
    }
    if (current !== entry.checksum && !force) {
      refused.push({ path: entry.path, reason: 'user modified since install' });
      continue;
    }
    if (!dryRun) {
      try {
        if (entry.managedSection) {
          const remaining = removeManagedSection(safeReadFile(guardRoot, entry.path));
          if (remaining.trim()) safeWriteFile(guardRoot, entry.path, remaining);
          else safeRemoveFile(guardRoot, entry.path);
        } else {
          safeRemoveFile(guardRoot, entry.path);
        }
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
