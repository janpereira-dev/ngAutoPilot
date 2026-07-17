import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../scripts/bump-release-version.mjs');

test('updates versioned assets without rewriting changelog history', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-version-bump-'));

  try {
    write(directory, 'package.json', '{"version":"0.5.1"}\n');
    write(directory, 'catalog.json', '{"version":"0.5.1"}\n');
    write(directory, 'skills/example/SKILL.md', 'version: 0.5.1\n');
    write(directory, 'packs/example.json', '{"version":"0.5.1"}\n');
    write(directory, 'CHANGELOG.md', '# Changelog\n\n## 0.5.1 - 2026-07-16\n');

    const result = spawnSync(process.execPath, [scriptPath, '0.5.2'], {
      cwd: directory,
      encoding: 'utf8',
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'), /0\.5\.2/);
    assert.match(fs.readFileSync(path.join(directory, 'skills/example/SKILL.md'), 'utf8'), /0\.5\.2/);
    assert.match(fs.readFileSync(path.join(directory, 'packs/example.json'), 'utf8'), /0\.5\.2/);
    assert.match(fs.readFileSync(path.join(directory, 'CHANGELOG.md'), 'utf8'), /0\.5\.1/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

function write(root, relative, content) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}
