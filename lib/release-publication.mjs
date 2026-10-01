import crypto from 'node:crypto';

export function packResult(value, name) {
  const result = Array.isArray(value) ? value[0] : value[name];
  if (!result || result.name !== name || !/^\d+\.\d+\.\d+$/.test(result.version)
    || result.filename !== `${name}-${result.version}.tgz` || !Array.isArray(result.files)) {
    throw new Error('Invalid npm pack inventory');
  }
  return result;
}

export function verifyReleaseTag(version, tag) {
  if (!/^\d+\.\d+\.\d+$/.test(version) || tag !== `v${version}`) throw new Error('Release tag must exactly match package version');
}

export function integrity(bytes) {
  return `sha512-${crypto.createHash('sha512').update(bytes).digest('base64')}`;
}

export function publicationDecision(localIntegrity, remoteIntegrity) {
  if (remoteIntegrity === undefined) return 'publish';
  if (remoteIntegrity !== localIntegrity) throw new Error('Existing npm version has different bytes; immutable versions must not be replaced');
  return 'already-published';
}

export function canPromoteLatest(version, current) {
  if (!/^\d+\.\d+\.\d+$/.test(version) || !/^\d+\.\d+\.\d+$/.test(current)) throw new Error('Stable latest versions required');
  const a = version.split('.').map(Number), b = current.split('.').map(Number);
  for (let index = 0; index < 3; index++) if (a[index] !== b[index]) return a[index] > b[index];
  return true;
}
