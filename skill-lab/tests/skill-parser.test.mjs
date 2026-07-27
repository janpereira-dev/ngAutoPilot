import assert from 'node:assert/strict';
import test from 'node:test';

import { validateSkillStructure } from '../lib/skill-parser.mjs';

test('validateSkillStructure requires exact Markdown section headings', () => {
  const content = [
    '---',
    'id: demo.skill',
    'name: Demo Skill',
    '---',
    '# Demo Skill',
    '## Purpose',
    'Text',
    '## When to Use',
    'Text',
    '## Do Not',
    'Text',
    '## Review Checklist',
    'Text',
    '## Expected Output',
    'Text',
  ].join('\n');

  const result = validateSkillStructure(content);

  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ['missing section "## Do"']);
});
