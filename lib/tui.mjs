import readline from 'node:readline/promises';
import process from 'node:process';
import { applyPlan, detectInstallation, planInstall, verifyInstallation } from './lifecycle-engine.mjs';

/** @param {string} packageRoot @param {string} workspace */
export async function runTui(packageRoot, workspace) {
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    process.stdout.write('NgAutoPilot distribution console\n1) Inspect installation\n2) Install recommended core pack\n3) Exit\n');
    const answer = (await terminal.question('Select an action: ')).trim();
    if (answer === '1') {
      process.stdout.write(`${JSON.stringify({ detect: detectInstallation(workspace), verify: verifyInstallation(workspace) }, null, 2)}\n`);
      return 0;
    }
    if (answer === '2') {
      const plan = planInstall(packageRoot, workspace, { packs: ['core'] });
      process.stdout.write(`${JSON.stringify(summarizePlan(plan), null, 2)}\n`);
      const confirm = (await terminal.question('Apply this plan? [y/N] ')).trim().toLowerCase();
      if (confirm !== 'y' && confirm !== 'yes') {
        process.stdout.write('No changes applied.\n');
        return 0;
      }
      const result = applyPlan(plan, { yes: true });
      process.stdout.write(`${JSON.stringify({ changed: result.changed, backupId: result.backupId }, null, 2)}\n`);
      return 0;
    }
    process.stdout.write(answer === '3' || answer === '' ? 'No changes applied.\n' : 'Unknown selection; no changes applied.\n');
    return 0;
  } finally {
    terminal.close();
  }
}

/** @param {{action: string, selectedPacks: string[], operations: unknown[], conflicts: string[], warnings: string[]}} plan */
export function summarizePlan(plan) {
  return { action: plan.action, packs: plan.selectedPacks, changes: plan.operations.length, conflicts: plan.conflicts, warnings: plan.warnings };
}
