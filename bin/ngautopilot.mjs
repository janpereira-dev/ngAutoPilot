#!/usr/bin/env node
// NgAutoPilot CLI — universal installer, list, doctor, export.
//
// Commands:
//   ngautopilot help
//   ngautopilot list [--json]
//   ngautopilot packs [--json]
//   ngautopilot adapters [--json]
//   ngautopilot install --agent <id> --pack <id> [--scope project|user] [--dry-run] [--yes] [--force] [--json]
//   ngautopilot update --agent <id> [--pack <id>] [--scope project|user] [--dry-run] [--yes] [--force] [--json]
//   ngautopilot uninstall --agent <id> [--scope project|user] [--dry-run] [--yes] [--force] [--json]
//   ngautopilot verify --agent <id> [--scope project|user] [--json]
//   ngautopilot export --agent <id> --pack <id> --output <dir> [--json]
//   ngautopilot doctor
//   ngautopilot backup --agent <id> [--scope project|user] [--json]
//   ngautopilot restore --backup <path> [--agent <id>] [--scope project|user] [--json]
//
// Legacy (kept for compat, delegates to install):
//   ngautopilot init
//   ngautopilot add <skill-id>
//   ngautopilot adapter <name>
//
// All commands use the shared adapter core, planner, and installer engine.
// No shell, no exec, no network. Cross-platform via node:path and safe-fs.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { buildPlan } from '../adapters/_shared/planner.mjs';
import { applyPlan, verifyInstall, uninstall, backup, restore, loadManifest, saveManifest } from '../adapters/_shared/installer.mjs';
import { listAdapters, loadAdapterManifest, createRootGuard, safeWriteFile, safeCopyDirInto, resolveUserRoot, SafeFsError } from '../adapters/_shared/adapter-core.mjs';

const __filename = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(__filename), '..');
const catalogPath = path.join(packageRoot, 'catalog.json');
const adaptersRoot = path.join(packageRoot, 'adapters');
const packsRoot = path.join(packageRoot, 'packs');
const skillsPath = path.join(packageRoot, 'skills');
const agentsPath = path.join(packageRoot, 'agents');

// ── helpers ──────────────────────────────────────────────

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function safeHome() { return process.env.USERPROFILE || process.env.HOME || '/'; }

function resolveScopeRoot(agent, scope, cwd) {
  const manifest = loadAdapterManifest(adaptersRoot, agent);
  if (!manifest.scope.includes(scope)) {
    throw new Error(`Adapter "${agent}" does not support scope "${scope}". Allowed: ${manifest.scope.join(', ')}`);
  }
  if (scope === 'project') return path.resolve(cwd || process.cwd(), manifest.paths.project);
  return resolveUserRoot(manifest.paths.user);
}

function findPack(packId) {
  const file = path.join(packsRoot, `${packId}.json`);
  if (!fs.existsSync(file)) throw new Error(`Pack not found: ${packId}`);
  return file;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) { args[key] = true; }
      else { args[key] = next; i++; }
    } else {
      args._ = args._ || [];
      args._.push(a);
    }
  }
  return args;
}

function jsonOut(obj) { process.stdout.write(JSON.stringify(obj, null, 2) + '\n'); }

// ── commands ─────────────────────────────────────────────

function help() {
  console.log(`
NgAutoPilot — universal skill catalog installer for AI agents

Usage:
  ngautopilot help                          Show this help
  ngautopilot list [--json]                 List all catalog skills
  ngautopilot packs [--json]                List available packs
  ngautopilot adapters [--json]             List available agent adapters
  ngautopilot install                       Install a pack for an agent
    --agent <id>                            Agent adapter id (codex, claude, opencode, ...)
    --pack <id>                             Pack to install (ngautopilot-core, ngautopilot-angular, ...)
    [--scope project|user]                  Install scope (default: project)
    [--dry-run]                             Show what would happen without writing
    [--yes]                                 Skip confirmation prompts
    [--force]                               Overwrite unmanaged files
    [--json]                                Output JSON
  ngautopilot update                        Update an existing installation
    --agent <id>  [--pack <id>]  [--scope project|user]  [--dry-run] [--yes] [--force] [--json]
  ngautopilot uninstall                     Remove managed files for an agent
    --agent <id>  [--scope project|user]  [--dry-run] [--yes] [--force] [--json]
  ngautopilot verify                        Verify installed files match manifest
    --agent <id>  [--scope project|user]  [--json]
  ngautopilot export                        Export a pack snapshot to a directory
    --agent <id>  --pack <id>  --output <dir>  [--json]
  ngautopilot doctor                        Check catalog integrity
  ngautopilot backup                        Backup managed files
    --agent <id>  [--scope project|user]  [--json]
  ngautopilot restore                       Restore from backup
    --backup <path>  [--agent <id>]  [--scope project|user]  [--json]

Legacy (deprecated, delegate to install):
  ngautopilot init                          Copy whole tree to .ngautopilot/ (use 'install' instead)
  ngautopilot add <skill-id>                Copy one skill to .ngautopilot/ (use 'install --pack' instead)
  ngautopilot adapter <name>               Copy one adapter to .ngautopilot/ (use 'install' instead)

Adapters: ${listAdapters(adaptersRoot).join(', ')}
`);
}

function listSkills(args) {
  const catalog = readJson(catalogPath);
  if (args.json) { jsonOut({ count: catalog.skills.length, skills: catalog.skills }); return; }
  for (const s of catalog.skills) console.log(`${s.id} :: ${s.path}`);
}

function listPacks(args) {
  const files = fs.readdirSync(packsRoot).filter(f => f.endsWith('.json')).sort();
  const packs = files.map(f => readJson(path.join(packsRoot, f)));
  if (args.json) { jsonOut({ count: packs.length, packs }); return; }
  for (const p of packs) console.log(`${p.id} :: ${p.name} [${p.status}] — ${p.audience}`);
}

function listAdaptersCmd(args) {
  const ids = listAdapters(adaptersRoot);
  const manifests = ids.map(id => loadAdapterManifest(adaptersRoot, id));
  if (args.json) { jsonOut({ count: manifests.length, adapters: manifests }); return; }
  for (const m of manifests) console.log(`${m.id} :: ${m.name} [${m.status}] scope=${m.scope.join('|')}`);
}

function installCmd(args) {
  const agent = args.agent;
  const packId = args.pack;
  const scope = args.scope || 'project';
  const dryRun = !!args['dry-run'];
  const yes = !!args.yes || dryRun;
  const force = !!args.force;
  if (!agent) throw new Error('--agent is required. Available: ' + listAdapters(adaptersRoot).join(', '));
  if (!packId) throw new Error('--pack is required. Available: ' + fs.readdirSync(packsRoot).filter(f=>f.endsWith('.json')).map(f=>f.replace('.json','')).join(', '));

  const packPath = findPack(packId);
  const plan = buildPlan({ catalogPath, packPath, adaptersRoot, sourceRoot: packageRoot, agent, scope, cwd: process.cwd(), home: safeHome() });

  if (!yes && !args.json) {
    console.log(`Plan: ${plan.files.length} files -> ${plan.installRoot}`);
    console.log(`  create: ${plan.files.filter(f=>f.action==='create').length}`);
    console.log(`  update: ${plan.files.filter(f=>f.action==='update').length}`);
    if (plan.warnings.length) console.log(`  warnings: ${plan.warnings.join('; ')}`);
  }

  const result = applyPlan(plan, { dryRun, force, yes });
  if (args.json) {
    jsonOut({ ok: result.ok, agent, pack: packId, scope, dryRun, created: result.created, updated: result.updated, skipped: result.skipped, warnings: result.warnings });
  } else {
    if (dryRun) console.log(`Dry run: would create ${result.created}, update ${result.updated}, skip ${result.skipped}`);
    else console.log(`Installed ${packId} for ${agent} (${scope}): ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`);
    if (result.warnings.length) for (const w of result.warnings) console.log(`  ⚠ ${w}`);
  }
  if (!result.ok) process.exitCode = 1;
}

function updateCmd(args) {
  const agent = args.agent;
  const scope = args.scope || 'project';
  const dryRun = !!args['dry-run'];
  const force = !!args.force;
  if (!agent) throw new Error('--agent is required');

  const installRoot = resolveScopeRoot(agent, scope, process.cwd());
  const manifest = loadManifest(installRoot);
  if (!manifest) { console.error(`No NgAutoPilot installation found for ${agent} (${scope}) at ${installRoot}`); process.exitCode = 1; return; }

  const plan = buildPlan({ catalogPath, packPath: findPack(manifest.pack || args.pack), adaptersRoot, sourceRoot: packageRoot, agent, scope, cwd: process.cwd(), home: safeHome() });
  const result = applyPlan(plan, { dryRun, force, yes: true });
  if (args.json) jsonOut({ ok: result.ok, agent, scope, dryRun, created: result.created, updated: result.updated, skipped: result.skipped, warnings: result.warnings });
  else console.log(`Updated ${manifest.pack} for ${agent} (${scope}): ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`);
  if (!result.ok) process.exitCode = 1;
}

function uninstallCmd(args) {
  const agent = args.agent;
  const scope = args.scope || 'project';
  const dryRun = !!args['dry-run'];
  const force = !!args.force;
  if (!agent) throw new Error('--agent is required');
  const installRoot = resolveScopeRoot(agent, scope, process.cwd());
  const plan = { installRoot, agent, scope };
  const result = uninstall(plan, { dryRun, force });
  if (args.json) jsonOut({ ok: result.ok, agent, scope, dryRun, removed: result.removed, refused: result.refused, warnings: result.warnings || [] });
  else {
    console.log(`Uninstalled ${agent} (${scope}): ${result.removed.length} removed`);
    if (result.refused.length) for (const r of result.refused) console.log(`  ⚠ refused: ${r.path} — ${r.reason || r}`);
  }
  if (!result.ok) process.exitCode = 1;
}

function verifyCmd(args) {
  const agent = args.agent;
  const scope = args.scope || 'project';
  if (!agent) throw new Error('--agent is required');
  const installRoot = resolveScopeRoot(agent, scope, process.cwd());
  const plan = { installRoot, agent, scope };
  const result = verifyInstall(plan);
  if (args.json) jsonOut(result);
  else {
    console.log(`Verify ${agent} (${scope}): ${result.ok ? 'PASS' : 'FAIL'}`);
    console.log(`  verified: ${result.verifiedFiles.length}`);
    if (result.missingFiles.length) console.log(`  missing: ${result.missingFiles.join(', ')}`);
    if (result.hashMismatches.length) console.log(`  mismatches: ${result.hashMismatches.join(', ')}`);
  }
  if (!result.ok) process.exitCode = 1;
}

function exportCmd(args) {
  const agent = args.agent;
  const packId = args.pack;
  const output = args.output;
  if (!agent) throw new Error('--agent is required');
  if (!packId) throw new Error('--pack is required');
  if (!output) throw new Error('--output is required');

  const packPath = findPack(packId);
  const plan = buildPlan({ catalogPath, packPath, adaptersRoot, sourceRoot: packageRoot, agent, scope: 'project', cwd: output, home: output });
  // Override install root to the output dir.
  const manifest = loadAdapterManifest(adaptersRoot, agent);
  const outRoot = path.resolve(output);
  fs.mkdirSync(outRoot, { recursive: true });
  const guardRoot = createRootGuard(outRoot);
  let count = 0;
  for (const file of plan.files) {
    if (!file.source || !fs.existsSync(file.source)) continue;
    const content = fs.readFileSync(file.source, 'utf8');
    safeWriteFile(guardRoot, file.path, content);
    count++;
  }
  // Write a README with install instructions.
  const readme = `# NgAutoPilot Export — ${agent} / ${packId}

This directory contains ${count} files exported from NgAutoPilot pack \`${packId}\` for agent \`${agent}\`.

## Install

Copy the contents of this directory into your project's agent configuration directory:
- Codex: \`.codex/\`
- Claude Code: \`.claude/\`
- OpenCode: \`.opencode/\`
- Generic: copy \`skills/\` and the instruction file into your project root.

## Manifest

A \`.ngautopilot-manifest.json\` file records what was exported. Use \`ngautopilot uninstall --agent ${agent}\` (pointing at the target) to cleanly remove these files later.

Generated by ngautopilot ${readJson(path.join(packageRoot, 'package.json')).version}.
`;
  safeWriteFile(guardRoot, 'README.md', readme);
  if (args.json) jsonOut({ ok: true, agent, pack: packId, output: outRoot, exported: count });
  else console.log(`Exported ${count} files to ${outRoot}`);
}

function doctor() {
  const catalog = readJson(catalogPath);
  const missing = catalog.skills.filter(s => !fs.existsSync(path.join(packageRoot, s.path)));
  if (missing.length > 0) {
    console.error('Missing skills:');
    for (const s of missing) console.error(`  - ${s.path}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Catalog OK: ${catalog.skills.length} skills found.`);
  // Check adapters
  const adapters = listAdapters(adaptersRoot);
  if (adapters.length < 10) {
    console.error(`Adapters warning: only ${adapters.length} found (expected 10)`);
  } else {
    console.log(`Adapters OK: ${adapters.length} found.`);
  }
  // Check packs
  const packs = fs.readdirSync(packsRoot).filter(f=>f.endsWith('.json'));
  console.log(`Packs OK: ${packs.length} found.`);
}

function backupCmd(args) {
  const agent = args.agent;
  const scope = args.scope || 'project';
  if (!agent) throw new Error('--agent is required');
  const installRoot = resolveScopeRoot(agent, scope, process.cwd());
  const manifest = loadManifest(installRoot);
  if (!manifest) { console.error(`No installation found for ${agent} (${scope})`); process.exitCode = 1; return; }
  const plan = { installRoot, agent, scope, files: manifest.files.map(f => ({ path: f.path })) };
  const result = backup(plan);
  if (args.json) jsonOut({ ok: result.ok, backupPath: result.backupPath, backedUp: result.backedUp });
  else console.log(`Backup created: ${result.backupPath} (${result.backedUp.length} files)`);
}

function restoreCmd(args) {
  const backupPath = args.backup;
  if (!backupPath) throw new Error('--backup is required');
  let installRoot = null;
  if (args.agent) installRoot = resolveScopeRoot(args.agent, args.scope || 'project', process.cwd());
  const result = restore({ backupPath }, installRoot);
  if (args.json) jsonOut(result);
  else console.log(`Restore: ${result.restoredFiles} files restored (${result.ok ? 'OK' : 'WARNINGS'})`);
  if (!result.ok) process.exitCode = 1;
}

// ── legacy commands ──────────────────────────────────────

function initProject() {
  console.warn('⚠ "init" is deprecated. Use: ngautopilot install --agent generic --pack ngautopilot-core');
  const targetRoot = path.join(process.cwd(), '.ngautopilot');
  safeCopyDirInto(createRootGuard(targetRoot), skillsPath, 'skills');
  if (fs.existsSync(agentsPath)) safeCopyDirInto(createRootGuard(targetRoot), agentsPath, 'agents');
  safeWriteFile(createRootGuard(targetRoot), 'catalog.json', JSON.stringify(readJson(catalogPath), null, 2) + '\n');
  console.log(`Initialized NgAutoPilot in ${targetRoot}`);
}

// ── dispatch ─────────────────────────────────────────────

try {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  switch (command) {
    case 'help': case '--help': case '-h': case undefined: help(); break;
    case 'list': listSkills(args); break;
    case 'packs': listPacks(args); break;
    case 'adapters': listAdaptersCmd(args); break;
    case 'install': installCmd(args); break;
    case 'update': updateCmd(args); break;
    case 'uninstall': uninstallCmd(args); break;
    case 'verify': verifyCmd(args); break;
    case 'export': exportCmd(args); break;
    case 'doctor': doctor(); break;
    case 'backup': backupCmd(args); break;
    case 'restore': restoreCmd(args); break;
    case 'init': initProject(); break;
    case 'add': throw new Error('"add" is deprecated. Use: ngautopilot install --pack <pack-id>');
    case 'adapter': throw new Error('"adapter" is deprecated. Use: ngautopilot install --agent <agent> --pack <pack-id>');
    default: console.error(`Unknown command: ${command}`); help(); process.exitCode = 1; break;
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}