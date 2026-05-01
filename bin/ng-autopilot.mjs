#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(__filename), '..');
const catalogPath = path.join(packageRoot, 'catalog.json');
const adaptersPath = path.join(packageRoot, 'adapters');
const skillsPath = path.join(packageRoot, 'skills');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyRecursive(source, target) {
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    ensureDir(target);
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  ensureDir(path.dirname(target));
  fs.copyFileSync(source, target);
}

function help() {
  console.log(`
NgAutoPilot

Usage:
  ng-autopilot help
  ng-autopilot list
  ng-autopilot init
  ng-autopilot add <skill-id>
  ng-autopilot adapter <codex|copilot|claude|cursor|gemini|generic>
  ng-autopilot doctor

Examples:
  ng-autopilot list
  ng-autopilot init
  ng-autopilot add angular.performance.onpush-change-detection
  ng-autopilot adapter codex
`);
}

function listSkills() {
  const catalog = readJson(catalogPath);
  for (const skill of catalog.skills) {
    console.log(`${skill.id} :: ${skill.path}`);
  }
}

function initProject() {
  const targetRoot = path.join(process.cwd(), '.ng-autopilot');
  copyRecursive(skillsPath, path.join(targetRoot, 'skills'));
  copyRecursive(adaptersPath, path.join(targetRoot, 'adapters'));
  copyRecursive(catalogPath, path.join(targetRoot, 'catalog.json'));
  console.log(`Initialized NgAutoPilot in ${targetRoot}`);
}

function addSkill(skillId) {
  if (!skillId) {
    throw new Error('Missing skill id. Example: ng-autopilot add angular.performance.onpush-change-detection');
  }

  const catalog = readJson(catalogPath);
  const skill = catalog.skills.find((item) => item.id === skillId);

  if (!skill) {
    throw new Error(`Skill not found: ${skillId}`);
  }

  const source = path.join(packageRoot, skill.path);
  const target = path.join(process.cwd(), '.ng-autopilot', skill.path);
  copyRecursive(source, target);
  console.log(`Installed skill: ${skill.id}`);
}

function addAdapter(adapterName) {
  if (!adapterName) {
    throw new Error('Missing adapter name. Example: ng-autopilot adapter codex');
  }

  const allowed = new Set(['codex', 'copilot', 'claude', 'cursor', 'gemini', 'generic']);
  if (!allowed.has(adapterName)) {
    throw new Error(`Unsupported adapter: ${adapterName}`);
  }

  const source = path.join(adaptersPath, adapterName);
  const target = path.join(process.cwd(), '.ng-autopilot', 'adapters', adapterName);
  copyRecursive(source, target);
  console.log(`Installed adapter: ${adapterName}`);
}

function doctor() {
  const catalog = readJson(catalogPath);
  const missing = catalog.skills.filter((skill) => !fs.existsSync(path.join(packageRoot, skill.path)));

  if (missing.length > 0) {
    console.error('Missing skills:');
    for (const skill of missing) {
      console.error(`- ${skill.path}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Catalog OK: ${catalog.skills.length} skills found.`);
}

try {
  const [command, arg] = process.argv.slice(2);

  switch (command) {
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      help();
      break;
    case 'list':
      listSkills();
      break;
    case 'init':
      initProject();
      break;
    case 'add':
      addSkill(arg);
      break;
    case 'adapter':
      addAdapter(arg);
      break;
    case 'doctor':
      doctor();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      help();
      process.exitCode = 1;
      break;
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
