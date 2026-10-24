import { syncNpxSkills } from '../lib/npx-skills.mjs';

const result = syncNpxSkills();
console.log(`Synced ${result.bundles} public npx skills gateways.`);
