import { loadNativeLayouts } from '../adapters/_shared/exporter.mjs';
const registry = loadNativeLayouts(process.cwd());
const age = Math.floor((Date.now() - Date.parse(`${registry.reviewedOn}T00:00:00Z`)) / 86400000);
if (!Number.isFinite(age) || age < 0) throw new Error('invalid adapter review date');
console.log(`# Quarterly adapter review\n\nDocumentation review: ${registry.reviewedOn} (${age} days ago).\nEvidence level: ${registry.reviewKind}; host invocation: ${registry.hostInvocation}.\n`);
for (const [id, layout] of Object.entries(registry.adapters)) {
  console.log(`## ${id}\n\n- Skills: \`${layout.skills}/<name>/SKILL.md\`\n- Instructions: \`${layout.instructions}\`\n${layout.sources.map(url => `- Primary source: ${url}`).join('\n')}\n- Caveat: ${layout.caveat ?? 'Review precedence, trust, and current host version before installation.'}\n`);
}
console.log('## Reviewer checklist\n\n- Re-read every primary source; record host/documentation versions and changed conventions.\n- Update native-layouts.json and independent export contract assertions together.\n- Run npm run test:scripts and npm test; attach real host discovery/invocation evidence separately.\n- Do not mark host verification complete from export tests.\n- Review legacy install paths and propose a checksum-preserving migration before changing them.\n- Close the tracking issue only after the evidence-linked PR is merged.');
if (process.argv.includes('--check-age') && age > 100) process.exitCode = 1;
