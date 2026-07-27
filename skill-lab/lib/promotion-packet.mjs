import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { sha256, sha256File } from './hash-utils.mjs';
import { assertInsideLab } from './sandbox.mjs';

export function generatePromotionPacket({ runRoot }) {
  const labRoot = path.resolve('skill-lab');
  const safeRunRoot = assertInsideLab(labRoot, runRoot);
  const promotionRoot = assertInsideLab(labRoot, path.join(safeRunRoot, 'promotion'));
  const baselinePath = path.join(safeRunRoot, 'baseline.SKILL.md');
  const candidatePath = path.join(safeRunRoot, 'optimization', 'candidate.SKILL.md');
  const gatePath = path.join(safeRunRoot, 'gate', 'gate-report.json');

  for (const required of [baselinePath, candidatePath, gatePath]) {
    if (!fs.existsSync(required)) {
      throw new Error(`Missing promotion input: ${path.relative(process.cwd(), required).split(path.sep).join('/')}`);
    }
  }

  fs.mkdirSync(promotionRoot, { recursive: true });
  const candidate = fs.readFileSync(candidatePath, 'utf8');
  const gateReport = JSON.parse(fs.readFileSync(gatePath, 'utf8'));
  const evidenceSummary = buildEvidenceSummary(safeRunRoot, gateReport);
  const hashes = {
    baseline: sha256File(baselinePath),
    candidate: sha256(candidate),
    gateReport: sha256File(gatePath),
    generatedAt: new Date().toISOString(),
  };

  fs.copyFileSync(candidatePath, path.join(promotionRoot, 'candidate.SKILL.md'));
  fs.copyFileSync(gatePath, path.join(promotionRoot, 'gate-report.json'));
  fs.writeFileSync(path.join(promotionRoot, 'canonical.diff'), canonicalDiff(baselinePath, candidatePath), 'utf8');
  fs.writeFileSync(path.join(promotionRoot, 'evidence-summary.json'), `${JSON.stringify(evidenceSummary, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(promotionRoot, 'hashes.json'), `${JSON.stringify(hashes, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(promotionRoot, 'report.md'), reportMarkdown({ gateReport, evidenceSummary, hashes }), 'utf8');
  fs.writeFileSync(path.join(promotionRoot, 'pr-body.md'), prBodyMarkdown({ gateReport, evidenceSummary }), 'utf8');

  return promotionRoot;
}

function buildEvidenceSummary(runRoot, gateReport) {
  return {
    gateStatus: gateReport.status,
    accepted: gateReport.accepted,
    improvements: readOptionalJson(path.join(runRoot, 'comparison', 'improvements.json'), []),
    criticalRegressions: readOptionalJson(path.join(runRoot, 'comparison', 'criticalRegressions.json'), []),
    testAggregate: readOptionalJson(path.join(runRoot, 'candidate-results', 'test', 'aggregate.json'), null),
    adversarialAggregate: readOptionalJson(path.join(runRoot, 'candidate-results', 'adversarial', 'aggregate.json'), null),
    repositoryGate: readOptionalJson(path.join(runRoot, 'repository-gates', 'report.json'), null),
    agenticGate: readOptionalJson(path.join(runRoot, 'agentic-gate', 'gate-report.json'), null),
    gateEvidence: gateReport.evidence ?? {},
  };
}

function canonicalDiff(baselinePath, candidatePath) {
  const result = spawnSync('git', ['diff', '--no-index', '--', baselinePath, candidatePath], { encoding: 'utf8' });
  return result.stdout || result.stderr || '';
}

function reportMarkdown({ gateReport, evidenceSummary, hashes }) {
  return [
    '# Skill Lab Promotion Packet',
    '',
    'Manual review required before applying any candidate.',
    '',
    `Gate status: ${gateReport.status}`,
    `Accepted for test: ${gateReport.accepted ? 'yes' : 'no'}`,
    `Candidate hash: ${hashes.candidate}`,
    '',
    '## Evidence',
    '',
    `- Improved cases: ${evidenceSummary.improvements.length}`,
    `- Critical regressions: ${evidenceSummary.criticalRegressions.length}`,
    `- Test split passed: ${gateReport.evidence?.testPassed ? 'yes' : 'no'}`,
    `- Adversarial split passed: ${gateReport.evidence?.adversarialPassed ? 'yes' : 'no'}`,
    `- Repository gates passed: ${gateReport.evidence?.repositoryGatesPassed ? 'yes' : 'no'}`,
    `- Cross-harness regressions: ${gateReport.evidence?.crossHarnessRegressionCount ?? 'unknown'}`,
    '',
    '## Boundary',
    '',
    '- This packet does not write to `skills/**`.',
    '- Promotion requires a human-reviewed pull request.',
  ].join('\n');
}

function prBodyMarkdown({ gateReport, evidenceSummary }) {
  return [
    '## Skill Lab Promotion Candidate',
    '',
    'Manual promotion only. This PR must apply the reviewed `canonical.diff`; no lab command auto-adopts candidates.',
    '',
    `Gate status: ${gateReport.status}`,
    `Improved cases: ${evidenceSummary.improvements.length}`,
    `Critical regressions: ${evidenceSummary.criticalRegressions.length}`,
    '',
    'Validation evidence is attached in the promotion packet: gate report, evidence summary, hashes, and canonical diff.',
  ].join('\n');
}

function readOptionalJson(filePath, fallback) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : fallback;
}
