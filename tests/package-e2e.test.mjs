import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmInvocation = process.platform === 'win32'
  ? { command: process.execPath, prefix: [path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')] }
  : { command: 'npm', prefix: [] };

test('packed npm artifact installs Codex files into discoverable paths and serves MCP tools', async (t) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-package-e2e-'));
  const projectDirectory = path.join(temporaryRoot, 'project');
  const userHome = path.join(temporaryRoot, 'home');
  const tarballDirectory = path.join(temporaryRoot, 'tarballs');
  const npmrc = path.join(temporaryRoot, 'npmrc');
  const npmGlobalrc = path.join(temporaryRoot, 'npm-globalrc');
  fs.mkdirSync(projectDirectory, { recursive: true });
  fs.writeFileSync(path.join(projectDirectory, 'package.json'), JSON.stringify({ private: true, allowScripts: [] }) + '\n');
  fs.mkdirSync(userHome, { recursive: true });
  fs.mkdirSync(tarballDirectory, { recursive: true });
  fs.writeFileSync(npmrc, 'registry=https://registry.npmjs.org\n');
  fs.writeFileSync(npmGlobalrc, 'registry=https://registry.npmjs.org\n');
  let client;
  t.after(async () => {
    await client?.close();
    fs.rmSync(temporaryRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  });

  const packed = npmOutput(JSON.parse(runNpm(['pack', '--json', '--pack-destination', tarballDirectory], root, npmrc, npmGlobalrc)));
  assert.equal(packed.length, 1, 'npm pack must produce exactly one tarball');
  const tarball = path.join(tarballDirectory, packed[0].filename);
  assert.ok(fs.existsSync(tarball), 'npm pack did not create the reported tarball');

  runNpm(['install', '--ignore-scripts', '--no-package-lock', '--no-save', '--registry=https://registry.npmjs.org', '--no-audit', '--fund=false', tarball], projectDirectory, npmrc, npmGlobalrc);
  const installedPackage = path.join(projectDirectory, 'node_modules', 'ngautopilot');
  const cli = path.join(installedPackage, 'bin', 'ngautopilot.mjs');
  const mcpEntry = path.join(installedPackage, 'mcp', 'server-entry.mjs');
  assert.ok(fs.existsSync(cli), 'packed CLI is missing');
  assert.ok(fs.existsSync(mcpEntry), 'packed root MCP entry point is missing');

  const isolatedEnvironment = {
    ...process.env,
    HOME: userHome,
    USERPROFILE: userHome,
  };
  const projectInstall = JSON.parse(run(process.execPath, [cli, 'install', '--agent', 'codex', '--pack', 'ngautopilot-core', '--scope', 'project', '--yes', '--json'], projectDirectory, isolatedEnvironment));
  assert.equal(projectInstall.ok, true);
  assert.ok(fs.existsSync(path.join(projectDirectory, '.agents', 'skills')), 'project skills must use Codex .agents/skills discovery');
  assert.ok(fs.existsSync(path.join(projectDirectory, 'AGENTS.md')), 'project instructions must be at the repository root');
  assert.equal(fs.existsSync(path.join(projectDirectory, '.codex', 'skills')), false, 'legacy .codex/skills path must not be used');

  const userInstall = JSON.parse(run(process.execPath, [cli, 'install', '--agent', 'codex', '--pack', 'ngautopilot-core', '--scope', 'user', '--yes', '--json'], projectDirectory, isolatedEnvironment));
  assert.equal(userInstall.ok, true);
  assert.ok(fs.existsSync(path.join(userHome, '.agents', 'skills')), 'user skills must use ~/.agents/skills');
  assert.ok(fs.existsSync(path.join(userHome, '.codex', 'AGENTS.md')), 'user instructions must use ~/.codex/AGENTS.md');

  client = new Client({ name: 'ngautopilot-package-e2e', version: '0.6.0' });
  const transport = new StdioClientTransport({ command: process.execPath, args: [mcpEntry], cwd: projectDirectory });
  await client.connect(transport);

  const catalog = await client.callTool({ name: 'catalog.search', arguments: { query: 'typed forms' } });
  assert.equal(catalog.isError, undefined);
  assert.ok(catalog.content.some((entry) => entry.type === 'text' && entry.text.includes('typed')), 'catalog.search must return matching skills');

  const upgrade = await client.callTool({ name: 'upgrade.plan', arguments: { from: 12, to: 22 } });
  assert.equal(upgrade.isError, undefined);
  assert.ok(upgrade.content.some((entry) => entry.type === 'text' && entry.text.includes('12-to-13')), 'upgrade.plan must resolve ordered upgrade hops');

});

function run(command, args, cwd, env = process.env) {
  return execFileSync(command, args, {
    cwd,
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function runNpm(args, cwd, npmrc, npmGlobalrc) {
  const environment = { ...process.env };
  for (const key of Object.keys(environment)) {
    if (key.toLowerCase() === 'npm_config_allow_scripts') {
      delete environment[key];
    }
  }
  return run(npmInvocation.command, [...npmInvocation.prefix, ...args], cwd, {
    ...environment,
    NPM_CONFIG_USERCONFIG: npmrc,
    NPM_CONFIG_GLOBALCONFIG: npmGlobalrc,
  });
}

function npmOutput(value) {
  return Array.isArray(value) ? value : Object.values(value);
}
