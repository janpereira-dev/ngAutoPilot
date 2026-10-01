#!/usr/bin/env node
// NgAutoPilot CLI — universal installer, list, doctor, export.
//
// Commands:
//   ngautopilot help
//   ngautopilot list [--json]
//   ngautopilot packs [--json]
//   ngautopilot adapters [--json]
//   ngautopilot angular [--target <major[.minor]>] [--profile <profile>] [--capabilities <comma-list>] [--json]
//   ngautopilot platform [--json]
//   ngautopilot quality [--json]
//   ngautopilot install --agent <id> (--pack <id> | --angular <major[.minor]> --profile <name>) [--scope project|user] [--dry-run] [--yes] [--force] [--json]
//   ngautopilot update --agent <id> [--pack <id>] [--scope project|user] [--dry-run] [--yes] [--force] [--json]
//   ngautopilot uninstall --agent <id> [--scope project|user] [--dry-run] [--yes] [--force] [--json]
//   ngautopilot verify --agent <id> [--scope project|user] [--json]
//   ngautopilot export --agent <id> --pack <id> --output <dir> [--json]
//   ngautopilot doctor
//   ngautopilot backup --agent <id> [--scope project|user] [--json]
//   ngautopilot restore --backup <path> [--agent <id>] [--scope project|user] [--json]
//   ngautopilot migrate setup --from <major> --to <major> --agent <id> [--yes] [--dry-run] [--json]
//   ngautopilot migrador --from <major> --to <major> --agent <id> [--yes] [--dry-run] [--json]
//   ngautopilot work plan --goal <text> [--agent <id>] [--yes] [--dry-run] [--json]
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

import { exportAdapter } from '../adapters/_shared/exporter.mjs';
import { buildPlan } from '../adapters/_shared/planner.mjs';
import { resolveProjectRoot } from '../adapters/_shared/install-roots.mjs';
import { applyPlan, verifyInstall, uninstall, backup, restore, loadManifest, saveManifest } from '../adapters/_shared/installer.mjs';
import { listAdapters, loadAdapterManifest, createRootGuard, safeWriteFile, safeCopyDirInto, resolveUserRoot, SafeFsError } from '../adapters/_shared/adapter-core.mjs';
import { catalogQuality, platformInventory, resolveAngularInstallation, resolveAngularProjectRoot } from '../lib/agent-plugins/repository.mjs';
import { createMigrationPlan, writeMigrationPlan } from '../lib/migration-plan.mjs';
import { runMigration, resumeMigration } from '../lib/migration-runner.mjs';
import { createWorkPlan, writeWorkPlan } from '../lib/work-plan.mjs';

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
  if (manifest.outputPaths?.[scope]) {
    return scope === 'project'
      ? resolveProjectRoot(cwd || process.cwd())
      : path.resolve(safeHome());
  }
  if (scope === 'project') return path.resolve(cwd || process.cwd(), manifest.paths.project);
  return resolveUserRoot(manifest.paths.user);
}

function loadInstallationManifest(agent, installRoot) {
  const manifest = loadManifest(installRoot);
  if (manifest || agent !== 'codex') return manifest;
  const legacyRoot = path.join(installRoot, '.codex');
  if (fs.existsSync(legacyRoot) && fs.lstatSync(legacyRoot).isSymbolicLink()) return null;
  return loadManifest(legacyRoot);
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
  ngautopilot angular                        Resolve compatible packs and skills for the Angular project in the current directory
    [--target <major[.minor]>]               Require matching Angular target evidence
    [--profile <profile>]                    core, essentials, architecture, performance, testing, or migration (default: core)
    [--capabilities <comma-list>]            foundations, runtime, state, testing, ui
    [--json]                                 Output the full evidence-backed resolution
  ngautopilot platform [--json]             Inspect catalog, Angular coverage, adapters, subagents, and distribution surfaces
  ngautopilot quality [--json]              Inspect deterministic content signals; not a semantic-quality claim
  ngautopilot install                       Install a pack for an agent
    --agent <id>                            Agent adapter id (codex, claude, opencode, ...)
    --pack <id>                             Pack to install (ngautopilot-core, ngautopilot-angular, ...)
    --angular <major[.minor]>                Resolve installed Angular evidence (cannot be combined with --pack)
    --profile <name>                         Angular profile: essentials, architecture, performance, testing, migration, core
    [--capabilities a,b]                     Additional supported Angular capabilities
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
  ngautopilot migrate setup                 Prepare an approved Angular major-hop plan; does not migrate code
    --from <major>  --to <major>  --agent <id>  [--yes] [--dry-run] [--json]
  ngautopilot migrate run                   Validate one approved hop and persist its execution gate
    --plan <path>  --agent <id>  [--yes] [--json]
  ngautopilot migrate resume                 Re-check a persisted migration gate; never skips a block
    --run <id>  --agent <id>  [--plan <path>] [--yes] [--json]
  ngautopilot migrador                      Alias for migrate setup
  ngautopilot work plan                      Prepare a bounded, read-only work assignment
    --goal <text>  [--agent <id>] [--yes] [--dry-run] [--json]

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

function angularCmd(args) {
  const capabilities = args.capabilities
    ? String(args.capabilities).split(',').map((capability) => capability.trim()).filter(Boolean)
    : [];
  const result = resolveAngularInstallation({
    root: packageRoot,
    projectRoot: process.cwd(),
    target: args.target,
    profile: args.profile || 'core',
    capabilities,
  });
  if (args.json) { jsonOut(result); return; }
  console.log(`Angular evidence ${result.evidence.angular.version} (${result.validation.level}); effective target Angular ${formatAngularTarget(result.target)} -> profile ${result.profile}`);
  console.log(`Selection source packs: ${result.selection.sourcePacks.map(({ id }) => id).join(', ') || 'none'}`);
  console.log(`Compatible skills: ${result.included.filter(({ type }) => type === 'skill').length}`);
  console.log(`Excluded skills: ${result.excluded.filter(({ type }) => type === 'skill').length}`);
  console.log(result.selection.reason);
  console.log('No migration hop is installed by this command. Use upgrade.plan or an explicit ngautopilot-angular-<from>-to-<to> pack for a bounded upgrade.');
}

function platformCmd(args) {
  const result = platformInventory(packageRoot);
  if (args.json) { jsonOut(result); return; }
  console.log(`NgAutoPilot ${result.version}: ${result.skills.count} skills, ${result.packs.count} packs, ${result.adapters.length} adapters, ${result.subagents.length} subagents.`);
  console.log(`Angular upgrade hops: ${result.angular.upgradeHops.map(({ from, to }) => `${from}->${to}`).join(', ')}`);
  console.log(`Distribution: ${formatDistribution('Claude', result.distribution.claudeMarketplace)}, ${formatDistribution('Codex', result.distribution.codexMarketplace)}, ${formatDistribution('OpenAI', result.distribution.openaiPackage)}, ${formatDistribution('MCP', result.distribution.mcpServer)}`);
}

function formatDistribution(name, distribution) {
  const location = distribution.manifest ?? distribution.entry ?? distribution.plugin ?? 'unspecified';
  return `${name}=${distribution.availability} (${location})`;
}

function formatAngularTarget(target) {
  return target.minor === undefined ? String(target.major) : `${target.major}.${target.minor}`;
}

function qualityCmd(args) {
  const result = catalogQuality(packageRoot);
  if (args.json) { jsonOut(result); return; }
  console.log(`Content signals: ${result.summary.skillCount} skills, ${result.summary.totalWords} words, ${result.summary.reviewNeededCount} requiring structural review.`);
  console.log(result.semanticEvaluation);
}

function installCmd(args) {
  const agent = args.agent;
  const packId = args.pack;
  const scope = args.scope || 'project';
  const dryRun = !!args['dry-run'];
  const yes = !!args.yes || dryRun;
  const force = !!args.force;
  if (!agent) throw new Error('--agent is required. Available: ' + listAdapters(adaptersRoot).join(', '));
  if (packId && args.angular) throw new Error('--pack and --angular are mutually exclusive; choose one installation selection method');
  if (!packId && !args.angular) throw new Error('--pack or --angular is required');
  if (!args.angular && (args.profile || args.capabilities)) throw new Error('--profile and --capabilities require --angular');

  const selection = args.angular ? resolveAngularSelection(args) : undefined;
  const plan = selection
    ? buildAngularPlan({ agent, scope, selection })
    : buildPlan({ catalogPath, packPath: findPack(packId), adaptersRoot, sourceRoot: packageRoot, agent, scope, cwd: process.cwd(), home: safeHome() });

  if (!yes && !args.json) {
    console.log(`Plan: ${plan.files.length} files -> ${plan.installRoot}`);
    console.log(`  create: ${plan.files.filter(f=>f.action==='create').length}`);
    console.log(`  update: ${plan.files.filter(f=>f.action==='update').length}`);
    if (plan.warnings.length) console.log(`  warnings: ${plan.warnings.join('; ')}`);
  }

  if (!yes) return requireApproval(args, { agent, pack: plan.pack, scope, ...(selection ? { selection } : {}) });
  const result = applyPlan(plan, { dryRun, force });
  if (args.json) {
    jsonOut({ ok: result.ok, agent, pack: plan.pack, scope, dryRun, created: result.created, updated: result.updated, skipped: result.skipped, warnings: result.warnings, ...(selection ? { selection } : {}) });
  } else {
    if (dryRun) console.log(`Dry run: would create ${result.created}, update ${result.updated}, skip ${result.skipped}`);
    else console.log(`Installed ${plan.pack} for ${agent} (${scope}): ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`);
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
  const manifest = loadInstallationManifest(agent, installRoot);
  if (!manifest) { console.error(`No NgAutoPilot installation found for ${agent} (${scope}) at ${installRoot}`); process.exitCode = 1; return; }

  if (manifest.angularSelection && args.pack) throw new Error('this installation uses an Angular selection; rerun update without --pack to preserve it');
  const selection = manifest.angularSelection ? resolveAngularSelection({
    angular: formatAngularTarget(manifest.angularSelection.target),
    profile: manifest.angularSelection.profile,
    ...(manifest.angularSelection.capabilities.length ? { capabilities: manifest.angularSelection.capabilities.join(',') } : {}),
  }) : undefined;
  const plan = selection
    ? buildAngularPlan({ agent, scope, selection })
    : buildPlan({ catalogPath, packPath: findPack(args.pack || manifest.pack), adaptersRoot, sourceRoot: packageRoot, agent, scope, cwd: process.cwd(), home: safeHome() });
  if (!args.yes && !dryRun) return requireApproval(args, { agent, pack: plan.pack, scope, ...(selection ? { selection } : {}) });
  const result = applyPlan(plan, { dryRun, force });
  if (args.json) jsonOut({ ok: result.ok, agent, pack: plan.pack, scope, dryRun, created: result.created, updated: result.updated, skipped: result.skipped, warnings: result.warnings, ...(selection ? { selection } : {}) });
  else console.log(`Updated ${plan.pack} for ${agent} (${scope}): ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`);
  if (!result.ok) process.exitCode = 1;
}

function resolveAngularSelection(args) {
  if (!args.profile || typeof args.profile !== 'string') throw new Error('--profile is required with --angular');
  const capabilities = parseCapabilities(args.capabilities);
  return resolveAngularInstallation({ root: packageRoot, projectRoot: process.cwd(), target: args.angular, profile: args.profile, capabilities });
}

function parseCapabilities(value) {
  if (value === undefined) return [];
  if (typeof value !== 'string' || !value.trim()) throw new Error('--capabilities must be a comma-separated list');
  const capabilities = value.split(',').map((item) => item.trim());
  if (capabilities.some((item) => !item)) throw new Error('--capabilities must not contain empty values');
  return capabilities;
}

function buildAngularPlan({ agent, scope, selection }) {
  const packIds = selection.selection.sourcePacks.map(pack => pack.id);
  if (!packIds.length) throw new Error('Angular selection has no source packs');
  const selectedSkillIds = selection.included.filter(item => item.type === 'skill').map(item => item.id);
  const plans = packIds.map((packId) => buildPlan({ catalogPath, packPath: findPack(packId), adaptersRoot, sourceRoot: packageRoot, agent, scope, cwd: process.cwd(), home: safeHome(), selectedSkillIds }));
  const base = plans.at(0);
  const files = [...new Map(plans.flatMap((plan) => plan.files)
    .sort((left, right) => left.path.localeCompare(right.path))
    .map((file) => [file.path, file])).values()];
  return {
    ...base,
    pack: 'angular-selection',
    files,
    warnings: [...new Set(plans.flatMap((plan) => plan.warnings))].sort(),
    angularSelection: {
      target: selection.target,
      profile: selection.profile,
      capabilities: selection.capabilities,
    },
  };
}

function requireApproval(args, details) {
  if (args.json) jsonOut({ ok: false, status: 'approval-required', ...details });
  else console.log('No files were changed. Inspect with --dry-run, then rerun with --yes to approve.');
  process.exitCode = 1;
}

function uninstallCmd(args) {
  const agent = args.agent;
  const scope = args.scope || 'project';
  const dryRun = !!args['dry-run'];
  const force = !!args.force;
  if (!agent) throw new Error('--agent is required');
  const installRoot = resolveScopeRoot(agent, scope, process.cwd());
  const plan = { installRoot, agent, scope };
  if (!args.yes && !dryRun) return requireApproval(args, { agent, scope });
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

  const result = exportAdapter({ sourceRoot: packageRoot, agent, packId, output });
  if (args.json) jsonOut(result);
  else {
    console.log(result.ok ? `Exported ${result.exported} files to ${result.output}` : 'Export refused: local files need review.');
    for (const warning of result.warnings) console.error(warning);
  }
  if (!result.ok) process.exitCode = 1;
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
  const manifest = loadInstallationManifest(agent, installRoot);
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

function migrateCmd(args) {
  if (args._?.[0] === 'run') return migrationRunCmd(args);
  if (args._?.[0] === 'resume') return migrationResumeCmd(args);
  if (args._?.[0] !== 'setup') throw new Error('migrate setup, run, or resume is required');
  migrationSetupCmd(args);
}

function migrationRunCmd(args) {
  if (!args.agent) throw new Error('--agent is required');
  const result = runMigration({ projectRoot: resolveAngularProjectRoot(process.cwd()), planPath: args.plan, agent: args.agent, approved: !!args.yes });
  if (args.json) jsonOut(result); else console.log(result.status === 'blocked' ? `Migration checkpoint blocked: ${result.reason.message}` : result.status);
  if (!result.ok) process.exitCode = 1;
}

function migrationResumeCmd(args) {
  if (!args.agent) throw new Error('--agent is required');
  if (!args.run) throw new Error('--run is required');
  const result = resumeMigration({ projectRoot: resolveAngularProjectRoot(process.cwd()), runId: args.run, planPath: args.plan, agent: args.agent, approved: !!args.yes });
  if (args.json) jsonOut(result); else console.log(`${result.status}: ${result.reason.message}`);
  if (!result.ok) process.exitCode = 1;
}

function migrationSetupCmd(args) {
  if (!args.agent) throw new Error('--agent is required');
  if (!args.from || !args.to) throw new Error('--from and --to are required');
  loadAdapterManifest(adaptersRoot, args.agent);
  const plan = createMigrationPlan({ repositoryRoot: packageRoot, projectRoot: process.cwd(), from: args.from, to: args.to, agent: args.agent });
  const dryRun = !!args['dry-run'];
  const approved = !!args.yes;
  if (!approved) {
    if (args.json) jsonOut({ ok: false, status: 'approval-required', plan });
    else console.log(`Migration plan ${plan.from}->${plan.to} is pending approval. Re-run with --yes to write ${plan.output.path}.`);
    process.exitCode = 1;
    return;
  }
  if (dryRun) {
    if (args.json) jsonOut({ ok: true, status: 'dry-run', plan });
    else console.log(`Dry run: would write ${plan.output.path}; no files were changed.`);
    return;
  }
  const output = writeMigrationPlan(plan);
  if (args.json) jsonOut({ ok: true, status: 'planned', plan, output });
  else console.log(`Migration plan written to ${output.path}. It is pending and does not execute migrations.`);
}

function workCmd(args) {
  if (args._?.[0] !== 'plan') throw new Error('work plan is required');
  const plan = createWorkPlan({
    repositoryRoot: packageRoot,
    projectRoot: process.cwd(),
    goal: args.goal,
    agent: args.agent,
    validateAgent: (agent) => loadAdapterManifest(adaptersRoot, agent),
  });
  if (!args.yes) {
    if (args.json) jsonOut({ ok: false, status: 'approval-required', plan });
    else console.log(`Work plan is pending approval. Re-run with --yes to write ${plan.output.path}.`);
    process.exitCode = 1;
    return;
  }
  if (args['dry-run']) {
    if (args.json) jsonOut({ ok: true, status: 'dry-run', plan });
    else console.log(`Dry run: would write ${plan.output.path}; no files were changed.`);
    return;
  }
  const output = writeWorkPlan(plan);
  if (args.json) jsonOut({ ok: true, status: 'planned', plan, output });
  else console.log(`Work plan written to ${output.path}. It is pending and does not execute the goal.`);
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
    case 'angular': angularCmd(args); break;
    case 'platform': platformCmd(args); break;
    case 'quality': qualityCmd(args); break;
    case 'install': installCmd(args); break;
    case 'update': updateCmd(args); break;
    case 'uninstall': uninstallCmd(args); break;
    case 'verify': verifyCmd(args); break;
    case 'export': exportCmd(args); break;
    case 'doctor': doctor(); break;
    case 'backup': backupCmd(args); break;
    case 'restore': restoreCmd(args); break;
    case 'migrate': migrateCmd(args); break;
    case 'migrador': migrationSetupCmd(args); break;
    case 'work': workCmd(args); break;
    case 'init': initProject(); break;
    case 'add': throw new Error('"add" is deprecated. Use: ngautopilot install --pack <pack-id>');
    case 'adapter': throw new Error('"adapter" is deprecated. Use: ngautopilot install --agent <agent> --pack <pack-id>');
    default: console.error(`Unknown command: ${command}`); help(); process.exitCode = 1; break;
  }
} catch (error) {
  if (process.argv.includes('--json')) jsonOut({ ok: false, status: error.message?.includes('approval') ? 'approval-required' : 'failed', reason: { code: String(error.message).split(':', 1)[0], message: error.message } });
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
