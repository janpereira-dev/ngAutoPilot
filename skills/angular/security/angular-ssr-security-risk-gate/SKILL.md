---
id: angular.security.angular-ssr-security-risk-gate
name: Angular SSR Security Risk Gate
description: Gate SSR changes with host validation, proxy trust, and server-side security boundaries.
stack:
  - Angular
category: security
status: stable
version: 0.11.0
owner: NgAutoPilot
triggers:
  - ssr security
  - security risk gate
  - server rendering security
---

# Angular SSR Security Risk Gate

## Purpose

Gate an SSR change on request-origin trust, outbound request boundaries, and isolation of user-specific rendering data. A rendered page or successful server build cannot establish these properties.

## When to Use

Use for Angular SSR adapters, reverse proxies, server-side HTTP calls, hydration/transfer caches, redirects, or shared provider state. Record exact Angular/SSR/adapter versions, deployment topology, and applicable upstream advisories before relying on framework defaults.

## Do

### Checks and evidence

1. Map the public edge, trusted proxy hops, direct origin access, and server routes. Establish the canonical allowed origins. At each proxy, verify strip/overwrite behavior for client-supplied Forwarded, X-Forwarded-Host, X-Forwarded-Proto, X-Forwarded-Prefix, and X-Forwarded-Port; validate Host as well. Do not blindly enable trust-proxy or assume the app sees only edge traffic. Confirm the installed adapter's supported host controls against its version and advisories.
2. Send synthetic requests through both edge and any reachable origin with hostile Host, Forwarded, and each X-Forwarded-* variant, malformed/multiple values, and a valid control. Assert rejection or canonical rendering without attacker-chosen outbound requests, redirect Location, asset origins, or poisoned cache entries. A status code alone is insufficient: capture test-server outbound traffic and rendered origins.
3. Trace request-derived URLs into server fetches and redirects. For controlled fixtures, reject loopback 127.0.0.1, private networks, link-local 169.254.169.254, and IPv6 local equivalents unless a specific internal destination is an explicitly authorized application requirement. Validate resolved destinations and every redirect hop; test an allowed host redirecting to a forbidden destination and document DNS/egress controls. Use local mock receivers; never probe real metadata or internal services.
4. Inventory module-level state, singleton providers, response/CDN caches, TransferState, HTTP transfer cache configuration, and includeHeaders. Keep credentials and secrets out of serialized HTML/hydration. Disable transfer caching for personalized HTTP responses unless a proven design safely scopes them; do not opt authenticated requests into caching by default. Review browser-visible fields separately from intended user data and never serialize sensitive response headers.
5. Render two synthetic accounts with distinct canaries concurrently and in both sequential orders, including an anonymous request. Assert each response/hydration contains only that request's permitted data and no credentials. Repeat through the deployed cache/proxy configuration. Inspect Cache-Control, cache keys, error paths, and any shared server/provider state; a single-user test cannot detect cross-request leakage.

### Regression cases

Run server integration and browser hydration tests in an isolated deployment with mock outbound endpoints. Record the command, expected status/origin/outbound requests/data isolation, actual observations, and redacted evidence. State any unreachable deployment layer as a gap.

| Case | Reproduction and required assertion | Decision on observation |
| --- | --- | --- |
| Spoofed forwarding | An untrusted forwarded/Host value controls a rendered origin, redirect, fetch, or shared cache entry. | FAIL |
| Internal fetch | A request or redirect reaches an unauthorized local/private destination. | FAIL |
| Cross-user cache | Account B or anonymous HTML/hydration contains account A's private canary or credentials. | FAIL |
| Missing proxy evidence | Only local mocks ran; actual forwarding rules, origin access, or deployment cache isolation remain unverified. | BLOCKED |
| Isolated rendering | Valid requests work; hostile origin/fetch cases are contained and concurrent/sequential user isolation passes at each applicable layer. | PASS |

FAIL takes precedence over BLOCKED when an unsafe behavior is demonstrated. Report PASS only when all applicable trust boundaries and isolation checks have executed with evidence. For CSR-only/static output, prove the absence of an SSR server and explain the gate's non-applicability; do not invent successful SSR tests.

## Do Not

- Do not copy a current-version host option into an older adapter without checking API support.
- Do not trust forwarding headers because their names look like proxy metadata.
- Do not fix a canary leak by hiding the assertion or cache header while leaving shared state intact.

## Review Checklist

- [ ] Exact versions/advisories and every ingress/proxy boundary are documented.
- [ ] Host/forwarding spoofing and redirect/egress tests have observed outcomes.
- [ ] Concurrent, sequential, and anonymous rendering isolate private data through deployment caches.
- [ ] Missing deployment evidence is BLOCKED and any demonstrated unsafe flow is FAIL.

## Expected Output

Return the scoped gate decision, topology and affected files, minimal fix, commands, before/after evidence, missing deployment checks, and rollback steps. Redact headers and private page data from reports.

Sources: [Angular SSR](https://angular.dev/best-practices/performance/ssr), [Angular security](https://angular.dev/best-practices/security), and the [upstream SSR header advisory](https://github.com/angular/angular-cli/security/advisories/GHSA-x288-3778-4hhx). Verify the installed release and current advisory ranges; do not infer that all Angular majors share the latest protections.
