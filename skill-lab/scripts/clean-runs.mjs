#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const runsRoot = path.resolve('skill-lab', 'runs');

for (const entry of fs.readdirSync(runsRoot, { withFileTypes: true })) {
  if (entry.name === '.gitkeep') continue;
  fs.rmSync(path.join(runsRoot, entry.name), { recursive: true, force: true });
}

console.log('Cleaned skill-lab runs.');
