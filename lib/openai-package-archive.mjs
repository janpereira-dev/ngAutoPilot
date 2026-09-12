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

export function isRegularFile(file) {
  try {
    const stat = fs.lstatSync(file);
    return stat.isFile() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}
export function toPosix(value) { return value.split(path.sep).join('/'); }
function copyFile(source, target) {
  if (!isRegularFile(source)) throw new Error(`refusing to copy a non-regular source file: ${source}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
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
    copyFile(safeSourceTarget, packageTarget);
    const relativeTarget = toPosix(path.relative(path.dirname(generatedSkillFile), packageTarget));
    return `](${relativeTarget}${targetParts.suffix}${suffix})`;
  });
  return [...publicPaths.entries()].sort(([a], [b]) => b.length - a.length).reduce(
    (value, [canonicalPath, publicPath]) => value.split(canonicalPath).join(publicPath),
    rewritten,
  );
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
  const seenExact = new Map();
  const seenNormalized = new Map();
  for (const entry of entries) {
    const name = entry?.name;
    errors.push(...validateArchivePath(name));
    if (!['file', 'directory'].includes(entry?.type)) errors.push(`archive_member_type_unsupported: ${name ?? '<missing>'}`);
    const exact = String(name);
    if (seenExact.has(exact)) errors.push(`archive_member_path_duplicate: ${exact}`);
    seenExact.set(exact, entry?.type);
    const normalized = normalizeArchivePath(exact);
    if (seenNormalized.has(normalized) && seenNormalized.get(normalized) !== exact) errors.push(`archive_member_path_normalization_collision: ${exact}`);
    seenNormalized.set(normalized, exact);
  }
  for (const [name, type] of seenExact) {
    if (type !== 'file') continue;
    for (const otherName of seenExact.keys()) if (otherName !== name && otherName.startsWith(`${name}/`)) errors.push(`archive_member_path_type_conflict: ${name}`);
  }
  return [...new Set(errors)];
}

export function assertPackageBounds(entries, label) {
  const errors = [...validateArchiveEntries(entries), ...validatePackageBounds(entries)];
  if (errors.length) throw new Error(`${label} validation failed before ZIP creation:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}

export function validatePackageBounds(entries) {
  const errors = [];
  const files = entries.filter((entry) => entry.type === 'file');
  if (entries.length > MAX_ARCHIVE_ENTRIES) errors.push(`archive has ${entries.length} entries; maximum is ${MAX_ARCHIVE_ENTRIES}`);
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
  const segments = name.split('/');
  if (segments.some((segment) => segment === '')) return [`archive_member_path_has_empty_segment: ${name}`];
  if (segments.some((segment) => segment === '.')) return [`archive_member_path_has_dot_segment: ${name}`];
  if (segments.some((segment) => segment === '..')) return [`archive_member_path_has_parent_segment: ${name}`];
  if (segments.length > MAX_ARCHIVE_PATH_SEGMENTS) return [`archive_member_path_too_deep: ${name}`];
  return [];
}
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
    const zip = new yazl.ZipFile();
    const stream = fs.createWriteStream(output);
    stream.on('close', resolve);
    stream.on('error', reject);
    zip.outputStream.on('error', reject).pipe(stream);
    for (const file of listFiles(root)) {
      const errors = validateArchiveEntries([file]);
      if (errors.length) return reject(new Error(`archive entry validation failed: ${errors.join('; ')}`));
      zip.addFile(file.absolute, file.name, { mtime: zipDate, mode: 0o100644, compress: true, forceDosTimestamp: true });
    }
    zip.end();
  });
}

export function assertArchiveBounds(archivePath) {
  const errors = validateArchiveFile(archivePath);
  if (errors.length) throw new Error(`created ZIP failed archive validation:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}

export function validateArchiveFile(archivePath) {
  const errors = [];
  if (!isRegularFile(archivePath)) return [`archive is missing: ${archivePath}`];
  const archiveSize = fs.statSync(archivePath).size;
  if (archiveSize > MAX_ARCHIVE_BYTES) errors.push(`archive is ${archiveSize} bytes; maximum is ${MAX_ARCHIVE_BYTES}`);
  const archiveEntries = readZipEntries(archivePath, errors);
  errors.push(...validateArchiveEntries(archiveEntries).map((error) => `archive ${error}`));
  if (archiveEntries.length > MAX_ARCHIVE_ENTRIES) errors.push(`archive has ${archiveEntries.length} entries; maximum is ${MAX_ARCHIVE_ENTRIES}`);
  const uncompressedBytes = archiveEntries.reduce((total, entry) => total + entry.uncompressedSize, 0);
  if (uncompressedBytes > MAX_ARCHIVE_UNCOMPRESSED_BYTES) errors.push(`archive expands to ${uncompressedBytes} bytes; maximum is ${MAX_ARCHIVE_UNCOMPRESSED_BYTES}`);
  for (const entry of archiveEntries) if (entry.uncompressedSize > MAX_ARCHIVE_FILE_BYTES) errors.push(`archive entry exceeds per-file limit: ${entry.name}`);
  return [...new Set(errors)];
}

function readZipEntries(file, errors) {
  const data = fs.readFileSync(file);
  const entries = [];
  for (let offset = 0; offset + 46 <= data.length;) {
    if (data.readUInt32LE(offset) !== 0x02014b50) { offset += 1; continue; }
    const compressedSize = data.readUInt32LE(offset + 20);
    const uncompressedSize = data.readUInt32LE(offset + 24);
    const nameLength = data.readUInt16LE(offset + 28);
    const extraLength = data.readUInt16LE(offset + 30);
    const commentLength = data.readUInt16LE(offset + 32);
    const end = offset + 46 + nameLength + extraLength + commentLength;
    if (end > data.length) { errors.push('archive has a truncated central-directory entry'); break; }
    const name = data.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');
    const versionMadeBy = data.readUInt16LE(offset + 4);
    const platform = versionMadeBy >>> 8;
    const externalAttributes = data.readUInt32LE(offset + 38);
    entries.push({ name, type: zipMemberType(name, platform, externalAttributes), compressedSize, uncompressedSize });
    offset = end;
  }
  if (entries.length === 0) errors.push('archive has no readable central-directory entries');
  return entries;
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
