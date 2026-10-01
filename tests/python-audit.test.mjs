import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Python audit preserves declarations, forbids source builds, cleans temporary input and propagates failure', () => {
  const result = spawnSync('python', ['-c', `
import os, pathlib, runpy, tomllib, types
scope = runpy.run_path('scripts/audit-python-dependencies.py')
observed = {}
def audit(command, **kwargs):
    assert command[1:4] == ['-m', 'pip_audit', '--strict']
    assert '--fix' not in command
    assert kwargs['env']['PIP_ONLY_BINARY'] == ':all:'
    assert kwargs['check'] is False
    requirements = pathlib.Path(command[command.index('-r') + 1])
    declared = tomllib.loads(pathlib.Path('skill-lab/python/pyproject.toml').read_text())['project']['dependencies']
    assert requirements.read_text().splitlines() == declared
    observed['requirements'] = requirements
    assert pathlib.Path(command[-1]) == pathlib.Path.cwd() / 'dist/security/python-dependency-audit.json'
    return types.SimpleNamespace(returncode=17)
scope['subprocess'].run = audit
previous = os.environ.get('PIP_ONLY_BINARY')
assert scope['main']() == 17
assert not observed['requirements'].exists()
assert os.environ.get('PIP_ONLY_BINARY') == previous
`], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
