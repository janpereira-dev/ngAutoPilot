import assert from 'node:assert/strict';
import test from 'node:test';

import { extractFrontmatterBlock, frontmatterIsByteEqual } from '../lib/protected-metadata.mjs';

test('frontmatter comparison detects byte-level metadata changes', () => {
  const baseline = '---\nid: demo.skill\nversion: 0.5.2\n---\n\n# Demo\n';
  const candidate = '---\nid: demo.skill\nversion: 0.5.3\n---\n\n# Demo\n';

  assert.equal(extractFrontmatterBlock(baseline), '---\nid: demo.skill\nversion: 0.5.2\n---');
  assert.equal(frontmatterIsByteEqual(baseline, candidate), false);
  assert.equal(frontmatterIsByteEqual(baseline, baseline.replace('# Demo', '# Improved Demo')), true);
});
