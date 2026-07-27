import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import { assertInsideLab, resolveInsideLab } from '../lib/sandbox.mjs';

test('resolveInsideLab rejects path traversal outside skill-lab', () => {
  const labRoot = path.resolve('skill-lab');

  assert.equal(resolveInsideLab(labRoot, 'runs/example').startsWith(labRoot), true);
  assert.throws(() => resolveInsideLab(labRoot, '../skills/demo/SKILL.md'), /outside skill-lab/);
  assert.throws(() => assertInsideLab(labRoot, path.resolve('skills/demo/SKILL.md')), /outside skill-lab/);
});
