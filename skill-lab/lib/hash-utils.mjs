import crypto from 'node:crypto';
import fs from 'node:fs';

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function sha256File(filePath) {
  return sha256(fs.readFileSync(filePath));
}

export function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}
