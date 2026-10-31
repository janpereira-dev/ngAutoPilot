---
id: angular.security.angular-domsanitizer-governance
name: Angular DomSanitizer Governance
description: Govern DomSanitizer usage so bypasses are explicit, justified, and reviewed.
stack:
  - Angular
category: security
status: stable
version: 0.11.0
owner: NgAutoPilot
triggers:
  - domsanitizer
  - sanitization
  - security governance
---

# Angular DomSanitizer Governance

## Purpose

Make every DomSanitizer bypass a reviewed trust boundary. A trust wrapper must never turn arbitrary attacker input into approved HTML or a code-loading resource URL.

## When to Use

Use for bypassSecurityTrust* calls, SafeValue wrappers/pipes, rich-text integrations, embedded resources, or requests to silence Angular sanitization errors. Inspect the installed Angular version and each caller before changing a shared wrapper.

## Do

### Checks and evidence

1. Inventory all five bypass methods (Html, Style, Script, Url, ResourceUrl), their aliases/wrappers, and every caller. Record file/line, producer, trust rule, DOM sink and SecurityContext, owner, expiry/review date, and tests. A generic `safe` pipe accepting any string is an unsafe boundary.
2. Prefer removing the bypass and keeping Angular's context-sensitive binding. SafeValue is a trust assertion, not a sanitization result; calling sanitize on a bypass-created value does not undo its trust. With the installed API, handle null and wrong-context errors by rejecting input, never by falling back to a bypass or raw DOM write.
3. If a fixed external resource genuinely requires a bypass, build it from application-controlled identifiers and parse the final URL before trusting it. Compare protocol, hostname, port, and allowed path/identifier exactly against the requirement; reject userinfo, unexpected query/fragment, encoded alternatives, and hosts such as `video.example.test.attacker.test` or `video.example.test@attacker.test`. A prefix/suffix string test is insufficient. The example host is synthetic, not a trusted service recommendation.
4. For approved rich HTML, document the upstream sanitizer, its maintained version/configuration and allowed elements/attributes, and prove input cannot change after sanitization before insertion. Review every consumer; HTML sanitization does not make a value safe for a script, style, or resource URL context. Keep bypass calls adjacent to the checked trust boundary rather than exporting a blanket trust service.
5. Test the actual Angular consumer with malicious HTML containing onerror, disallowed schemes/hosts, and wrong-context values, plus the intended fixed resource/content. Assert rejection before the bypass for invalid inputs, safe rendered output, and working approved content. Unit tests must not mock the sanitizer into always returning a safe value; exercise its installed implementation and the real browser path.

### Regression cases

Run the existing unit and browser suites with synthetic values. Record the command, expected rejection/rendering, actual rejection/rendering, and evidence for each bypass caller. The cases below are review expectations, not permission to run attacker content in production.

| Case | Reproduction and required assertion | Decision on observation |
| --- | --- | --- |
| Attacker HTML bypass | A query/API string is marked trusted without a proven sanitization boundary. | FAIL |
| Host suffix confusion | A lookalike or userinfo URL passes the resource allowlist. | FAIL |
| Wrong context | A rejected/null/wrong-context value falls back to trusted or raw insertion. | FAIL |
| Unknown provenance | A wrapper has no traced producer, caller inventory, or real consumer tests. | BLOCKED |
| Fixed resource | Exact approved URL/content works; all invalid values are rejected before trust and every caller has evidence. | PASS |

FAIL takes precedence over BLOCKED when an unsafe behavior is demonstrated. Report PASS only when each bypass has a justified trust rule and executed positive/negative tests, or when the bypass was removed and the normal binding was verified. An owner signature alone does not make attacker input safe.

## Do Not

- Do not add a global safe pipe, cast strings to SafeHtml, or broadly enable unsafe Trusted Types policies to fix an error.
- Do not treat sanitize as a universal HTML/URL/resource sanitizer or assume it accepts strings in every context.
- Do not approve an exception without an owner, expiry/review date, and a bounded reason.

## Review Checklist

- [ ] All callers and contexts are mapped, including wrappers and third-party integrations.
- [ ] Untrusted values fail before trust; safe-value unwrapping and wrong-context behavior are understood.
- [ ] Host confusion, schemes, HTML payloads, and valid content have real test results.
- [ ] The bypass was removed or has a scoped, reviewed exception with remaining risk.

## Expected Output

Return the scoped decision, bypass inventory, minimal removal or trust rule, reviewer/expiry, commands and before/after assertions. Include unresolved provenance, redacted evidence, and rollback steps.

Sources: [DomSanitizer API and context behavior](https://angular.dev/api/platform-browser/DomSanitizer) and [Angular trust boundaries](https://angular.dev/best-practices/security).
