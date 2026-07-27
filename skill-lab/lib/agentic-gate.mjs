import fs from 'node:fs';
import path from 'node:path';

import { assertInsideLab } from './sandbox.mjs';

const ALLOWED_HARNESSES = new Set(['codex', 'claude', 'opencode', 'direct-chat']);

export function runAgenticGate({ runRoot, harness, evidencePath }) {
  if (!ALLOWED_HARNESSES.has(harness)) {
    return rejection(`Unsupported harness: ${harness}`);
  }

  const labRoot = path.resolve('skill-lab');
  const safeRunRoot = assertInsideLab(labRoot, runRoot);
  const evidenceFile = assertInsideLab(labRoot, evidencePath ?? path.join(safeRunRoot, 'agentic', harness, 'evidence.json'));

  if (!fs.existsSync(evidenceFile)) {
    return rejection(`Missing harness evidence: ${path.relative(process.cwd(), evidenceFile).split(path.sep).join('/')}`);
  }

  const evidence = JSON.parse(fs.readFileSync(evidenceFile, 'utf8'));
  const regressions = evidence.regressions ?? [];
  const passed = evidence.harness === harness && evidence.passed === true && regressions.length === 0;

  return {
    status: passed ? 'AGENTIC_GATE_PASSED' : 'AGENTIC_GATE_FAILED',
    passed,
    harness,
    crossHarnessRegressionCount: regressions.length,
    evidence: {
      summary: evidence.summary ?? '',
      file: path.relative(safeRunRoot, evidenceFile).split(path.sep).join('/'),
      candidate: evidence.candidate ?? null,
    },
    regressions,
  };
}

function rejection(reason) {
  return {
    status: 'AGENTIC_GATE_FAILED',
    passed: false,
    reason,
    crossHarnessRegressionCount: 1,
    regressions: [{ reason }],
  };
}
