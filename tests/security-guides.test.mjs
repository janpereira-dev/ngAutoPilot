import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// These are documentation contracts, not an Angular runtime or agent-behavior evaluation.
const contracts = {
  'angular-token-storage-policy': {
    controls: [/localStorage[\s\S]*sessionStorage[\s\S]*IndexedDB/, /HttpOnly[\s\S]*Secure[\s\S]*SameSite/,
      /CSRF/, /refresh token[\s\S]*replay/i, /logout[\s\S]*revocation/i, /Authorization[\s\S]*origin/],
    cases: ['Persistent bearer', 'Cookie without CSRF', 'Revoked refresh replay', 'Missing auth server', 'Bounded session'],
    outcomes: ['FAIL', 'FAIL', 'FAIL', 'BLOCKED', 'PASS'],
  },
  'angular-xss-template-safety': {
    controls: [/innerHTML[\s\S]*outerHTML[\s\S]*insertAdjacentHTML/, /onerror/, /javascript:/,
      /createElement[\s\S]*Renderer2/, /template[\s\S]*compil/i, /hydration/i],
    cases: ['Event-handler payload', 'Script URL', 'Raw DOM sink', 'Missing browser run', 'Bound template'],
    outcomes: ['FAIL', 'FAIL', 'FAIL', 'BLOCKED', 'PASS'],
  },
  'angular-domsanitizer-governance': {
    controls: [/bypassSecurityTrust\w*|bypassSecurityTrust\*/, /SafeValue[\s\S]*sanitize/,
      /SecurityContext/, /hostname/, /userinfo/i, /owner[\s\S]*expiry/],
    cases: ['Attacker HTML bypass', 'Host suffix confusion', 'Wrong context', 'Unknown provenance', 'Fixed resource'],
    outcomes: ['FAIL', 'FAIL', 'FAIL', 'BLOCKED', 'PASS'],
  },
  'angular-ssr-security-risk-gate': {
    controls: [/X-Forwarded-Host[\s\S]*X-Forwarded-Proto/, /127\.0\.0\.1[\s\S]*169\.254\.169\.254/,
      /TransferState[\s\S]*includeHeaders/, /concurrent/i, /redirect/i, /proxy[\s\S]*strip/i],
    cases: ['Spoofed forwarding', 'Internal fetch', 'Cross-user cache', 'Missing proxy evidence', 'Isolated rendering'],
    outcomes: ['FAIL', 'FAIL', 'FAIL', 'BLOCKED', 'PASS'],
  },
  'angular-dependency-vulnerability-triage': {
    controls: [/npm audit --json/, /npm explain/, /npm audit --omit=dev --json/,
      /exit code/i, /build[\s\S]*CI[\s\S]*devDependency/i, /owner[\s\S]*expiry/],
    cases: ['Reachable advisory', 'Build-time exploit', 'Audit unavailable', 'Unknown reachability', 'Verified remediation'],
    outcomes: ['FAIL', 'FAIL', 'BLOCKED', 'BLOCKED', 'PASS'],
  },
};

for (const [id, { controls, cases, outcomes }] of Object.entries(contracts)) {
  test(`${id} retains its security checks and adversarial review cases`, () => {
    const content = fs.readFileSync(new URL(`../skills/angular/security/${id}/SKILL.md`, import.meta.url), 'utf8');
    for (const control of controls) assert.match(content, control, `${id}: missing ${control}`);
    assert.match(content, /FAIL takes precedence over BLOCKED/);
    assert.match(content, /PASS only when/);
    assert.match(content, /https:\/\/(angular\.dev|cheatsheetseries\.owasp\.org|docs\.npmjs\.com)\//);
    const matrix = content.split('### Regression cases')[1]?.split('## Do Not')[0];
    assert.ok(matrix, 'missing scoped regression matrix');
    for (const [index, name] of cases.entries()) {
      const row = matrix.split('\n').find((line) => line.startsWith(`| ${name} |`));
      assert.ok(row, `missing adversarial scenario: ${name}`);
      assert.equal(row.split('|').at(-2).trim(), outcomes[index], `${name}: wrong decision`);
    }
    assert.doesNotMatch(content, /Classify the change as migration, modernization, architecture/);
    assert.match(content, /command[\s\S]*expected[\s\S]*actual/i);
  });

  test(`${id} ships the canonical procedure through Angular, full, and Claude bundles`, () => {
    const source = fs.readFileSync(new URL(`../skills/angular/security/${id}/SKILL.md`, import.meta.url), 'utf8');
    for (const file of [
      `.agents/skills/ngautopilot-angular/references/skills/angular--security--${id}/procedure.md`,
      `.agents/skills/ngautopilot-full/references/skills/angular--security--${id}/procedure.md`,
      `plugins/ngautopilot-angular/skills/angular--security--${id}/SKILL.md`,
    ]) {
      assert.equal(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), source, `stale procedure: ${file}`);
    }
  });
}
