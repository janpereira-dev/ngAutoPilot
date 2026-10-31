import fs from 'node:fs';
import path from 'node:path';

import { assertInsideLab } from './sandbox.mjs';
import { sha256File } from './hash-utils.mjs';

const ALLOWED_HARNESSES = new Set(['codex', 'claude', 'opencode', 'direct-chat']);

export function runAgenticGate({ runRoot, harness, evidencePath }) {
  if (!ALLOWED_HARNESSES.has(harness)) {
    return rejection(`Unsupported harness: ${harness}`);
  }

  const labRoot = path.resolve('skill-lab');
  const safeRunRoot = assertInsideLab(labRoot, runRoot);
  const evidenceFile = assertInsideLab(labRoot, evidencePath ?? path.join(safeRunRoot, 'agentic', harness, 'evidence.json'));
  const candidatePath = path.join(safeRunRoot, 'optimization', 'candidate.SKILL.md');
  const candidateStat = fs.lstatSync(candidatePath, { throwIfNoEntry: false });
  if (!candidateStat?.isFile() || candidateStat.isSymbolicLink()) return rejection('Candidate must exist as a regular file');
  try { assertInsideLab(fs.realpathSync(safeRunRoot), fs.realpathSync(candidatePath)); }
  catch { return rejection('Candidate must remain inside the run directory'); }

  if (!fs.existsSync(evidenceFile)) {
    return rejection(`Missing harness evidence: ${path.relative(process.cwd(), evidenceFile).split(path.sep).join('/')}`);
  }

  let evidence;
  try { evidence = JSON.parse(fs.readFileSync(evidenceFile, 'utf8')); }
  catch { return rejection('Invalid harness evidence JSON'); }
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)
    || !Array.isArray(evidence.regressions) || typeof evidence.candidateHash !== 'string' || !/^[a-f0-9]{64}$/.test(evidence.candidateHash)) {
    return rejection('Invalid harness evidence schema');
  }
  const regressions = evidence.regressions;
  const expectedCandidate = path.relative(process.cwd(), candidatePath).split(path.sep).join('/');
  const expectedCandidateHash = sha256File(candidatePath);
  const candidateMatches = evidence.candidate === expectedCandidate && evidence.candidateHash === expectedCandidateHash;
  const passed = evidence.harness === harness && candidateMatches && evidence.passed === true && regressions.length === 0;

  return {
    status: passed ? 'AGENTIC_GATE_PASSED' : 'AGENTIC_GATE_FAILED',
    passed,
    harness,
    crossHarnessRegressionCount: regressions.length,
    evidence: {
      summary: evidence.summary ?? '',
      file: path.relative(safeRunRoot, evidenceFile).split(path.sep).join('/'),
      candidate: evidence.candidate ?? null,
      candidateHash: evidence.candidateHash ?? null,
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
