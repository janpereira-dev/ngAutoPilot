import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSync } from 'esbuild';

import { loadPluginConfig } from '../lib/agent-plugins/config.mjs';
import { buildPluginManifest } from '../lib/agent-plugins/manifest.mjs';
import { MCP_SCHEMA } from '../lib/agent-plugins/manifest.mjs';
import { resolvePackSkills } from '../lib/agent-plugins/pack-resolver.mjs';
import { ensureUniquePortableNames, renderPortableSkill } from '../lib/agent-plugins/portable-skill.mjs';

const descriptions = {
  'ngautopilot-core': 'Core NgAutoPilot workflows for project intake, stack detection, routing, compatibility gates, and risk assessment.',
  'ngautopilot-angular-architecture': 'Focused Angular architecture, component, dependency-boundary, and service-design guidance.',
  'ngautopilot-angular-testing': 'Focused Angular TestBed, component test, visual validation, and test-stability guidance.',
  'ngautopilot-angular-21-to-22': 'Bounded Angular 21 to 22 upgrade preflight, execution, compatibility, and validation guidance.',
  'ngautopilot-tools': 'Read-only NgAutoPilot MCP tools for catalog, pack, compatibility, upgrade, and repository inspection.',
};

export function syncAgentPlugins({ root = process.cwd() } = {}) {
  const config = loadPluginConfig(path.join(root, 'agent-plugins.config.json')).filter(({ enabled }) => enabled);
  const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  const pluginsRoot = path.join(root, 'agent-plugins');
  const reports = [];

  for (const entry of fs.readdirSync(pluginsRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && !config.some(({ name }) => name === entry.name)) {
      fs.rmSync(path.join(pluginsRoot, entry.name), { recursive: true, force: true });
    }
  }

  for (const plugin of config) {
    const pluginDir = path.join(pluginsRoot, plugin.name);
    fs.mkdirSync(pluginDir, { recursive: true });
    fs.copyFileSync(path.join(root, 'LICENSE'), path.join(pluginDir, 'LICENSE'));
    fs.writeFileSync(path.join(pluginDir, 'plugin.json'), `${JSON.stringify(buildPluginManifest({
      name: plugin.name,
      version,
      description: descriptions[plugin.name],
      keywords: ['angular', 'agent-skills', 'developer-tools', 'ngautopilot'],
    }), null, 2)}\n`, 'utf8');

    if (plugin.kind === 'mcp') {
      syncMcpPlugin({ root, pluginDir, version });
      reports.push({ name: plugin.name, kind: plugin.kind, skills: 0 });
      continue;
    }

    const skills = resolvePackSkills({
      catalogPath: path.join(root, 'catalog.json'),
      packsRoot: path.join(root, 'packs'),
      sourceRoot: root,
      packId: plugin.pack,
    });
    const names = ensureUniquePortableNames(skills.map(({ id }) => id), plugin.portableNames);
    const skillsDir = path.join(pluginDir, 'skills');
    fs.rmSync(skillsDir, { recursive: true, force: true });
    fs.mkdirSync(skillsDir, { recursive: true });

    for (const skill of skills) {
      renderPortableSkill({
        sourceDir: path.join(root, path.dirname(skill.path)),
        targetDir: path.join(skillsDir, names.get(skill.id)),
        skill: { ...skill, portableName: names.get(skill.id) },
      });
    }
    reports.push({ name: plugin.name, kind: plugin.kind, skills: skills.length });
  }

  return reports;
}

function syncMcpPlugin({ root, pluginDir, version }) {
  const binDir = path.join(pluginDir, 'bin');
  const dataDir = path.join(pluginDir, 'data');
  const skillDir = path.join(pluginDir, 'skills', 'ngautopilot-tooling');
  fs.rmSync(binDir, { recursive: true, force: true });
  fs.rmSync(path.join(pluginDir, 'skills'), { recursive: true, force: true });
  fs.rmSync(dataDir, { recursive: true, force: true });
  fs.mkdirSync(binDir, { recursive: true });
  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(dataDir, { recursive: true });
  fs.copyFileSync(path.join(root, 'catalog.json'), path.join(dataDir, 'catalog.json'));
  fs.copyFileSync(path.join(root, 'package.json'), path.join(dataDir, 'package.json'));
  fs.copyFileSync(path.join(root, 'package-lock.json'), path.join(dataDir, 'package-lock.json'));
  fs.cpSync(path.join(root, 'packs'), path.join(dataDir, 'packs'), { recursive: true, dereference: false });
  buildSync({
    absWorkingDir: root,
    entryPoints: ['mcp/server-entry.mjs'],
    outfile: path.join(binDir, 'server.mjs'),
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node24',
    minifyWhitespace: true,
    define: { 'process.env.NGAUTOPILOT_VERSION': JSON.stringify(version) },
  });
  const bundlePath = path.join(binDir, 'server.mjs');
  fs.writeFileSync(bundlePath, fs.readFileSync(bundlePath, 'utf8').replace(/[ \t]+\r?\n/g, '\n'), 'utf8');
  fs.writeFileSync(path.join(pluginDir, 'mcp.json'), `${JSON.stringify({
    $schema: MCP_SCHEMA,
    mcpServers: {
      ngautopilot: {
        type: 'stdio',
        command: 'node',
        args: ['\${PLUGIN_ROOT}/bin/server.mjs'],
        cwd: '\${PLUGIN_ROOT}',
      },
    },
  }, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---\nname: ngautopilot-tooling\ndescription: Uses read-only NgAutoPilot MCP tools to inspect catalog skills, packs, stack metadata, compatibility, upgrade hops, and repository consistency. Use when a task needs deterministic NgAutoPilot repository evidence.\nlicense: MIT\nmetadata:\n  ngautopilot-id: "tools.read-only-mcp"\n  ngautopilot-version: "${version}"\n---\n\nUse the ngautopilot MCP server for repository inspection. Tools do not modify repository files, dependencies, or Git state.\n`, 'utf8');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const report of syncAgentPlugins()) console.log(`${report.name}: synced ${report.skills} skills`);
}
