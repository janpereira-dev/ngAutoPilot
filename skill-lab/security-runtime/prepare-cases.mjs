import fs from 'node:fs';
import path from 'node:path';
import { npmAt } from './dependencies.mjs';

for (const id of ['runtime-before', 'runtime-after', 'build-before', 'build-after']) {
  const target = path.join('.cache', 'projects', id);
  for (const directory of ['.cache', '.cache/projects', target]) {
    if (fs.lstatSync(directory, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error('Linked lab cache is not allowed');
    fs.mkdirSync(directory, { recursive: true });
  }
  for (const name of ['package', 'package-lock']) {
    fs.copyFileSync(`cases/${id}/${name}.fixture.json`, `${target}/${name}.json`);
  }
  const result = await npmAt(target, ['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--registry', 'https://registry.npmjs.org']);
  if (result.exitCode !== 0) throw new Error(`Cannot prepare ${id}: ${result.stderr}`);
  console.log(`Prepared isolated ${id}`);
}
