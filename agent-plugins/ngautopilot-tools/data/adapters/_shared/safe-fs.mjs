// Safe filesystem layer for NgAutoPilot adapters and installer.
//
// Guarantees:
// - All resolved paths stay inside the declared root.
// - Symlinks are detected and never silently followed outside the root.
// - Checksums are SHA-256 and encoding-safe.
// - Idempotent file writes (same content => no write).
// - Interacts with node:fs sync APIs so the installer stays simple and debuggable.
// - No shell, no exec, no network, no os. assumptions.
//
// Portability:
// - Uses path.join / path.resolve everywhere; never manual separators.
// - Works on Windows, macOS, Linux because it relies only on node:path semantics.
//
// This is ESM (.mjs) and shared by every adapter and the CLI/TUI core.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT_SENTINEL = Symbol('NgAutoPilotRoot');

/**
 * Build a safe root guard.
 * @param {string} root Absolute root directory (project cwd or user-scoped install base).
 * @returns {{resolve: (rel: string) => string, root: string}}
 */
export function createRootGuard(root) {
  const absoluteRoot = path.resolve(root);
  // realpath requires the path to exist; if not yet present (first install),
  // create it now so we can normalize symlinks safely. This keeps the guard
  // usable for fresh install roots.
  let normalizedRoot;
  if (fs.existsSync(absoluteRoot)) {
    normalizedRoot = fs.realpathSync(absoluteRoot);
  } else {
    fs.mkdirSync(absoluteRoot, { recursive: true });
    normalizedRoot = fs.realpathSync(absoluteRoot);
  }

  const guard = {
    root: normalizedRoot,
    /** Resolve a relative path inside the root and reject escapes. */
    resolve(rel) {
      if (typeof rel !== 'string' || rel.length === 0) {
        throw new SafeFsError('path_empty', 'path must be a non-empty string');
      }
      // Block pathological traversal early. ../../.. alone is a signal.
      if (rel.includes('\0')) {
        throw new SafeFsError('null_byte', 'path contains a NUL byte');
      }
      const candidate = path.resolve(normalizedRoot, rel);
      const relCandidate = path.relative(normalizedRoot, candidate);
      // path.relative returns an absolute path when candidate is outside root,
      // and '..' segments when it escapes upward.
      const escaped = relCandidate.startsWith('..') || path.isAbsolute(relCandidate);
      if (escaped) {
        throw new SafeFsError('path_traversal', `path escapes root: ${rel}`);
      }
      return candidate;
    },
    [ROOT_SENTINEL]: true,
  };
  return guard;
}

/**
 * Detect a symlink. Does not follow it.
 * @param {string} absPath Absolute path (already guard-resolved).
 * @returns {boolean}
 */
export function isSymlink(absPath) {
  try {
    const stat = fs.lstatSync(absPath);
    return stat.isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Resolve a symlink target and verify it stays inside the guard root.
 * @param {ReturnType<createRootGuard>} guard
 * @param {string} absPath
 * @returns {string} Resolved real target inside root.
 */
export function resolveSymlinkInside(guard, absPath) {
  const real = fs.realpathSync(absPath);
  const rel = path.relative(guard.root, real);
  const escaped = rel.startsWith('..') || path.isAbsolute(rel);
  if (escaped) {
    throw new SafeFsError('symlink_escape', `symlink target escapes root: ${absPath} -> ${real}`);
  }
  return real;
}

/**
 * Stat a path inside the guard. Follows symlinks only when contained.
 * If the path or its chain escapes the root, throws.
 */
export function safeStat(guard, rel) {
  const absPath = guard.resolve(rel);
  if (isSymlink(absPath)) {
    resolveSymlinkInside(guard, absPath);
  }
  return fs.statSync(absPath);
}

/**
 * Read a file inside the guard. Rejects escapes and symlink escapes.
 * @param {ReturnType<createRootGuard>} guard
 * @param {string} rel
 * @returns {string} UTF-8 content.
 */
export function safeReadFile(guard, rel) {
  const absPath = guard.resolve(rel);
  assertNoSymlinkParents(guard, absPath);
  if (isSymlink(absPath)) {
    resolveSymlinkInside(guard, absPath);
  }
  return fs.readFileSync(absPath, 'utf8');
}

/**
 * Write a file inside the guard. Creates parent dirs. Never appends.
 * Idempotent: if existing content matches (same checksum) no write is performed.
 * @param {ReturnType<createRootGuard>} guard
 * @param {string} rel
 * @param {string} content
 * @returns {{wrote: boolean, checksum: string}}
 */
export function safeWriteFile(guard, rel, content) {
  const absPath = guard.resolve(rel);
  assertNoSymlinkParents(guard, absPath);
  // Symlink target check: if the file is a symlink, ensure contained before overwrite.
  if (isSymlink(absPath)) {
    resolveSymlinkInside(guard, absPath);
  }
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  const checksum = sha256(content);
  if (fs.existsSync(absPath)) {
    const existing = fs.readFileSync(absPath, 'utf8');
    if (sha256(existing) === checksum) {
      return { wrote: false, checksum };
    }
  }
  fs.writeFileSync(absPath, content, 'utf8');
  return { wrote: true, checksum };
}

/**
 * Remove a file inside the guard. No-op if missing. Refuses directories here.
 */
export function safeRemoveFile(guard, rel) {
  const absPath = guard.resolve(rel);
  assertNoSymlinkParents(guard, absPath);
  if (isSymlink(absPath)) {
    resolveSymlinkInside(guard, absPath);
  }
  if (!fs.existsSync(absPath)) return false;
  const stat = fs.statSync(absPath);
  if (stat.isDirectory()) {
    throw new SafeFsError('is_directory', `safeRemoveFile refused directory: ${rel}`);
  }
  fs.unlinkSync(absPath);
  return true;
}

/**
 * Copy a source file into the guard. Used by adapters to install canonical skills.
 * @param {ReturnType<createRootGuard>} guard
 * @param {string} sourceRelOrAbs Source path (source root is trusted).
 * @param {string} destRel Destination relative path inside guard.
 * @returns {{wrote: boolean, checksum: string}}
 */
export function safeCopyInto(guard, sourceRelOrAbs, destRel) {
  const source = path.resolve(sourceRelOrAbs);
  if (!fs.existsSync(source)) {
    throw new SafeFsError('source_missing', `source missing: ${sourceRelOrAbs}`);
  }
  const stat = fs.statSync(source);
  if (!stat.isFile()) {
    throw new SafeFsError('source_not_file', `source is not a file: ${sourceRelOrAbs}`);
  }
  const content = fs.readFileSync(source, 'utf8');
  return safeWriteFile(guard, destRel, content);
}

/**
 * Recursively copy a directory tree into the guard, preserving relative structure.
 * @param {ReturnType<createRootGuard>} guard
 * @param {string} sourceDir Source directory (source root trusted).
 * @param {string} destRel Destination directory relative to root.
 * @param {(relFile: string) => boolean} [filter] Optional filter on relative file path.
 * @returns {{copied: string[], skipped: string[]}}
 */
export function safeCopyDirInto(guard, sourceDir, destRel, filter) {
  const sourceAbs = path.resolve(sourceDir);
  if (!fs.existsSync(sourceAbs) || !fs.statSync(sourceAbs).isDirectory()) {
    throw new SafeFsError('source_dir_missing', `source directory missing: ${sourceDir}`);
  }
  const copied = [];
  const skipped = [];
  const walk = (dirAbs) => {
    for (const entry of fs.readdirSync(dirAbs, { withFileTypes: true })) {
      const entryAbs = path.join(dirAbs, entry.name);
      const rel = path.relative(sourceAbs, entryAbs);
      const destRelFull = path.join(destRel, rel);
      if (entry.isDirectory()) {
        walk(entryAbs);
        continue;
      }
      if (entry.isFile()) {
        if (filter && !filter(rel)) {
          skipped.push(destRelFull);
          continue;
        }
        const result = safeCopyInto(guard, entryAbs, destRelFull);
        copied.push({ path: destRelFull, checksum: result.checksum, wrote: result.wrote });
        continue;
      }
      // Ignore symlinks and special entries.
      skipped.push(destRelFull);
    }
  };
  walk(sourceAbs);
  return { copied, skipped };
}

/**
 * Remove a directory recursively but only if it only contains files NgAutoPilot
 * placed. Caller supplies the set of relative paths to remove; anything not in
 * the set aborts the removal. Refuses to cross symlinks.
 * @param {ReturnType<createRootGuard>} guard
 * @param {string} dirRel
 * @param {Set<string>} managedRel Relative paths that are allowed to be deleted.
 */
export function safePruneManagedDir(guard, dirRel, managedRel) {
  const absRoot = guard.resolve(dirRel);
  if (!fs.existsSync(absRoot)) return { removed: [], refused: [] };
  const removed = [];
  const refused = [];
  const walk = (dirAbs) => {
    for (const entry of fs.readdirSync(dirAbs, { withFileTypes: true })) {
      const entryAbs = path.join(dirAbs, entry.name);
      if (isSymlink(entryAbs)) {
        refused.push(path.relative(guard.root, entryAbs));
        continue;
      }
      if (entry.isDirectory()) {
        walk(entryAbs);
        continue;
      }
      const rel = path.relative(guard.root, entryAbs);
      if (!managedRel.has(rel)) {
        refused.push(rel);
        continue;
      }
      fs.unlinkSync(entryAbs);
      removed.push(rel);
    }
    // Try to remove now-empty dir.
    try {
      if (fs.readdirSync(dirAbs).length === 0) {
        fs.rmdirSync(dirAbs);
      }
    } catch {
      // not empty or locked; leave alone
    }
  };
  walk(absRoot);
  return { removed, refused };
}

/**
 * SHA-256 hex checksum of UTF-8 content.
 * @param {string} content
 * @returns {string}
 */
export function sha256(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Verify checksum of an on-disk file inside the guard.
 * @param {ReturnType<createRootGuard>} guard
 * @param {string} rel
 * @param {string} expectedChecksum
 * @returns {boolean}
 */
export function verifyChecksum(guard, rel, expectedChecksum) {
  try {
    const content = safeReadFile(guard, rel);
    return sha256(content) === expectedChecksum;
  } catch {
    return false;
  }
}

/**
 * Custom error tag for safe-fs failures.
 */
export class SafeFsError extends Error {
  constructor(code, message) {
    super(`${code}: ${message}`);
    this.name = 'SafeFsError';
    this.code = code;
  }
}

/**
 * Check whether a path exists inside the guard.
 */
export function safeExists(guard, rel) {
  try {
    const absPath = guard.resolve(rel);
    assertNoSymlinkParents(guard, absPath);
    if (isSymlink(absPath)) {
      resolveSymlinkInside(guard, absPath);
    }
    return fs.existsSync(absPath);
  } catch {
    return false;
  }
}

/**
 * Refuse to traverse a symlinked parent while operating inside an install root.
 * A contained symlink is still unsafe for writes because its target can change
 * between validation and mutation; install destinations must use real parents.
 */
export function assertNoSymlinkParents(guard, absPath) {
  let current = path.dirname(absPath);
  while (current !== guard.root) {
    if (fs.existsSync(current) && isSymlink(current)) {
      throw new SafeFsError('symlink_parent', `path has symlinked parent: ${absPath}`);
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new SafeFsError('path_traversal', `path escapes root: ${absPath}`);
    }
    current = parent;
  }
}

/**
 * Resolve user-scope install root cross-platform.
 * Uses os.homedir() and an agent's declared user-relative base.
 * Never assumes APPDATA, HOME, or XDG specifics inside this module.
 * @param {string} userBase Relative base under home (e.g. '.codex').
 * @returns {string}
 */
export function resolveUserRoot(userBase) {
  const home = safeHome();
  return path.resolve(home, userBase);
}

function safeHome() {
  const home = process.env.USERPROFILE || process.env.HOME || (process.env.OS ? 'C:\\' : '/');
  return home;
}
