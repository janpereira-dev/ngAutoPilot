import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadPluginConfig } from '../lib/agent-plugins/config.mjs';
import { validateMcpConfig, validatePluginManifest } from '../lib/agent-plugins/manifest.mjs';
import { parseFrontmatter } from '../lib/agent-plugins/pack-resolver.mjs';

const skillNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateAgentPlugins({ root = process.cwd() } = {}) {
  const errors = [];
  const plugins = [];

  for (const definition of loadPluginConfig(path.join(root, 'agent-plugins.config.json')).filter(({ enabled }) => enabled)) {
    const pluginDir = path.join(root, 'agent-plugins', definition.name);
    const manifestPath = path.join(pluginDir, 'plugin.json');
    if (!fs.existsSync(manifestPath)) {
      errors.push(`${definition.name}: missing plugin.json`);
      continue;
    }
    for (const error of validatePluginManifest(readJson(manifestPath))) errors.push(`${definition.name}: ${error}`);

    const skillsDir = path.join(pluginDir, 'skills');
    if (definition.kind === 'skills') {
      if (!fs.statSync(skillsDir, { throwIfNoEntry: false })?.isDirectory()) {
        errors.push(`${definition.name}: missing skills directory`);
      } else {
        validateSkills(skillsDir, definition.name, errors);
      }
    }

    const mcpPath = path.join(pluginDir, 'mcp.json');
    if (fs.existsSync(mcpPath)) {
      for (const error of validateMcpConfig(readJson(mcpPath))) errors.push(`${definition.name}: ${error}`);
    }
    plugins.push(definition.name);
  }

  return { errors, plugins };
}

function validateSkills(skillsDir, pluginName, errors) {
  const names = new Set();
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      errors.push(`${pluginName}: skill must be a directory: ${entry.name}`);
      continue;
    }
    const skillPath = path.join(skillsDir, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      errors.push(`${pluginName}: missing SKILL.md: ${entry.name}`);
      continue;
    }
    const frontmatter = parseFrontmatter(fs.readFileSync(skillPath, 'utf8'));
    if (!skillNamePattern.test(frontmatter.name ?? '') || frontmatter.name !== entry.name || (frontmatter.description ?? '').length === 0) {
      errors.push(`${pluginName}: invalid Agent Skill: ${entry.name}`);
    }
    if (names.has(entry.name)) errors.push(`${pluginName}: duplicate skill: ${entry.name}`);
    names.add(entry.name);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validateAgentPlugins();
  if (result.errors.length) {
    console.error(`Agent Plugins validation failed:\n${result.errors.map((error) => `- ${error}`).join('\n')}`);
    process.exit(1);
  }
  console.log(`Agent Plugins validation passed for ${result.plugins.length} plugins.`);
}
