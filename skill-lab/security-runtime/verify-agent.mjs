import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { guideIds, hash, manifest } from './manifest.mjs';

export const oracle = JSON.parse(fs.readFileSync(new URL('oracle.json', import.meta.url), 'utf8'));
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const relativeReference = (value) => typeof value === 'string' && !/^(?:[a-z]+:|\/)|\\|(?:^|\/)\.\.(?:\/|$)/i.test(value);

// Checks a bounded recorded audit; this does not launch or authenticate a model.
export function verifyAgent(response, run) {
  const errors = [];
  if (!object(response) || !object(run)) return ['Missing response or run receipt'];
  if (run.status !== 'passed' || run.testCount !== 25 || run.passed !== 25 || run.failed !== 0 || run.skipped !== 0 || run.sourceUnchanged !== true) errors.push('A complete passing 25-case run is required');
  if (typeof run.id !== 'string' || !run.id || response.runId !== run.id) errors.push('Response is not bound to this run');
  const current = manifest();
  if (!isDeepStrictEqual(run.sources, current)) errors.push('Application/tests or canonical guides differ from the audited sources');
  if (!object(response.guidesRead) || Object.keys(response.guidesRead).length !== 5
    || guideIds.some((id) => response.guidesRead[id] !== current.guides[id])) errors.push('All five exact guide hashes are required');
  if (!Array.isArray(response.commands) || !response.commands.some((entry) => object(entry) && entry.exitCode === 0
    && typeof entry.command === 'string' && /\bnpm(?:-cli\.js)?\b.*\btest\b/.test(entry.command))) errors.push('Missing successful test command receipt');
  if (!Array.isArray(response.limitations) || !response.limitations.length || response.limitations.some((item) => typeof item !== 'string' || !item.trim())) errors.push('Audit limits must be recorded');
  if (!object(run.caseHashes) || Object.keys(run.caseHashes).length !== 25
    || oracle.some(({ id }) => !/^[a-f0-9]{64}$/.test(run.caseHashes[`${id}.json`] ?? ''))) errors.push('Measured case hashes are incomplete');
  if (!Array.isArray(response.cases) || response.cases.length !== 25) return [...errors, 'Exactly 25 subject decisions are required'];
  const seen = new Set();
  for (const item of response.cases) {
    if (!object(item)) { errors.push('Invalid case object'); continue; }
    const expected = oracle.find(({ id }) => id === item.id);
    if (!expected || seen.has(item.id)) { errors.push(`Unknown or duplicate subject: ${item.id}`); continue; }
    seen.add(item.id);
    if (item.guide !== expected.guide || item.decision !== expected.decision) errors.push(`${item.id}: expected ${expected.decision} under ${expected.guide}`);
    if (typeof item.reason !== 'string' || !item.reason.trim()) errors.push(`${item.id}: missing reasoning`);
    if (!Array.isArray(item.evidence) || !item.evidence.includes(`observations/cases/${item.id}.json`)
      || item.evidence.some((entry) => !relativeReference(entry))) errors.push(`${item.id}: missing or unsafe evidence references`);
  }
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2] || !process.argv[3]) throw new Error('Supply agent-response.json and its run.json');
    const response = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
    const run = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
    const errors = verifyAgent(response, run);
    const observationRoot = path.dirname(path.resolve(process.argv[3]));
    for (const { id } of oracle) {
      const file = path.join(observationRoot, 'cases', `${id}.json`);
      if (!fs.existsSync(file) || hash(file) !== run.caseHashes?.[`${id}.json`]) errors.push(`${id}: measured facts missing or changed`);
    }
    for (const item of response.cases ?? []) for (const reference of item.evidence ?? []) {
      if (!relativeReference(reference)) continue;
      const file = reference.startsWith('observations/') ? path.join(observationRoot, reference.slice('observations/'.length)) : path.resolve(import.meta.dirname, reference);
      if (!fs.existsSync(file)) errors.push(`${item.id}: unavailable cited evidence: ${reference}`);
    }
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(JSON.stringify({ passed: true, cases: 25, runId: run.id,
      decisions: Object.fromEntries(['FAIL', 'BLOCKED', 'PASS'].map((decision) => [decision, response.cases.filter((item) => item.decision === decision).length])) }, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
