import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { sha256, sha256File } from './hash-utils.mjs';
import { assertInsideLab } from './sandbox.mjs';

export function generatePromotionPacket({ runRoot }) {
  const labRoot = path.resolve('skill-lab');
  const safeRunRoot = assertInsideLab(labRoot, runRoot);
  const promotionRoot = assertInsideLab(labRoot, path.join(safeRunRoot, 'promotion'));
  assertPromotionOutputInsideLab(labRoot, promotionRoot);
  const baselinePath = path.join(safeRunRoot, 'baseline.SKILL.md');
  const candidatePath = path.join(safeRunRoot, 'optimization', 'candidate.SKILL.md');
  const gatePath = path.join(safeRunRoot, 'gate', 'gate-report.json');
  const manifestPath = path.join(safeRunRoot, 'manifest.json');

  for (const required of [baselinePath, candidatePath, gatePath, manifestPath]) {
    if (!fs.existsSync(required)) {
      throw new Error(`Missing promotion input: ${path.relative(process.cwd(), required).split(path.sep).join('/')}`);
    }
  }

  fs.mkdirSync(promotionRoot, { recursive: true });
  const candidate = fs.readFileSync(candidatePath, 'utf8');
  const gateReport = JSON.parse(fs.readFileSync(gatePath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const candidateHash = sha256(candidate);

  if (gateReport.accepted !== true) {
    throw new Error('gate report was not accepted');
  }
  if (gateReport.evidence?.candidateHash !== candidateHash) {
    throw new Error('candidate hash does not match accepted gate report');
  }
  const targetSkillPath = resolveManifestTarget(manifest);

  const evidenceSummary = buildEvidenceSummary(gateReport);
  const hashes = {
    baseline: sha256File(baselinePath),
    candidate: candidateHash,
    gateReport: sha256File(gatePath),
    generatedAt: new Date().toISOString(),
  };

  fs.copyFileSync(candidatePath, path.join(promotionRoot, 'candidate.SKILL.md'));
  fs.copyFileSync(gatePath, path.join(promotionRoot, 'gate-report.json'));
  fs.writeFileSync(path.join(promotionRoot, 'canonical.diff'), canonicalDiff(targetSkillPath, candidatePath, manifest.targetSkillPath), 'utf8');
  fs.writeFileSync(path.join(promotionRoot, 'evidence-summary.json'), `${JSON.stringify(evidenceSummary, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(promotionRoot, 'hashes.json'), `${JSON.stringify(hashes, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(promotionRoot, 'report.md'), reportMarkdown({ gateReport, evidenceSummary, hashes }), 'utf8');
  fs.writeFileSync(path.join(promotionRoot, 'pr-body.md'), prBodyMarkdown({ gateReport, evidenceSummary }), 'utf8');

  return promotionRoot;
}

function assertPromotionOutputInsideLab(labRoot, promotionRoot) {
  const canonicalLabRoot = fs.realpathSync(labRoot);
  const existingOutputPath = fs.existsSync(promotionRoot) ? promotionRoot : path.dirname(promotionRoot);
  const canonicalOutputPath = fs.realpathSync(existingOutputPath);
  const relativePath = path.relative(canonicalLabRoot, canonicalOutputPath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('promotion output must be under skill-lab');
  }
}

export function resolveManifestTarget(manifest, { repoRoot = path.resolve() } = {}) {
  if (typeof manifest.targetSkillPath !== 'string' || typeof manifest.targetSkillHash !== 'string') {
    throw new Error('manifest is missing target skill path or hash');
  }

  const skillsRoot = path.join(repoRoot, 'skills');
  const targetSkillPath = path.resolve(repoRoot, manifest.targetSkillPath);

  if (!fs.existsSync(targetSkillPath)) {
    throw new Error(`manifest target skill does not exist: ${manifest.targetSkillPath}`);
  }
  const canonicalSkillsRoot = fs.realpathSync(skillsRoot);
  const canonicalTargetSkillPath = fs.realpathSync(targetSkillPath);
  const relativePath = path.relative(canonicalSkillsRoot, canonicalTargetSkillPath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('manifest target skill must be under skills/');
  }
  if (sha256File(canonicalTargetSkillPath) !== manifest.targetSkillHash) {
    throw new Error('target skill hash does not match manifest');
  }

  return canonicalTargetSkillPath;
}

function buildEvidenceSummary(gateReport) {
  const comparison = acceptedComparison(gateReport.evidence?.comparison);

  return {
    gateStatus: gateReport.status,
    accepted: gateReport.accepted,
    improvements: comparison.improvements,
    criticalRegressions: comparison.criticalRegressions,
    gateEvidence: gateReport.evidence ?? {},
  };
}

function acceptedComparison(comparison) {
  const required = ['improvements', 'criticalRegressions', 'missingBaselineCases', 'missingCandidateCases'];

  if (!required.every((key) => Array.isArray(comparison?.[key]))) {
    return { improvements: [], criticalRegressions: [] };
  }

  return comparison;
}

function canonicalDiff(baselinePath, candidatePath, targetSkillPath) {
  const result = spawnSync('git', ['diff', '--no-index', '--', baselinePath, candidatePath], { encoding: 'utf8' });
  const diff = result.stdout || result.stderr || '';
  const target = (targetSkillPath ?? '').split(path.sep).join('/');

  if (!target || !diff) return diff;

  return diff
    .replace(/^diff --git .+$/m, `diff --git a/${target} b/${target}`)
    .replace(/^--- .+$/m, `--- a/${target}`)
    .replace(/^\+\+\+ .+$/m, `+++ b/${target}`);
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
