import crypto from 'node:crypto';
import { isLocalOnlySourcePath } from './local-only.mjs';

export function packResult(value, name) {
  const result = Array.isArray(value) ? value[0] : value[name];
  if (!result || result.name !== name || !/^\d+\.\d+\.\d+$/.test(result.version)
    || result.filename !== `${name}-${result.version}.tgz` || !Array.isArray(result.files)) {
    throw new Error('Invalid npm pack inventory');
  }
  for (const file of result.files) {
    if (typeof file.path !== 'string' || file.path.includes('\\') || file.path.startsWith('/')
      || file.path.split('/').some(part => !part || part === '.' || part === '..')
      || isLocalOnlySourcePath(file.path)) throw new Error('npm archive inventory includes an unsafe or private local path');
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
