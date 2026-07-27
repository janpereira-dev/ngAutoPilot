import assert from 'node:assert/strict';
import test from 'node:test';

import { redactSecrets } from '../lib/redaction.mjs';

test('redactSecrets removes credential-shaped values from evidence text', () => {
  const githubToken = `ghp_${'abcdefghijklmnopqrstuvwxyz123456'}`;
  const npmToken = `npm_${'abcdefghijklmnopqrstuvwxyz'}`;
  const redacted = redactSecrets(`token ${githubToken} and ${npmToken}`);

  assert.doesNotMatch(redacted, /ghp_/);
  assert.doesNotMatch(redacted, /npm_/);
  assert.match(redacted, /\[REDACTED_SECRET\]/);
});
