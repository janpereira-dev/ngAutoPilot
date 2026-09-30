// Native snapshots are independent of legacy installation ownership records.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { listAdapters, loadAdapterManifest } from './adapter-core.mjs';
import { createRootGuard, assertNoSymlinkParents, safeReadSourceFile, safeRemoveFile, sha256 } from './safe-fs.mjs';
import { resolvePackSkills } from '../../lib/agent-plugins/pack-resolver.mjs';
import { ensureUniquePortableNames, renderPortableSkill } from '../../lib/agent-plugins/portable-skill.mjs';
import { isLocalOnlySourcePath } from '../../lib/local-only.mjs';

const RECORD = '.ngautopilot-export.json';

export function loadNativeLayouts(sourceRoot) {
  const layouts = JSON.parse(safeReadSourceFile(sourceRoot, path.join(sourceRoot, 'adapters/native-layouts.json')));
  const ids = listAdapters(path.join(sourceRoot, 'adapters')).sort();
  if (JSON.stringify(ids) !== JSON.stringify(Object.keys(layouts.adapters).sort())) throw new Error('native layouts must cover every registered adapter exactly once');
  for (const layout of Object.values(layouts.adapters)) {
    for (const value of [layout.skills, layout.instructions]) {
      if (typeof value !== 'string' || !value || path.posix.isAbsolute(value) || value.includes('\\') || value.split('/').some(part => !part || part === '..' || part === '.')) throw new Error('invalid native export path');
    }
    if (!Array.isArray(layout.sources) || !layout.sources.length || layout.sources.some(url => !url.startsWith('https://'))) throw new Error('native layout requires primary sources');
  }
  return layouts;
}

export function exportAdapter({ sourceRoot, agent, packId, output }) {
  loadAdapterManifest(path.join(sourceRoot, 'adapters'), agent);
  const layout = loadNativeLayouts(sourceRoot).adapters[agent];
  const skills = resolvePackSkills({ sourceRoot, catalogPath: path.join(sourceRoot, 'catalog.json'), packsRoot: path.join(sourceRoot, 'packs'), packId });
  const overrides = Object.fromEntries(skills.flatMap(skill => {
    const candidate = skill.id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return candidate.length > 64 ? [[skill.id, `${candidate.slice(0, 51).replace(/-$/, '')}-${sha256(skill.id).slice(0, 12)}`]] : [];
  }));
  const names = ensureUniquePortableNames(skills.map(skill => skill.id), overrides);
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-export-'));
  try {
    const desired = new Map();
    for (const skill of skills) {
      const target = path.join(staging, names.get(skill.id));
      const sourceDir = path.dirname(path.join(sourceRoot, skill.path));
      renderPortableSkill({ sourceDir, targetDir: target, skill: { ...skill, portableName: names.get(skill.id) },
        copyOptions: { excludeNestedSkills: true, filter: source => !isLocalOnlySourcePath(path.relative(sourceRoot, source)) },
        transformBody: body => bundleExternalReferences(body, sourceDir, target, sourceRoot) });
      collectFiles(target, path.posix.join(layout.skills, names.get(skill.id)), desired);
    }
    const catalogFile = 'NGAUTOPILOT-CATALOG.json';
    const catalogReference = path.posix.relative(path.posix.dirname(layout.instructions), catalogFile);
    const templatePath = path.join(sourceRoot, 'adapters/native-instructions.template.md');
    desired.set(layout.instructions, Buffer.from(safeReadSourceFile(sourceRoot, templatePath).replaceAll('{{catalog}}', catalogReference)));
    desired.set(catalogFile, Buffer.from(JSON.stringify({ agent, pack: packId, skills: skills.map(skill => ({ id: skill.id, name: names.get(skill.id), description: skill.description, path: path.posix.join(layout.skills, names.get(skill.id), 'SKILL.md'), compatibility: skill.compatibility ?? null })) }, null, 2) + '\n'));
    desired.set('NGAUTOPILOT-EXPORT.md', Buffer.from(`# NgAutoPilot native export\n\nAdapter: ${agent}\nPack: ${packId}\nSkills: ${layout.skills}/<portable-name>/SKILL.md\nInstructions: ${layout.instructions}\n\n${layout.caveat ?? 'Merge the instruction file with your existing project guidance after reviewing it.'}\n\nThis snapshot contains skills and instructions, not native subagent configuration.\nReview files before copying them. Export does not install, grant trust, or change host configuration.\nThe export record is not an installation manifest; do not use uninstall on this snapshot.\nLegacy install paths remain separate pending an explicit migration.\n`));
    return applyExport(path.resolve(output), desired, agent, packId);
  } finally {
    // Only remove the known, independently-created temporary staging directory.
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

function bundleExternalReferences(body, sourceDir, targetDir, sourceRoot) {
  const copied = new Set();
  const rewrite = (content, origin, destination) => content.replace(/]\(([^)]+)\)/g, (match, reference) => {
    if (reference.startsWith('/') || reference.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(reference)) return match;
    const resource = reference.split(/[?#]/, 1)[0];
    if (!resource) return match;
    const absolute = path.resolve(origin, resource);
    const local = path.relative(sourceDir, absolute);
    if (!local.startsWith('..') && !path.isAbsolute(local)) {
      const localTarget = path.join(targetDir, local);
      const suffix = reference.slice(resource.length);
      return `](${path.relative(destination, localTarget).split(path.sep).join('/')}${suffix})`;
    }
    const relative = path.relative(sourceRoot, absolute).split(path.sep).join('/');
    // A source-root boundary alone would still allow a malicious Markdown link
    // to copy adjacent repository credentials into a distributable snapshot.
    if (!/^(?:docs|assets|skills)\//.test(relative) || isLocalOnlySourcePath(relative) || /(?:^|\/)(?:info|dist)(?:\/|$)/.test(relative)) throw new Error(`external skill reference is not public documentation: ${reference}`);
    // Reads also verify repository containment and reject symlinked sources.
    const bytes = safeReadSourceFile(sourceRoot, absolute);
    const bundled = path.join(targetDir, 'references', 'ngautopilot-source', relative);
    if (!copied.has(absolute)) {
      copied.add(absolute);
      fs.mkdirSync(path.dirname(bundled), { recursive: true });
      fs.writeFileSync(bundled, absolute.endsWith('.md') ? rewrite(bytes, path.dirname(absolute), path.dirname(bundled)) : fs.readFileSync(absolute));
    }
    const suffix = reference.slice(resource.length);
    return `](${path.relative(destination, bundled).split(path.sep).join('/')}${suffix})`;
  });
  return rewrite(body, sourceDir, targetDir);
}

function collectFiles(directory, prefix, files) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const source = path.join(directory, entry.name);
    const target = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) collectFiles(source, target, files);
    else if (entry.isFile()) files.set(target, fs.readFileSync(source));
    else throw new Error(`export resource is not a regular file: ${source}`);
  }
}

function applyExport(output, desired, agent, pack) {
  const guard = createRootGuard(output);
  const read = (relative) => {
    const target = guard.resolve(relative);
    assertNoSymlinkParents(guard, target);
    const stat = fs.lstatSync(target, { throwIfNoEntry: false });
    if (!stat) return undefined;
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`export target is not a regular file: ${relative}`);
    return fs.readFileSync(target);
  };
  const recordBytes = read(RECORD);
  const previous = recordBytes ? JSON.parse(recordBytes.toString('utf8')) : undefined;
  if (previous && (previous.version !== 1 || previous.agent !== agent || !Array.isArray(previous.files))) throw new Error('export record does not match this adapter');
  const owned = new Map((previous?.files ?? []).map(file => [file.path, file.checksum]));
  const warnings = [];
  for (const [relative, bytes] of desired) {
    const current = read(relative);
    if (current && !current.equals(bytes) && sha256(current) !== owned.get(relative)) warnings.push(`refuse to overwrite locally modified or unmanaged export: ${relative}`);
  }
  const removed = [];
  for (const [relative, checksum] of owned) {
    if (desired.has(relative)) continue;
    const current = read(relative);
    if (current && sha256(current) !== checksum) warnings.push(`refuse to remove locally modified export: ${relative}`);
    else if (current) removed.push(relative);
  }
  if (warnings.length) return { ok: false, agent, pack, output, exported: 0, warnings };
  // Validate every destination before the first content write; no force shortcut.
  for (const [relative, bytes] of desired) {
    const target = guard.resolve(relative);
    assertNoSymlinkParents(guard, target);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (!read(relative)?.equals(bytes)) fs.writeFileSync(target, bytes);
  }
  for (const relative of removed) safeRemoveFile(guard, relative);
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(guard.resolve(RECORD), JSON.stringify({ version: 1, agent, pack, files: [...desired].map(([relative, bytes]) => ({ path: relative, checksum: sha256(bytes) })) }, null, 2) + '\n');
  return { ok: true, agent, pack, output, exported: desired.size, warnings: [] };
}
