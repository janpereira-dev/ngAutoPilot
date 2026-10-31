import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';

const config = path.resolve('.cache', 'npm');
fs.mkdirSync(config, { recursive: true });
for (const name of ['user.npmrc', 'global.npmrc']) fs.writeFileSync(path.join(config, name), '');
const npm = [process.env.npm_execpath,
  path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
  path.join(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
].find((candidate) => candidate && fs.existsSync(candidate));
if (!npm) throw new Error('Run through npm test so npm_execpath is available');

export function npmAt(directory, args) {
  return new Promise((resolve) => execFile(process.execPath, [npm, ...args,
    '--userconfig', path.join(config, 'user.npmrc'), '--globalconfig', path.join(config, 'global.npmrc'),
    '--fetch-retries=0', '--fetch-timeout=5000'], {
    cwd: path.resolve(directory), encoding: 'utf8', timeout: 30_000, maxBuffer: 2_000_000,
    env: { ...process.env, NODE_AUTH_TOKEN: '', NPM_TOKEN: '' },
  }, (error, stdout, stderr) => resolve({
    exitCode: error ? Number.isInteger(error.code) ? error.code : null : 0,
    stdout, stderr, terminated: Boolean(error?.killed),
  })));
}
