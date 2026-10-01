import assert from 'node:assert/strict';
import test from 'node:test';
import { packResult, verifyReleaseTag, integrity, publicationDecision, canPromoteLatest } from '../lib/release-publication.mjs';

test('accepts npm 11 array and npm 12 named pack inventories', () => {
  const value = { name: 'ngautopilot', version: '0.10.0', filename: 'ngautopilot-0.10.0.tgz', files: [] };
  assert.equal(packResult([value], value.name), value);
  assert.equal(packResult({ ngautopilot: value }, value.name), value);
  assert.throws(() => packResult({ ngautopilot: { ...value, filename: '../outside.tgz' } }, value.name));
});
test('release tags bind exactly to the stable package version', () => {
  verifyReleaseTag('0.10.0', 'v0.10.0');
  for (const tag of ['main', 'v0.9.0', 'v0.10.0-rc.1']) assert.throws(() => verifyReleaseTag('0.10.0', tag));
});

test('actual npm member inventory rejects private and escaping files but permits public examples', () => {
  const value = { name: 'ngautopilot', version: '0.10.0', filename: 'ngautopilot-0.10.0.tgz', files: [] };
  for (const path of ['skills/example/.env', 'docs/capture.private.json', '.git/config', '../outside', 'skills\\outside']) {
    assert.throws(() => packResult([{ ...value, files: [{ path }] }], value.name), path);
  }
  assert.doesNotThrow(() => packResult([{ ...value, files: [{ path: 'skills/example/.env.example' }] }], value.name));
});
test('retry only accepts identical immutable archive bytes', () => {
  const digest = integrity(Buffer.from('reviewed bytes'));
  assert.equal(publicationDecision(digest, undefined), 'publish');
  assert.equal(publicationDecision(digest, digest), 'already-published');
  assert.throws(() => publicationDecision(digest, integrity(Buffer.from('changed bytes'))));
});
test('latest promotion never moves backward or guesses prerelease semantics', () => {
  assert.equal(canPromoteLatest('0.10.0', '0.9.0'), true);
  assert.equal(canPromoteLatest('0.10.0', '0.10.0'), true);
  assert.equal(canPromoteLatest('0.10.0', '0.11.0'), false);
  assert.throws(() => canPromoteLatest('0.10.0', '0.11.0-rc.1'));
});
