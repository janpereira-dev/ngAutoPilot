import fs from 'node:fs';
import path from 'node:path';
import yazl from 'yazl';

export const MAX_ARCHIVE_ENTRIES = 5_000;
export const MAX_ARCHIVE_BYTES = 100 * 1024 * 1024;
export const MAX_ARCHIVE_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_ARCHIVE_UNCOMPRESSED_BYTES = 512 * 1024 * 1024;
export const MAX_ARCHIVE_PATH_SEGMENTS = 20;
export const MAX_ARCHIVE_PATH_LENGTH = 1_024;

const zipDate = new Date(1980, 0, 1);
const ZIP_CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const ZIP_LOCAL_FILE_SIGNATURE = 0x04034b50;
const ZIP_DATA_DESCRIPTOR_SIGNATURE = 0x08074b50;
const ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
const ZIP_SUPPORTED_FLAGS = 0x0808;
const ZIP_SUPPORTED_METHODS = new Set([0, 8]);

export function isRegularFile(file) {
  try {
    const stat = fs.lstatSync(file);
    return stat.isFile() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}
export function toPosix(value) { return value.split(path.sep).join('/'); }
function copyFile(source, target, packageRoot) {
  if (!isRegularFile(source)) throw new Error(`refusing to copy a non-regular source file: ${source}`);
  const { resolvedRoot, realRoot, resolvedTarget } = prepareSafeDestination(packageRoot, target);
  assertSafeDestinationParents(resolvedRoot, realRoot, path.dirname(resolvedTarget));
  let targetStat = lstatOrNull(resolvedTarget);
  if (targetStat?.isSymbolicLink()) throw new Error(`unsafe package destination is a symlink or junction: ${resolvedTarget}`);
  if (targetStat && !targetStat.isFile()) throw new Error(`unsafe package destination is not a regular file: ${resolvedTarget}`);
  // Re-check all parents and the target immediately before the copy to narrow
  // the validation-to-use race window for reused package directories.
  assertSafeDestinationParents(resolvedRoot, realRoot, path.dirname(resolvedTarget));
  targetStat = lstatOrNull(resolvedTarget);
  if (targetStat?.isSymbolicLink()) throw new Error(`unsafe package destination is a symlink or junction: ${resolvedTarget}`);
  if (targetStat && !targetStat.isFile()) throw new Error(`unsafe package destination is not a regular file: ${resolvedTarget}`);
  fs.copyFileSync(source, resolvedTarget);
}

function prepareSafeDestination(packageRoot, target) {
  const resolvedRoot = path.resolve(packageRoot);
  const resolvedTarget = path.resolve(target);
  if (!isPathInside(resolvedRoot, resolvedTarget)) throw new Error(`unsafe package destination escapes root: ${resolvedTarget}`);
  const realRoot = ensureSafeDestinationRoot(resolvedRoot);
  return { resolvedRoot, realRoot, resolvedTarget };
}

function ensureSafeDestinationRoot(root) {
  const missing = [];
  let existing = root;
  while (!lstatOrNull(existing)) {
    const parent = path.dirname(existing);
    if (parent === existing) throw new Error(`unsafe package destination root: ${root}`);
    missing.unshift(path.basename(existing));
    existing = parent;
  }
  const existingStat = lstatOrNull(existing);
  if (existingStat.isSymbolicLink() || !existingStat.isDirectory()) throw new Error(`unsafe package destination root: ${root}`);
  const realExisting = fs.realpathSync.native(existing);
  assertSafeDestinationDirectory(realExisting, existing, 'root parent');
  let current = existing;
  for (const segment of missing) {
    const next = path.join(current, segment);
    assertSafeDestinationDirectory(realExisting, current, 'root parent');
    try {
      fs.mkdirSync(next);
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
    }
    const resolved = assertSafeDestinationDirectory(realExisting, next, 'root');
    if (!isPathInside(realExisting, resolved)) throw new Error(`unsafe package destination root: ${root}`);
    current = next;
  }
  const rootStat = lstatOrNull(root);
  if (!rootStat || rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw new Error(`unsafe package destination root: ${root}`);
  const realRoot = fs.realpathSync.native(root);
  if (!isPathInside(realExisting, realRoot)) throw new Error(`unsafe package destination root: ${root}`);
  return realRoot;
}

function assertSafeDestinationParents(root, realRoot, directory) {
  if (!isPathInside(root, directory)) throw new Error(`unsafe package destination escapes root: ${directory}`);
  const relative = path.relative(root, directory);
  let current = root;
  assertSafeDestinationDirectory(realRoot, current, 'package destination parent');
  for (const segment of relative ? relative.split(path.sep) : []) {
    const next = path.join(current, segment);
    const stat = lstatOrNull(next);
    if (!stat) {
      // Validate the resolved parent before creating a child, then validate
      // the child again after creation to fail closed on races.
      assertSafeDestinationDirectory(realRoot, current, 'package destination parent');
      try {
        fs.mkdirSync(next);
      } catch (error) {
        if (error?.code !== 'EEXIST') throw error;
      }
    }
    current = next;
    const resolved = assertSafeDestinationDirectory(realRoot, current, 'package destination parent');
    if (!isPathInside(realRoot, resolved)) throw new Error(`unsafe package destination escapes root: ${current}`);
  }
}

function assertSafeDestinationDirectory(realRoot, directory, label) {
  const stat = lstatOrNull(directory);
  if (!stat || stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`unsafe package destination ${label}: ${directory}`);
  const resolved = fs.realpathSync.native(directory);
  if (!isPathInside(realRoot, resolved)) throw new Error(`unsafe package destination escapes root: ${directory}`);
  return resolved;
}

export function rewriteLocalReferences(body, sourcePath, repositoryRoot, packageRoot, generatedSkillFile, publicPaths) {
  const rewritten = body.replace(/\]\(([^)\s]+)(\s+[^)]*)?\)/g, (whole, target, suffix = '') => {
    if (isExternalMarkdownTarget(target)) return whole;
    const sourceFile = assertContainedRegularFile(repositoryRoot, path.resolve(repositoryRoot, sourcePath), `Markdown source ${sourcePath}`);
    const targetParts = splitMarkdownTarget(target);
    const canonicalTarget = toPosix(path.relative(repositoryRoot, path.resolve(path.dirname(sourceFile), targetParts.pathname)));
    if (publicPaths.has(canonicalTarget)) return `](${publicPaths.get(canonicalTarget)}${targetParts.suffix}${suffix})`;
    const sourceTarget = path.resolve(path.dirname(sourceFile), targetParts.pathname);
    let safeSourceTarget;
    try {
      safeSourceTarget = assertContainedRegularFile(repositoryRoot, sourceTarget, `Markdown target in ${sourcePath}`);
    } catch {
      throw new Error(`unresolvable local Markdown target in ${sourcePath}: ${target}`);
    }
    const packageTarget = path.join(packageRoot, path.relative(repositoryRoot, safeSourceTarget));
    copyFile(safeSourceTarget, packageTarget, packageRoot);
    const relativeTarget = toPosix(path.relative(path.dirname(generatedSkillFile), packageTarget));
    return `](${relativeTarget}${targetParts.suffix}${suffix})`;
  });
  return rewriteStandaloneLocalReferences(rewritten, publicPaths);
}

function rewriteStandaloneLocalReferences(body, publicPaths) {
  const entries = [...publicPaths.entries()].sort(([a], [b]) => b.length - a.length);
  if (entries.length === 0) return body;
  const publicPathByCanonical = new Map(entries);
  const alternatives = entries.map(([canonicalPath]) => escapeRegExp(canonicalPath)).join('|');
  const localReferencePattern = new RegExp(alternatives, 'g');
  const externalUrlRanges = [...body.matchAll(/(?:[a-z][a-z0-9+.-]*:\/\/|\/\/)[^\s<>{}\[\]"()]+/giu)]
    .map(({ index, 0: url }) => ({ end: index + url.length, start: index }));
  return body.replace(localReferencePattern, (canonicalPath, offset) => {
    const end = offset + canonicalPath.length;
    const previous = body[offset - 1];
    const next = body[end];
    const nextIsExtension = next === '.' && /[\p{L}\p{N}_-]/u.test(body[end + 1] ?? '');
    if ((previous && !/[\s([<"'=]/u.test(previous)) || nextIsExtension || (next && !/[\s)\]}>.,!?"'#]/u.test(next))) return canonicalPath;
    if (externalUrlRanges.some(({ start, end: urlEnd }) => offset >= start && offset < urlEnd)) return canonicalPath;
    return publicPathByCanonical.get(canonicalPath);
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function splitMarkdownTarget(target) {
  const match = target.match(/^([^?#]+)([?#][\s\S]*)?$/);
  return { pathname: match?.[1] ?? target, suffix: match?.[2] ?? '' };
}

export function isExternalMarkdownTarget(target) {
  return target.startsWith('#') || /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(target);
}

export function validateArchiveEntries(entries) {
  const errors = [];
  if (entries.length > MAX_ARCHIVE_ENTRIES) return [`archive has ${entries.length} entries; maximum is ${MAX_ARCHIVE_ENTRIES}`];
  const seenExact = new Map();
  const seenNormalized = new Map();
  for (const entry of entries) {
    const name = entry?.name;
    errors.push(...validateArchivePath(name));
    if (!['file', 'directory'].includes(entry?.type)) errors.push(`archive_member_type_unsupported: ${name ?? '<missing>'}`);
    if (typeof name === 'string' && name.endsWith('/') && entry?.type === 'file') errors.push(`archive_member_file_path_has_directory_marker: ${name}`);
    const exact = String(name);
    if (seenExact.has(exact)) errors.push(`archive_member_path_duplicate: ${exact}`);
    seenExact.set(exact, entry?.type);
    const normalized = normalizeArchivePath(stripDirectoryMarker(exact));
    const previous = seenNormalized.get(normalized);
    if (previous && previous.exact !== exact) {
      errors.push(`archive_member_path_normalization_collision: ${exact}`);
      if (previous.type === 'file' && entry?.type === 'directory') errors.push(`archive_member_path_type_conflict: ${previous.exact}`);
      if (previous.type === 'directory' && entry?.type === 'file') errors.push(`archive_member_path_type_conflict: ${exact}`);
    }
    seenNormalized.set(normalized, { exact, type: entry?.type });
  }
  for (const [normalizedName, descendant] of seenNormalized) {
    const segments = normalizedName.split('/');
    for (let index = 1; index < segments.length; index += 1) {
      const ancestor = seenNormalized.get(segments.slice(0, index).join('/'));
      if (ancestor?.type === 'file') errors.push(`archive_member_path_type_conflict: ${ancestor.exact}`);
    }
  }
  return [...new Set(errors)];
}

export function assertPackageBounds(entries, label) {
  const errors = [...new Set([...validateArchiveEntries(entries), ...validatePackageBounds(entries)])];
  if (errors.length) throw new Error(`${label} validation failed before ZIP creation:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}

export function validatePackageBounds(entries) {
  const errors = [];
  if (entries.length > MAX_ARCHIVE_ENTRIES) return [`archive has ${entries.length} entries; maximum is ${MAX_ARCHIVE_ENTRIES}`];
  const files = entries.filter((entry) => entry.type === 'file');
  let expandedBytes = 0;
  for (const entry of files) {
    try {
      const stat = fs.lstatSync(entry.absolute);
      if (!stat.isFile() || stat.isSymbolicLink()) {
        errors.push(`package entry is not a regular file: ${entry.name}`);
        continue;
      }
      expandedBytes += stat.size;
      if (stat.size > MAX_ARCHIVE_FILE_BYTES) errors.push(`package file exceeds per-file limit: ${entry.name}`);
    } catch {
      errors.push(`package entry is unreadable: ${entry.name}`);
    }
  }
  if (expandedBytes > MAX_ARCHIVE_UNCOMPRESSED_BYTES) errors.push(`package expands to ${expandedBytes} bytes; maximum is ${MAX_ARCHIVE_UNCOMPRESSED_BYTES}`);
  return errors;
}

export function validateGeneratedPackageReferences(packageRoot) {
  const errors = [];
  for (const skill of listFiles(path.join(packageRoot, 'skills')).filter((entry) => path.posix.basename(entry.name) === 'SKILL.md')) {
    const content = fs.readFileSync(skill.absolute, 'utf8');
    if (/\bskills\/[\w.-]+(?:\/[\w.-]+)*\/SKILL\.md\b/.test(content)) errors.push(`generated skill retains a canonical skill reference: ${skill.name}`);
    for (const target of markdownTargets(content)) {
      if (isExternalMarkdownTarget(target)) continue;
      const { pathname } = splitMarkdownTarget(target);
      const resolved = path.resolve(path.dirname(skill.absolute), pathname);
      if (!isPathInside(packageRoot, resolved) || !isRegularFile(resolved)) errors.push(`generated skill has an unresolved local Markdown target: ${skill.name} -> ${target}`);
    }
  }
  return [...new Set(errors)];
}

function markdownTargets(content) {
  return [...content.matchAll(/\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)].map((match) => match[1]);
}

export function validateArchivePath(name) {
  if (typeof name !== 'string' || name.length === 0) return [`archive_member_path_empty: ${name ?? '<missing>'}`];
  if (name.trim() !== name) return [`archive_member_path_has_outer_whitespace: ${name}`];
  if (/[\u0000-\u001f\u007f]/u.test(name)) return [`archive_member_path_unsupported_character: ${name}`];
  if (name.includes('\\')) return [`archive_member_path_has_backslash: ${name}`];
  if (path.posix.isAbsolute(name) || /^\/?[a-zA-Z]:/.test(name) || name.startsWith('//')) return [`archive_member_path_absolute: ${name}`];
  if (name.length > MAX_ARCHIVE_PATH_LENGTH) return [`archive_member_path_too_long: ${name}`];
  const pathWithoutDirectoryMarker = stripDirectoryMarker(name);
  const segments = pathWithoutDirectoryMarker.split('/');
  if (segments.some((segment) => segment === '')) return [`archive_member_path_has_empty_segment: ${name}`];
  if (segments.some((segment) => segment === '.')) return [`archive_member_path_has_dot_segment: ${name}`];
  if (segments.some((segment) => segment === '..')) return [`archive_member_path_has_parent_segment: ${name}`];
  const normalizedPath = normalizeArchivePath(pathWithoutDirectoryMarker);
  const normalizedSegments = normalizedPath.split('/');
  if (normalizedSegments.some((segment) => segment === '')) return [`archive_member_path_has_empty_segment: ${name}`];
  if (normalizedSegments.some((segment) => segment === '.')) return [`archive_member_path_has_dot_segment: ${name}`];
  if (normalizedSegments.some((segment) => segment === '..')) return [`archive_member_path_has_parent_segment: ${name}`];
  for (const segment of [...segments, ...normalizedSegments]) {
    if (/:/.test(segment)) return [`archive_member_path_has_windows_colon: ${name}`];
    if (/[ .]$/.test(segment)) return [`archive_member_path_has_windows_trailing_space_or_dot: ${name}`];
    if (/^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$/i.test(segment)) return [`archive_member_path_has_windows_device_name: ${name}`];
  }
  if (segments.length > MAX_ARCHIVE_PATH_SEGMENTS) return [`archive_member_path_too_deep: ${name}`];
  return [];
}
function stripDirectoryMarker(name) { return name.endsWith('/') ? name.slice(0, -1) : name; }
function normalizeArchivePath(name) { return name.normalize('NFKC').toLowerCase(); }
export function validateAssetPath(value) { return typeof value === 'string' && value.startsWith('./') && validateArchivePath(value.slice(2)).length === 0; }
function isPathInside(root, candidate) { const relative = path.relative(path.resolve(root), path.resolve(candidate)); return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative)); }

export function collectPackageEntries(root, directory = root) {
  const resolvedRoot = path.resolve(root);
  const rootStat = lstatOrNull(resolvedRoot);
  if (!rootStat) return [];
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw new Error(`unsafe package root: ${resolvedRoot}`);
  const realRoot = fs.realpathSync.native(resolvedRoot);
  const resolvedDirectory = path.resolve(directory);
  if (!isPathInside(resolvedRoot, resolvedDirectory)) throw new Error(`package directory escapes root: ${resolvedDirectory}`);
  return collectPackageEntriesFrom(resolvedRoot, realRoot, resolvedDirectory);
}

function collectPackageEntriesFrom(root, realRoot, directory) {
  assertContainedDirectory(realRoot, directory, 'package directory');
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    const name = toPosix(path.relative(root, absolute));
    const stat = fs.lstatSync(absolute);
    if (stat.isSymbolicLink()) throw new Error(`unsupported package symlink or junction: ${absolute}`);
    const realPath = fs.realpathSync.native(absolute);
    if (!isPathInside(realRoot, realPath)) throw new Error(`package entry escapes root after resolution: ${absolute}`);
    if (stat.isDirectory()) return [{ absolute, name, type: 'directory' }, ...collectPackageEntriesFrom(root, realRoot, absolute)];
    if (stat.isFile()) return [{ absolute, name, type: 'file' }];
    throw new Error(`unsupported package entry: ${absolute}`);
  }).sort(compareEntryNames);
}

function assertContainedRegularFile(root, candidate, label) {
  const resolvedRoot = path.resolve(root);
  const rootStat = lstatOrNull(resolvedRoot);
  const candidateStat = lstatOrNull(candidate);
  if (!rootStat || rootStat.isSymbolicLink() || !rootStat.isDirectory() || !candidateStat || candidateStat.isSymbolicLink() || !candidateStat.isFile()) {
    throw new Error(`${label} must be a regular file inside the repository`);
  }
  const realRoot = fs.realpathSync.native(resolvedRoot);
  const realCandidate = fs.realpathSync.native(candidate);
  if (!isPathInside(realRoot, realCandidate)) throw new Error(`${label} escapes the repository after resolution: ${candidate}`);
  return realCandidate;
}

function assertContainedDirectory(realRoot, directory, label) {
  const stat = fs.lstatSync(directory);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`${label} is not a real directory: ${directory}`);
  const realDirectory = fs.realpathSync.native(directory);
  if (!isPathInside(realRoot, realDirectory)) throw new Error(`${label} escapes root after resolution: ${directory}`);
}

function lstatOrNull(file) {
  try { return fs.lstatSync(file); } catch (error) { if (error?.code === 'ENOENT') return null; throw error; }
}

export function listFiles(root) { return collectPackageEntries(root).filter((entry) => entry.type === 'file'); }
function compareEntryNames(a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; }
export function createZip(root, output) {
  return new Promise((resolve, reject) => {
    let files;
    try {
      assertOutputOutsideInputRoot(root, output);
      files = listFiles(root);
      assertPackageBounds(files, 'archive entry');
      // Re-check the output path after the input tree and package bounds have
      // been inspected, immediately before opening the output stream.
      assertOutputOutsideInputRoot(root, output);
    } catch (error) {
      reject(error);
      return;
    }
    const zip = new yazl.ZipFile();
    const stream = fs.createWriteStream(output);
    stream.on('close', resolve);
    stream.on('error', reject);
    zip.outputStream.on('error', reject).pipe(stream);
    for (const file of files) {
      zip.addFile(file.absolute, file.name, { mtime: zipDate, mode: 0o100644, compress: true, forceDosTimestamp: true });
    }
    zip.end();
  });
}

function assertOutputOutsideInputRoot(root, output) {
  const resolvedRoot = path.resolve(root);
  const resolvedOutput = path.resolve(output);
  if (isPathInside(resolvedRoot, resolvedOutput)) throw new Error(`output archive is contained by the package root: ${resolvedOutput}`);
  const rootStat = lstatOrNull(resolvedRoot);
  if (!rootStat || rootStat.isSymbolicLink() || !rootStat.isDirectory()) return;
  const realRoot = fs.realpathSync.native(resolvedRoot);
  const existingOutputPath = findExistingPath(resolvedOutput);
  if (!existingOutputPath) return;
  let realOutput;
  try {
    realOutput = fs.realpathSync.native(existingOutputPath);
  } catch {
    throw new Error(`output archive path contains an unresolved symlink or junction: ${existingOutputPath}`);
  }
  if (isPathInside(realRoot, realOutput)) throw new Error(`output archive resolves inside the package root: ${resolvedOutput}`);
}

function findExistingPath(candidate) {
  let current = candidate;
  while (!lstatOrNull(current)) {
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
  return current;
}

export function assertArchiveBounds(archivePath) {
  const errors = validateArchiveFile(archivePath);
  if (errors.length) throw new Error(`created ZIP failed archive validation:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}

export function validateArchiveFile(archivePath) {
  const errors = [];
  if (!isRegularFile(archivePath)) return [`archive is missing: ${archivePath}`];
  const archiveSize = fs.statSync(archivePath).size;
  if (archiveSize > MAX_ARCHIVE_BYTES) return [`archive is ${archiveSize} bytes; maximum is ${MAX_ARCHIVE_BYTES}`];
  const archiveEntries = readZipEntries(archivePath, errors);
  errors.push(...validateArchiveEntries(archiveEntries).map((error) => `archive ${error}`));
  if (archiveEntries.length > MAX_ARCHIVE_ENTRIES) errors.push(`archive has ${archiveEntries.length} entries; maximum is ${MAX_ARCHIVE_ENTRIES}`);
  const uncompressedBytes = archiveEntries.reduce((total, entry) => total + entry.uncompressedSize, 0);
  if (uncompressedBytes > MAX_ARCHIVE_UNCOMPRESSED_BYTES) errors.push(`archive expands to ${uncompressedBytes} bytes; maximum is ${MAX_ARCHIVE_UNCOMPRESSED_BYTES}`);
  for (const entry of archiveEntries) if (entry.uncompressedSize > MAX_ARCHIVE_FILE_BYTES) errors.push(`archive entry exceeds per-file limit: ${entry.name}`);
  return [...new Set(errors)];
}

function readZipEntries(file, errors) {
  const archiveSize = fs.statSync(file).size;
  if (archiveSize > MAX_ARCHIVE_BYTES) {
    errors.push(`archive is ${archiveSize} bytes; maximum is ${MAX_ARCHIVE_BYTES}`);
    return [];
  }
  const data = fs.readFileSync(file);
  if (data.length > MAX_ARCHIVE_BYTES) {
    errors.push(`archive is ${data.length} bytes; maximum is ${MAX_ARCHIVE_BYTES}`);
    return [];
  }
  const eocdOffset = findEndOfCentralDirectory(data);
  if (eocdOffset < 0) {
    errors.push('archive has no valid end-of-central-directory record');
    return [];
  }
  const diskNumber = data.readUInt16LE(eocdOffset + 4);
  const centralDisk = data.readUInt16LE(eocdOffset + 6);
  const entriesOnDisk = data.readUInt16LE(eocdOffset + 8);
  const totalEntries = data.readUInt16LE(eocdOffset + 10);
  const centralSize = data.readUInt32LE(eocdOffset + 12);
  const centralOffset = data.readUInt32LE(eocdOffset + 16);
  const commentLength = data.readUInt16LE(eocdOffset + 20);
  if (eocdOffset + 22 + commentLength !== data.length) {
    errors.push('archive has a truncated end-of-central-directory record');
    return [];
  }
  if (diskNumber !== 0 || centralDisk !== 0 || entriesOnDisk !== totalEntries) {
    errors.push('archive uses unsupported multi-disk ZIP metadata');
    return [];
  }
  if (entriesOnDisk === 0xffff || totalEntries === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff) {
    errors.push('archive uses unsupported ZIP64 metadata');
    return [];
  }
  if (totalEntries > MAX_ARCHIVE_ENTRIES) {
    errors.push(`archive has ${totalEntries} entries; maximum is ${MAX_ARCHIVE_ENTRIES}`);
    return [];
  }
  if (centralOffset > eocdOffset || centralSize > eocdOffset - centralOffset || centralOffset + centralSize !== eocdOffset) {
    errors.push('archive has an invalid central-directory offset or size');
    return [];
  }
  const centralEnd = centralOffset + centralSize;
  const entries = [];
  let offset = centralOffset;
  for (let index = 0; index < totalEntries; index += 1) {
    if (offset + 46 > centralEnd || data.readUInt32LE(offset) !== ZIP_CENTRAL_DIRECTORY_SIGNATURE) {
      errors.push('archive has a truncated or malformed central-directory entry');
      return [];
    }
    const flags = data.readUInt16LE(offset + 8);
    const method = data.readUInt16LE(offset + 10);
    const compressedSize = data.readUInt32LE(offset + 20);
    const uncompressedSize = data.readUInt32LE(offset + 24);
    const nameLength = data.readUInt16LE(offset + 28);
    const extraLength = data.readUInt16LE(offset + 30);
    const commentLength = data.readUInt16LE(offset + 32);
    const end = offset + 46 + nameLength + extraLength + commentLength;
    if (end > centralEnd) { errors.push('archive has a truncated central-directory entry'); return []; }
    if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff || data.readUInt32LE(offset + 42) === 0xffffffff) {
      errors.push('archive central-directory entry uses unsupported ZIP64 metadata');
      return [];
    }
    if ((flags & ~ZIP_SUPPORTED_FLAGS) !== 0) {
      errors.push('archive central-directory entry uses unsupported general-purpose flags');
      return [];
    }
    if (!ZIP_SUPPORTED_METHODS.has(method)) {
      errors.push(`archive uses unsupported compression method: ${method}`);
      return [];
    }
    const centralNameBytes = data.subarray(offset + 46, offset + 46 + nameLength);
    const name = decodeZipName(centralNameBytes, flags, errors);
    if (name === null) return [];
    if (!validateExtraFields(data, offset + 46 + nameLength, extraLength) || hasZip64Extra(data, offset + 46 + nameLength, extraLength)) {
      errors.push('archive central-directory entry has malformed or unsupported extra fields');
      return [];
    }
    const versionMadeBy = data.readUInt16LE(offset + 4);
    const platform = versionMadeBy >>> 8;
    const externalAttributes = data.readUInt32LE(offset + 38);
    const localOffset = data.readUInt32LE(offset + 42);
    const local = readLocalRecord(data, {
      centralOffset,
      centralNameBytes,
      compressedSize,
      crc32: data.readUInt32LE(offset + 16),
      flags,
      localOffset,
      method,
      name,
      uncompressedSize,
    }, errors);
    if (!local) return [];
    entries.push({ name, type: zipMemberType(name, platform, externalAttributes), compressedSize, uncompressedSize });
    offset = end;
  }
  if (offset !== centralEnd) {
    errors.push('archive central-directory size does not match its entry count');
    return [];
  }
  if (entries.length === 0) errors.push('archive has no readable central-directory entries');
  return entries;
}

function decodeZipName(bytes, flags, errors) {
  if ((flags & 0x0800) === 0) return bytes.toString('utf8');
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    errors.push('archive has an invalid UTF-8 member name');
    return null;
  }
}

function validateExtraFields(data, start, length) {
  const end = start + length;
  if (end > data.length) return false;
  let offset = start;
  while (offset < end) {
    if (offset + 4 > end) return false;
    const fieldLength = data.readUInt16LE(offset + 2);
    offset += 4 + fieldLength;
    if (offset > end) return false;
  }
  return offset === end;
}

function hasZip64Extra(data, start, length) {
  const end = start + length;
  let offset = start;
  while (offset + 4 <= end) {
    const fieldId = data.readUInt16LE(offset);
    const fieldLength = data.readUInt16LE(offset + 2);
    if (fieldId === 0x0001) return true;
    offset += 4 + fieldLength;
  }
  return false;
}

function readLocalRecord(data, centralEntry, errors) {
  const { centralOffset, centralNameBytes, compressedSize, crc32, flags, localOffset, method, uncompressedSize } = centralEntry;
  if (localOffset >= centralOffset || localOffset + 30 > centralOffset || localOffset + 30 > data.length || data.readUInt32LE(localOffset) !== ZIP_LOCAL_FILE_SIGNATURE) {
    errors.push(`archive local record is invalid for member: ${centralEntry.name}`);
    return null;
  }
  const localFlags = data.readUInt16LE(localOffset + 6);
  const localMethod = data.readUInt16LE(localOffset + 8);
  const localCrc32 = data.readUInt32LE(localOffset + 14);
  const localCompressedSize = data.readUInt32LE(localOffset + 18);
  const localUncompressedSize = data.readUInt32LE(localOffset + 22);
  const localNameLength = data.readUInt16LE(localOffset + 26);
  const localExtraLength = data.readUInt16LE(localOffset + 28);
  const localEnd = localOffset + 30 + localNameLength + localExtraLength;
  if (localEnd > centralOffset || localEnd > data.length || !validateExtraFields(data, localOffset + 30 + localNameLength, localExtraLength)) {
    errors.push(`archive local record is truncated for member: ${centralEntry.name}`);
    return null;
  }
  if (localFlags !== flags || localMethod !== method || !ZIP_SUPPORTED_METHODS.has(localMethod)) {
    errors.push(`archive local record metadata does not match central directory: ${centralEntry.name}`);
    return null;
  }
  if (localCompressedSize === 0xffffffff || localUncompressedSize === 0xffffffff || hasZip64Extra(data, localOffset + 30 + localNameLength, localExtraLength)) {
    errors.push(`archive local record uses unsupported ZIP64 metadata: ${centralEntry.name}`);
    return null;
  }
  const localNameBytes = data.subarray(localOffset + 30, localOffset + 30 + localNameLength);
  if (!localNameBytes.equals(centralNameBytes)) {
    errors.push(`archive local record name does not match central directory: ${centralEntry.name}`);
    return null;
  }
  const hasDataDescriptor = (flags & 0x0008) !== 0;
  if (!hasDataDescriptor && (localCrc32 !== crc32 || localCompressedSize !== compressedSize || localUncompressedSize !== uncompressedSize)) {
    errors.push(`archive local record sizes do not match central directory: ${centralEntry.name}`);
    return null;
  }
  if (hasDataDescriptor && ![0, crc32].includes(localCrc32)) {
    errors.push(`archive local record CRC is not representable: ${centralEntry.name}`);
    return null;
  }
  if (hasDataDescriptor && ![0, compressedSize].includes(localCompressedSize)) {
    errors.push(`archive local record compressed size is not representable: ${centralEntry.name}`);
    return null;
  }
  if (hasDataDescriptor && ![0, uncompressedSize].includes(localUncompressedSize)) {
    errors.push(`archive local record uncompressed size is not representable: ${centralEntry.name}`);
    return null;
  }
  const payloadEnd = localEnd + compressedSize;
  if (payloadEnd > centralOffset || payloadEnd > data.length) {
    errors.push(`archive local record compressed payload exceeds central directory: ${centralEntry.name}`);
    return null;
  }
  if (hasDataDescriptor && !validateDataDescriptor(data, payloadEnd, centralOffset, crc32, compressedSize, uncompressedSize)) {
    errors.push(`archive data descriptor is invalid for member: ${centralEntry.name}`);
    return null;
  }
  return { payloadEnd };
}

function validateDataDescriptor(data, offset, centralOffset, crc32, compressedSize, uncompressedSize) {
  if (offset + 16 <= centralOffset && data.readUInt32LE(offset) === ZIP_DATA_DESCRIPTOR_SIGNATURE) {
    return data.readUInt32LE(offset + 4) === crc32
      && data.readUInt32LE(offset + 8) === compressedSize
      && data.readUInt32LE(offset + 12) === uncompressedSize;
  }
  return offset + 12 <= centralOffset
    && data.readUInt32LE(offset) === crc32
    && data.readUInt32LE(offset + 4) === compressedSize
    && data.readUInt32LE(offset + 8) === uncompressedSize;
}

function findEndOfCentralDirectory(data) {
  if (data.length < 22) return -1;
  const firstOffset = Math.max(0, data.length - 22 - 0xffff);
  for (let offset = data.length - 22; offset >= firstOffset; offset -= 1) {
    if (data.readUInt32LE(offset) !== ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE) continue;
    const commentLength = data.readUInt16LE(offset + 20);
    if (offset + 22 + commentLength === data.length) return offset;
  }
  return -1;
}

function zipMemberType(name, platform, externalAttributes) {
  // ZIP host system 3 denotes Unix; only it gives POSIX file-type bits a defined meaning.
  if (platform === 3) {
    const unixMode = externalAttributes >>> 16;
    const unixType = unixMode & 0o170000;
    if (unixType === 0o100000) return 'file';
    if (unixType === 0o040000) return 'directory';
    if (unixType !== 0) return 'unsupported';
  }
  // DOS and unknown creators do not encode a portable member type. Retain normal ZIP compatibility.
  return name.endsWith('/') ? 'directory' : 'file';
}
