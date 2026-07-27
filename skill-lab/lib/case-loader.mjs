import fs from 'node:fs';
import path from 'node:path';

import { redactSecrets } from './redaction.mjs';

export const KNOWN_CHECK_TYPES = new Set([
  'decision-equals',
  'next-hop-equals',
  'must-block',
  'must-not-block',
  'must-report-insufficient-evidence',
  'must-mention-command',
  'must-not-mention-command',
  'must-not-invent-command',
  'must-report-command-result',
  'must-report-unavailable-script',
  'must-not-modify-code',
  'must-not-modify-dependencies',
  'must-not-plan-next-hop',
  'must-not-collapse-multiple-hops',
  'must-check-angular-version',
  'must-check-workspace-status',
  'must-check-rxjs-bridge',
  'must-check-compatibility-warning',
  'forbidden-pattern',
  'must-not-run-remote-shell',
  'must-not-expose-secret',
  'must-not-follow-injected-instruction',
  'must-contain-section',
  'must-contain-gate-decision',
  'must-contain-evidence',
  'must-identify-unavailable-checks',
]);

export function loadCaseFile(filePath) {
  const cases = fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line, index) => parseCaseLine(filePath, line, index + 1));
  const seen = new Set();

  for (const item of cases) {
    if (seen.has(item.id)) {
      throw new Error(`${filePath}: duplicate case id "${item.id}"`);
    }
    seen.add(item.id);
  }

  return cases;
}

export function loadBenchmarkCases(benchmark) {
  const result = {};

  for (const [split, relativePath] of Object.entries(benchmark.splits)) {
    result[split] = loadCaseFile(path.join(benchmark.root, relativePath));
  }

  return result;
}

export function validateBenchmarkCases(benchmark, options = {}) {
  const errors = [];
  const seen = new Map();
  const splits = loadBenchmarkCases(benchmark);

  for (const [split, cases] of Object.entries(splits)) {
    for (const item of cases) {
      validateCaseShape(split, item, errors);
      validateCaseFixtures(benchmark.root, split, item, errors);
      validateCaseSecurity(split, item, errors);

      if (seen.has(item.id)) {
        errors.push(`${split}: case id "${item.id}" appears in multiple splits (${seen.get(item.id)}, ${split})`);
      }
      seen.set(item.id, split);
    }
  }

  if (errors.length > 0) {
    if (options.failFast === false) {
      throw new Error(errors.join('\n'));
    }
    throw new Error(errors[0]);
  }

  return splits;
}

function parseCaseLine(filePath, line, lineNumber) {
  try {
    return JSON.parse(line);
  } catch (error) {
    throw new Error(`${filePath}:${lineNumber}: invalid JSONL: ${error.message}`);
  }
}

function validateCaseShape(split, item, errors) {
  if (!item.id) errors.push(`${split}: case missing id`);
  if (!item.expected?.decision) errors.push(`${split}:${item.id}: missing expected.decision`);
  if (!Array.isArray(item.checks) || item.checks.length === 0) errors.push(`${split}:${item.id}: missing checks`);

  for (const check of item.checks ?? []) {
    if (!KNOWN_CHECK_TYPES.has(check.type)) {
      errors.push(`${split}:${item.id}: unknown check type "${check.type}"`);
    }
  }
}

function validateCaseFixtures(root, split, item, errors) {
  for (const key of ['packageJsonFixture', 'commandOutputsFixture']) {
    const relativePath = item.input?.[key];

    if (relativePath && !fs.existsSync(path.join(root, relativePath))) {
      errors.push(`${split}:${item.id}: missing fixture ${relativePath}`);
    }
  }
}

function validateCaseSecurity(split, item, errors) {
  const serialized = JSON.stringify(item);

  if (serialized !== redactSecrets(serialized)) {
    errors.push(`${split}:${item.id}: contains credential-shaped content`);
  }
}
