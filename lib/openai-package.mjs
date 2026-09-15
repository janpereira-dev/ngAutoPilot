import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validatePluginManifest } from './agent-plugins/manifest.mjs';
import {
  assertArchiveBounds,
  assertPackageBounds,
  collectPackageEntries,
  createZip,
  isRegularFile,
  listFiles,
  rewriteLocalReferences,
  validateArchiveEntries,
  validateArchiveFile,
  validateArchivePath,
  validateAssetPath,
  validateGeneratedPackageReferences,
  validatePackageBounds,
} from './openai-package-archive.mjs';

export {
  MAX_ARCHIVE_BYTES,
  MAX_ARCHIVE_ENTRIES,
  MAX_ARCHIVE_FILE_BYTES,
  MAX_ARCHIVE_PATH_LENGTH,
  MAX_ARCHIVE_PATH_SEGMENTS,
  MAX_ARCHIVE_UNCOMPRESSED_BYTES,
  validateArchiveEntries,
  validateArchiveFile,
  validateGeneratedPackageReferences,
  validatePackageBounds,
} from './openai-package-archive.mjs';

export const OPENAI_PACKAGE_NAME = 'ngautopilot-skills';
export const OPENAI_PACKAGE_ROOT = 'openai';
export const CANONICAL_SKILL_COUNT = 413;
export const MAX_PUBLIC_SKILL_NAME_LENGTH = 45;

const temporaryOutputPrefix = 'ngautopilot-openai-';
const ownedTemporaryRoots = new Set();
const legalUrls = {
  websiteURL: 'https://github.com/janpereira-dev/ngAutoPilot',
  supportURL: 'https://janpereira-dev.pages.dev/ngautopilot/support',
  privacyPolicyURL: 'https://janpereira-dev.pages.dev/ngautopilot/privacy',
  termsOfServiceURL: 'https://janpereira-dev.pages.dev/ngautopilot/terms',
};
const interfaceFields = new Set([
  'displayName', 'shortDescription', 'longDescription', 'developerName', 'category',
  'capabilities', 'websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL',
  'defaultPrompt', 'brandColor', 'composerIcon', 'logo', 'screenshots',
]);
const requiredPacketFiles = ['listing.md', 'test-cases.md', 'release-notes.md', 'policy-attestation.md'];

export async function buildOpenAiPackage({ root = process.cwd(), outputRoot, version = readPackageVersion(root) } = {}) {
  assertSafeReleaseVersion(version);
  const resolvedRoot = path.resolve(root);
  const resolvedOutputRoot = outputRoot ? path.resolve(outputRoot) : createTemporaryOutputRoot();
  assertSafeOutputRoot(resolvedRoot, resolvedOutputRoot);
  prepareOutputRoot(resolvedRoot, resolvedOutputRoot);

  const sourceRoot = path.join(resolvedRoot, OPENAI_PACKAGE_ROOT);
  const stagingRoot = path.join(resolvedOutputRoot, OPENAI_PACKAGE_NAME);
  const skillRecords = readCanonicalSkills(resolvedRoot);
  fs.mkdirSync(stagingRoot, { recursive: true });
  copyFile(path.join(sourceRoot, 'plugin.json'), path.join(stagingRoot, 'plugin.json'));
  copyFile(path.join(resolvedRoot, 'LICENSE'), path.join(stagingRoot, 'LICENSE'));
  copyTree(path.join(sourceRoot, 'assets'), path.join(stagingRoot, 'assets'));
  copyTree(path.join(sourceRoot, 'submission', version), path.join(stagingRoot, 'submission', version));
  writePublicSkills(skillRecords, resolvedRoot, stagingRoot);
  fs.writeFileSync(
    path.join(stagingRoot, 'skill-metadata.json'),
    `${JSON.stringify({ version, skills: skillRecords.map(({ publicName, id, name, sourcePath, frontmatter }) => ({ publicName, id, name, sourcePath, frontmatter })) }, null, 2)}\n`,
    'utf8',
  );
  const referenceErrors = validateGeneratedPackageReferences(stagingRoot);
  if (referenceErrors.length) {
    throw new Error(`generated package reference validation failed before ZIP creation:\n${referenceErrors.map((error) => `- ${error}`).join('\n')}`);
  }
  assertPackageBounds(collectPackageEntries(stagingRoot), 'generated package');

  const archivePath = path.join(resolvedOutputRoot, `${OPENAI_PACKAGE_NAME}-${version}.zip`);
  await createZip(stagingRoot, archivePath);
  assertArchiveBounds(archivePath);
  fs.writeFileSync(path.join(resolvedOutputRoot, 'SHA256SUMS'), `${hashFile(archivePath)}  ${path.basename(archivePath)}\n`, 'utf8');
  return { archivePath, packageRoot: stagingRoot, files: listFiles(stagingRoot), version, outputRoot: resolvedOutputRoot };
}

export function createTemporaryOutputRoot() {
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), temporaryOutputPrefix));
  ownedTemporaryRoots.add(path.resolve(outputRoot));
  return outputRoot;
}

export async function validateOpenAiPackage({ root = process.cwd() } = {}) {
  const errors = [];
  const resolvedRoot = path.resolve(root);
  const version = readPackageVersion(resolvedRoot);
  if (!isSafeReleaseVersion(version)) return { errors: [`package.json version must be a safe SemVer value: ${String(version)}`], version, skillFiles: 0 };
  const sourceRoot = path.join(resolvedRoot, OPENAI_PACKAGE_ROOT);
  const manifest = readUtf8Json(path.join(sourceRoot, 'plugin.json'), errors);
  errors.push(...validatePluginManifest(manifest).map((error) => `plugin.json ${error}`));
  const openAiExtension = manifest?.extensions?.['com.openai'];
  const interfaceMetadata = openAiExtension?.interface;

  if (manifest?.extensions?.['com.openai.interface'] !== undefined) errors.push('plugin.json must not use a dotted com.openai.interface key; use extensions.com.openai.interface');
  if (!openAiExtension || typeof openAiExtension !== 'object' || Array.isArray(openAiExtension)) errors.push('plugin.json must define extensions.com.openai');
  for (const forbiddenField of ['mcp', 'mcpServers', 'apps', 'appTemplates']) {
    if (manifest?.[forbiddenField] !== undefined || openAiExtension?.[forbiddenField] !== undefined) errors.push(`skills-only public manifest must not define ${forbiddenField}`);
  }
  if (manifest?.name !== OPENAI_PACKAGE_NAME) errors.push(`plugin.json name must be ${OPENAI_PACKAGE_NAME}`);
  if (manifest?.version !== version) errors.push(`plugin.json version must match package.json (${version})`);
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(manifest?.name ?? '') || (manifest?.name ?? '').length > 64) errors.push('plugin.json name must be lowercase hyphen-case and <=64 characters');
  validateInterface(interfaceMetadata, sourceRoot, errors);

  const sourceEntries = collectPackageEntries(sourceRoot);
  errors.push(...validateArchiveEntries(sourceEntries).map((error) => `public package ${error}`));
  for (const entry of sourceEntries.filter((item) => item.type === 'file')) {
    if (!isUtf8(entry.absolute)) errors.push(`public package source file is not UTF-8: ${entry.name}`);
    if (/^(?:mcp(?:\.json)?|\.mcp\.json|\.app\.json)$/i.test(path.posix.basename(entry.name)) || entry.name.includes('/mcp/')) errors.push(`skills-only public package includes MCP content: ${entry.name}`);
  }

  const skillRecords = readCanonicalSkills(resolvedRoot, errors);
  if (skillRecords.length !== CANONICAL_SKILL_COUNT) errors.push(`expected exactly ${CANONICAL_SKILL_COUNT} canonical skills; found ${skillRecords.length}`);
  if (new Set(skillRecords.map((skill) => skill.publicName)).size !== skillRecords.length) errors.push('public skill names must be unique');
  for (const skill of skillRecords) if (!isPublicSkillName(skill.publicName) || skill.publicName.length + OPENAI_PACKAGE_NAME.length + 1 > 64) errors.push(`invalid public skill identity: ${skill.publicName}`);
  for (const required of requiredPacketFiles) if (!fs.existsSync(path.join(sourceRoot, 'submission', version, required))) errors.push(`missing OpenAI submission packet file: submission/${version}/${required}`);
  validateSubmissionPacket(path.join(sourceRoot, 'submission', version), interfaceMetadata?.defaultPrompt, errors);

  const firstOutput = createTemporaryOutputRoot();
  const secondOutput = createTemporaryOutputRoot();
  try {
    const [first, second] = await Promise.all([
      buildOpenAiPackage({ root: resolvedRoot, outputRoot: firstOutput, version }),
      buildOpenAiPackage({ root: resolvedRoot, outputRoot: secondOutput, version }),
    ]);
    validateGeneratedPackage(first, skillRecords, errors);
    validateGeneratedPackage(second, skillRecords, errors);
    if (hashFile(first.archivePath) !== hashFile(second.archivePath)) errors.push('independent package builds are not byte-for-byte reproducible');
  } finally {
    cleanupOwnedTemporaryOutput(firstOutput);
    cleanupOwnedTemporaryOutput(secondOutput);
  }
  return { errors, version, skillFiles: skillRecords.length };
}

function validateInterface(metadata, sourceRoot, errors) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    errors.push('plugin.json must define extensions.com.openai.interface');
    return;
  }
  for (const field of Object.keys(metadata)) if (!interfaceFields.has(field)) errors.push(`OpenAI interface field is unsupported: ${field}`);
  for (const field of ['displayName', 'shortDescription', 'longDescription', 'developerName', 'category', 'capabilities', 'defaultPrompt', 'brandColor', 'composerIcon', 'logo', ...Object.keys(legalUrls)]) {
    if (metadata[field] === undefined || metadata[field] === '') errors.push(`OpenAI interface metadata is missing ${field}`);
  }
  if (!isSupportedText(metadata.displayName) || !metadata.displayName.trim() || metadata.displayName.length > 30 || metadata.displayName.includes('\n')) errors.push('OpenAI interface displayName must be non-empty, one line, and <=30 characters');
  if (!isSupportedText(metadata.shortDescription) || !metadata.shortDescription.trim() || metadata.shortDescription.length > 30 || metadata.shortDescription.includes('\n')) errors.push('OpenAI interface shortDescription must be non-empty, one line, and <=30 characters');
  if (!isSupportedText(metadata.longDescription, true) || !metadata.longDescription.trim() || metadata.longDescription.length > 4_000) errors.push('OpenAI interface longDescription must be non-empty and <=4,000 characters');
  if (!isSupportedText(metadata.developerName) || !metadata.developerName.trim() || metadata.developerName.length > 80 || metadata.developerName.includes('\n')) errors.push('OpenAI interface developerName must be non-empty, one line, and <=80 characters');
  if (metadata.category !== 'Developer Tools') errors.push('OpenAI interface category is invalid');
  if (!Array.isArray(metadata.capabilities) || metadata.capabilities.length !== 1 || metadata.capabilities[0] !== 'skills' || metadata.capabilities.some((capability) => !isSupportedText(capability) || capability.length > 120)) errors.push('OpenAI package must declare only the skills capability');
  const prompts = Array.isArray(metadata.defaultPrompt) ? metadata.defaultPrompt : [metadata.defaultPrompt];
  if ((!Array.isArray(metadata.defaultPrompt) && typeof metadata.defaultPrompt !== 'string') || prompts.length === 0 || prompts.length > 3 || prompts.some((prompt) => !isSupportedText(prompt) || !prompt.trim() || prompt.length > 128 || prompt.includes('\n')) || new Set(prompts.map(normalizePrompt)).size !== prompts.length) errors.push('OpenAI interface defaultPrompt must be a unique string or list of <=3 non-empty one-line prompts, each <=128 characters');
  if (typeof metadata.brandColor !== 'string' || !/^#[0-9a-f]{6}$/i.test(metadata.brandColor)) errors.push('OpenAI interface brandColor must be a six-digit hex color');
  for (const [field, expected] of Object.entries(legalUrls)) if (metadata[field] !== expected || !isHttpsUrl(metadata[field])) errors.push(`OpenAI interface ${field} must use the verified HTTPS URL`);
  if (metadata.screenshots !== undefined) errors.push('skills-only public manifest must not define interface.screenshots');
  for (const field of ['logo', 'composerIcon']) {
    if (!validateAssetPath(metadata[field])) errors.push(`OpenAI interface ${field} must use a safe ./ relative path`);
    else if (!isRegularFile(path.resolve(sourceRoot, metadata[field]))) errors.push(`OpenAI interface ${field} must reference an existing regular file`);
    else if (!isSquareSvg(path.resolve(sourceRoot, metadata[field]))) errors.push(`OpenAI interface ${field} must reference a square supported image`);
  }
}

function validateGeneratedPackage(result, skillRecords, errors) {
  const packageEntries = collectPackageEntries(result.packageRoot);
  errors.push(...validateArchiveEntries(packageEntries).map((error) => `generated package ${error}`));
  errors.push(...validatePackageBounds(packageEntries).map((error) => `generated package ${error}`));
  const generatedManifest = readUtf8Json(path.join(result.packageRoot, 'plugin.json'), errors);
  errors.push(...validatePluginManifest(generatedManifest).map((error) => `generated plugin.json ${error}`));
  if (generatedManifest?.name !== OPENAI_PACKAGE_NAME || generatedManifest?.version !== result.version) errors.push('generated package manifest identity/version is inconsistent');
  validateInterface(generatedManifest?.extensions?.['com.openai']?.interface, result.packageRoot, errors);
  for (const entry of packageEntries.filter((item) => item.type === 'file')) {
    if (/^(?:mcp(?:\.json)?|\.mcp\.json|\.app\.json)$/i.test(path.posix.basename(entry.name)) || entry.name.includes('/mcp/')) errors.push(`generated skills-only package includes MCP/app content: ${entry.name}`);
  }
  const skillEntries = packageEntries.filter((entry) => entry.name.startsWith('skills/') && entry.type === 'directory');
  const skillDirectories = skillEntries.filter((entry) => entry.name.split('/').length === 2);
  if (skillDirectories.length !== CANONICAL_SKILL_COUNT || packageEntries.some((entry) => entry.name.startsWith('skills/') && entry.name.split('/').length === 2 && entry.type !== 'directory')) errors.push('generated skills directory must contain exactly 413 immediate skill directories');
  const publicNames = new Set();
  for (const skill of skillRecords) {
    const directory = path.join(result.packageRoot, 'skills', skill.publicName);
    const skillFile = path.join(directory, 'SKILL.md');
    if (!isRegularFile(skillFile) || listFiles(directory).length !== 1) errors.push(`generated public skill ${skill.publicName} must contain exactly one SKILL.md`);
    else {
      const content = fs.readFileSync(skillFile, 'utf8');
      const frontmatter = parseFrontmatter(content);
      if (frontmatter.name !== skill.publicName || !isPublicSkillName(frontmatter.name)) errors.push(`generated public skill ${skill.publicName} has an invalid frontmatter name`);
      if (!frontmatter.description?.trim() || frontmatter.description.length > 1_024 || !isSupportedText(frontmatter.description) || !stripFrontmatter(content).trim()) errors.push(`generated public skill ${skill.publicName} must have a supported nonempty description (<=1,024) and body`);
      publicNames.add(frontmatter.name);
    }
  }
  if (publicNames.size !== CANONICAL_SKILL_COUNT) errors.push('generated public skill frontmatter names must be unique');
  if (isRegularFile(path.join(result.packageRoot, 'skills', 'README.md'))) errors.push('generated skills payload must not include skills/README.md');
  errors.push(...validateGeneratedPackageReferences(result.packageRoot));
  errors.push(...validateArchiveFile(result.archivePath));
}

function validateSubmissionPacket(packetRoot, defaultPrompt, errors) {
  if (!fs.existsSync(packetRoot)) return;
  const listing = readUtf8(path.join(packetRoot, 'listing.md'), errors);
  const tests = readUtf8(path.join(packetRoot, 'test-cases.md'), errors);
  const notes = readUtf8(path.join(packetRoot, 'release-notes.md'), errors);
  const policy = readUtf8(path.join(packetRoot, 'policy-attestation.md'), errors);
  for (const url of Object.values(legalUrls)) if (!listing.includes(url)) errors.push(`listing packet must include ${url}`);
  const prompts = [...listing.matchAll(/^\d+\.\s+(.+)$/gm)].map((match) => match[1].trim());
  const expectedPrompts = Array.isArray(defaultPrompt) ? defaultPrompt : [defaultPrompt];
  if (prompts.length === 0 || prompts.length > 3 || prompts.some((prompt) => !prompt || prompt.length > 128 || prompt.includes('\n')) || new Set(prompts.map(normalizePrompt)).size !== prompts.length) errors.push('starter prompts must be unique, non-empty, one-line, and <=128 characters (maximum three)');
  for (const prompt of expectedPrompts) if (!prompts.some((candidate) => normalizePrompt(candidate) === normalizePrompt(prompt))) errors.push('starter prompts must correspond to the manifest defaultPrompt');
  const headings = [...tests.matchAll(/^###\s+(Positive|Negative):\s*(.*?)\r?$/gm)];
  const cases = headings.map((heading, index) => ({
    kind: heading[1],
    title: heading[2],
    body: tests.slice(heading.index + heading[0].length, headings[index + 1]?.index ?? tests.length),
  }));
  const positives = cases.filter((item) => item.kind === 'Positive');
  const negatives = cases.filter((item) => item.kind === 'Negative');
  if (positives.length !== 5) errors.push('submission packet must declare exactly five positive test cases');
  if (negatives.length !== 3) errors.push('submission packet must declare exactly three negative test cases');
  if (cases.length !== 8 || cases.some((item) => !item.title.trim() || !packetField(item.body, 'Prompt') || !packetField(item.body, 'Expected') || !packetField(item.body, 'Rationale'))) errors.push('every submission case needs a nonempty title, prompt, expected result, and rationale');
  if (!notes.includes('NOT SUBMITTED') || !notes.includes('NOT VERIFIED')) errors.push('release notes must state honest availability and verification status');
  if (!policy.includes('Human attestation required') || !policy.includes('does not assert completion')) errors.push('policy attestation must remain an explicit, honest placeholder');
}

function packetField(body, field) { return body.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'))?.[1]?.trim(); }

function readCanonicalSkills(root, errors = []) {
  const skillsRoot = path.join(root, 'skills');
  const records = listFiles(skillsRoot).filter((file) => path.posix.basename(file.name) === 'SKILL.md').map((file) => {
    const content = readUtf8(file.absolute, errors);
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter.id || !frontmatter.name || !frontmatter.description) errors.push(`canonical skill lacks required metadata: ${file.name}`);
    if (!stripFrontmatter(content).trim()) errors.push(`canonical skill has an empty body: ${file.name}`);
    return { id: frontmatter.id, name: frontmatter.name, description: frontmatter.description, frontmatter: frontmatter.raw, sourcePath: `skills/${file.name}`, body: stripFrontmatter(content) };
  }).sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const nameCounts = new Map();
  for (const record of records) {
    const base = normalizePublicSkillName(record.id);
    nameCounts.set(base, (nameCounts.get(base) ?? 0) + 1);
  }
  return records.map((record) => ({ ...record, publicName: publicSkillName(record.id, (nameCounts.get(normalizePublicSkillName(record.id)) ?? 0) > 1) }));
}

function writePublicSkills(records, repositoryRoot, packageRoot) {
  const skillsRoot = path.join(packageRoot, 'skills');
  const publicPaths = new Map(records.map((skill) => [skill.sourcePath, `../${skill.publicName}/SKILL.md`]));
  for (const skill of records) {
    const target = path.join(skillsRoot, skill.publicName, 'SKILL.md');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const body = rewriteLocalReferences(skill.body, skill.sourcePath, repositoryRoot, packageRoot, target, publicPaths);
    fs.writeFileSync(target, `---\nname: ${yamlValue(skill.publicName)}\ndescription: ${yamlValue(skill.description)}\n---\n${body.startsWith('\n') ? body : `\n${body}`}`, 'utf8');
  }
}


function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const raw = match?.[1] ?? '';
  return {
    raw,
    id: raw.match(/^id:\s*(.+)$/m)?.[1]?.trim(),
    name: raw.match(/^name:\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, ''),
    description: raw.match(/^description:\s*>?\s*\n?\s*([^\n]+(?:\n\s+[^\n]+)*)/m)?.[1]?.replace(/\s+/g, ' ').trim().replace(/^['"]|['"]$/g, ''),
  };
}

function stripFrontmatter(content) { return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, ''); }
function yamlValue(value) { return JSON.stringify(String(value)); }
function normalizePublicSkillName(id) { return String(id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'skill'; }
function publicSkillName(id, forceHash) {
  const base = normalizePublicSkillName(id);
  const hash = crypto.createHash('sha256').update(String(id)).digest('hex').slice(0, 8);
  return forceHash || base.length > MAX_PUBLIC_SKILL_NAME_LENGTH ? `${base.slice(0, MAX_PUBLIC_SKILL_NAME_LENGTH - hash.length - 1).replace(/-+$/, '')}-${hash}` : base;
}
function isPublicSkillName(value) { return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= MAX_PUBLIC_SKILL_NAME_LENGTH; }

function assertSafeOutputRoot(root, outputRoot) {
  const repositoryOutput = path.resolve(root, 'dist', 'openai-plugin');
  if (outputRoot !== repositoryOutput && !ownedTemporaryRoots.has(outputRoot)) throw new Error(`refusing to clean untrusted output path: ${outputRoot}`);

  const outputStat = fs.lstatSync(outputRoot, { throwIfNoEntry: false });
  if (outputStat && (outputStat.isSymbolicLink() || !outputStat.isDirectory())) throw new Error(`refusing to clean a symlinked or non-directory output root: ${outputRoot}`);
  if (outputRoot !== repositoryOutput) return;

  const rootStat = fs.lstatSync(root, { throwIfNoEntry: false });
  if (!rootStat || rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw new Error(`repository root must be an existing non-symlink directory: ${root}`);
  const realRoot = fs.realpathSync.native(root);
  for (let current = outputRoot; ; current = path.dirname(current)) {
    const stat = fs.lstatSync(current, { throwIfNoEntry: false });
    if (stat) {
      if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`refusing to clean a symlinked or non-directory output parent: ${current}`);
      if (!isPathInside(realRoot, fs.realpathSync.native(current))) throw new Error(`refusing to clean output outside the repository root: ${current}`);
    }
    if (current === root) break;
  }
}
function prepareOutputRoot(root, outputRoot) { assertSafeOutputRoot(root, outputRoot); if (fs.existsSync(outputRoot)) fs.rmSync(outputRoot, { recursive: true, force: true }); fs.mkdirSync(outputRoot, { recursive: true }); }
function cleanupOwnedTemporaryOutput(outputRoot) { const resolved = path.resolve(outputRoot); if (ownedTemporaryRoots.has(resolved)) { fs.rmSync(resolved, { recursive: true, force: true }); ownedTemporaryRoots.delete(resolved); } }


function copyTree(source, target) { if (!fs.existsSync(source)) throw new Error(`missing source tree: ${source}`); collectPackageEntries(source); fs.cpSync(source, target, { recursive: true, dereference: false }); }
function copyFile(source, target) { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(source, target); }
function readPackageVersion(root) { return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version; }
function assertSafeReleaseVersion(version) { if (!isSafeReleaseVersion(version)) throw new Error(`package version must be a safe SemVer value: ${String(version)}`); }
function isSafeReleaseVersion(version) { return typeof version === 'string' && /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(version); }
function isPathInside(root, candidate) { const relative = path.relative(path.resolve(root), path.resolve(candidate)); return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative)); }
function readUtf8Json(file, errors) { const value = readUtf8(file, errors); try { return JSON.parse(value); } catch { errors.push(`invalid JSON: ${file}`); return null; } }
function readUtf8(file, errors) { if (!fs.existsSync(file)) { errors.push(`missing file: ${file}`); return ''; } if (!isUtf8(file)) { errors.push(`file is not UTF-8: ${file}`); return ''; } return fs.readFileSync(file, 'utf8'); }
function isUtf8(file) { const raw = fs.readFileSync(file); return !raw.includes(0) && Buffer.from(raw.toString('utf8'), 'utf8').equals(raw); }
function isSupportedText(value, allowLineBreaks = false) { return typeof value === 'string' && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u2028\u2029]/u.test(value) && (allowLineBreaks || !/[\r\n]/u.test(value)); }
function isHttpsUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password; } catch { return false; } }
function isSquareSvg(file) { if (!file.toLowerCase().endsWith('.svg')) return false; const content = fs.readFileSync(file, 'utf8'); const viewBox = content.match(/\bviewBox\s*=\s*["']\s*([0-9.+-]+)\s+([0-9.+-]+)\s+([0-9.+-]+)\s+([0-9.+-]+)\s*["']/i); return Boolean(viewBox && Number(viewBox[3]) >= 48 && Number(viewBox[4]) >= 48 && Number(viewBox[3]) === Number(viewBox[4])); }
function normalizePrompt(prompt) { return String(prompt).normalize('NFKC').replace(/\s+/g, ' ').trim(); }
function hashFile(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
