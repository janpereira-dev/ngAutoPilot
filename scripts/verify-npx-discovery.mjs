import fs from 'node:fs';
import { NPX_PUBLIC_SKILL_IDS } from '../lib/npx-skills.mjs';

const source = process.argv[2];
if (!source) throw new Error('usage: node scripts/verify-npx-discovery.mjs <npx-list-output>');
const output = fs.readFileSync(source, 'utf8').replace(/\x1B\[[0-9;]*[A-Za-z]/g, '');
const found = output.match(/\bFound\s+(\d+)\s+skills?\b/i);
if (!found || Number(found[1]) !== NPX_PUBLIC_SKILL_IDS.length) {
  throw new Error(`npx discovery must find ${NPX_PUBLIC_SKILL_IDS.length} public skills, found: ${found?.[1] ?? 'unknown'}\n${output.slice(0,3000)}`);
}
for (const id of NPX_PUBLIC_SKILL_IDS) {
  if (!output.includes(id)) throw new Error(`npx discovery is missing ${id}`);
}
console.log(`npx skills reports exactly ${NPX_PUBLIC_SKILL_IDS.length} public bundles.`);
