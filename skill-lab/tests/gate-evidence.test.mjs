import assert from 'node:assert/strict';
import test from 'node:test';

import { changedLinesPercent } from '../lib/gate-evidence.mjs';

test('changedLinesPercent measures small insertions without treating shifted lines as all changed', () => {
  const baseline = Array.from({ length: 100 }, (_, index) => `line ${index}`).join('\n');
  const candidate = ['inserted line', ...Array.from({ length: 100 }, (_, index) => `line ${index}`)].join('\n');

  assert.equal(changedLinesPercent(baseline, candidate), 0.99);
});
