---
id: angular.security.angular-token-storage-policy
name: Angular Token Storage Policy
description: Define a safe policy for storing and rotating auth tokens in Angular applications.
stack:
  - Angular
category: security
status: stable
version: 0.11.0
owner: NgAutoPilot
triggers:
  - token storage
  - auth token policy
  - security policy
---

# Angular Token Storage Policy

## Purpose

Decide whether the application's authentication credentials remain within an explicit storage, transport, expiry, and revocation boundary. A browser storage change alone does not prove session security.

## When to Use

Use for login, refresh, logout, auth interceptors, cookies, or changes to credential persistence. Inspect the installed Angular/auth-library versions, identity provider, API origins, and backend session contract first.

## Do

### Checks and evidence

1. Inventory access tokens, refresh tokens, session IDs, and CSRF tokens separately: issuer, readers, storage, lifetime, destination, and logout behavior. Search the application and auth-library configuration, then inspect an actual test login in browser storage and network tools. Do not copy real credentials into reports.
2. Check localStorage, sessionStorage, IndexedDB, persisted state, URLs, logs, and SSR hydration for bearer/session secrets. Reject persistent JavaScript-readable session secrets as the default policy; encrypting them with a key accessible to the same JavaScript does not fix XSS exposure. In-memory access tokens still face XSS and require bounded lifetimes. An unavoidable provider constraint needs an explicit owner-approved exception and residual risk; it is not evidence that this check passed.
3. For server sessions, verify Set-Cookie has HttpOnly, Secure, and an appropriate SameSite policy, narrow scope, and expiry. Verify CSRF protection on every state-changing cookie-authenticated route, including login/logout where applicable: an authenticated cross-site request from a disallowed origin must not mutate state. For token-based defenses, also assert rejection of missing/invalid CSRF tokens; for an alternative defense, document and test its server-side enforcement. SameSite and Angular's XSRF header support do not prove backend validation. Cross-origin APIs require a separately verified cookie/CORS/CSRF design.
4. Test refresh token rotation and replay according to the provider contract: reuse an old refresh token after rotation and assert rejection and the documented session/family response. Check expiry at the server, not only in client timers. For logout, test server-side revocation and the documented residual access-token lifetime; deleting browser state alone cannot revoke a previously issued bearer token.
5. Inspect the Authorization interceptor's origin allowlist. Send requests to the allowed API and a controlled foreign origin; credentials must reach only the allowed origin. Check redirects, error logging, telemetry, and concurrent refresh failures without recording secrets.

### Regression cases

Run in the existing browser and API integration suites with synthetic accounts in an isolated environment. For every case record the command, expected response/state, actual response/state, and redacted evidence. Adapt route names to the project; do not invent a passing command.

| Case | Reproduction and required assertion | Decision on observation |
| --- | --- | --- |
| Persistent bearer | Login leaves a reusable refresh/session secret in JavaScript-readable storage. | FAIL |
| Cookie without CSRF | An authenticated cross-site request from a disallowed origin mutates state, or a required CSRF token is not validated. | FAIL |
| Revoked refresh replay | An old rotated/revoked refresh token can mint a new session. | FAIL |
| Missing auth server | Only client mocks ran; rotation/revocation or CSRF enforcement is unverified. | BLOCKED |
| Bounded session | Storage, cookie/CSRF or explicit bearer-only transport, expiry, rotation, logout bounds, and foreign-origin tests all meet the recorded contract. | PASS |

FAIL takes precedence over BLOCKED when an unsafe behavior is demonstrated. Report PASS only when all applicable checks have executed successfully; justify non-applicable checks with architecture evidence. A failed test cannot become PASS through a risk acceptance entry.

## Do Not

- Do not move credentials to cookies without the backend and CSRF changes that the design needs.
- Do not treat route guards, token decoding, HttpOnly, or a successful Angular build as authorization proof.
- Do not force an auth-provider migration or add a storage wrapper unrelated to the finding.

## Review Checklist

- [ ] Credential inventory and exact provider/library versions are attached.
- [ ] Browser storage, cookie flags, CSRF, foreign origins, and lifecycle tests have actual results.
- [ ] Missing server evidence produces BLOCKED; demonstrated unsafe behavior produces FAIL.
- [ ] Exceptions name an owner, expiry, compensating controls, and residual risk without hiding failures.

## Expected Output

Provide the scoped decision, affected files and credential flow, smallest fix, and before/after test results. Include commands and redacted evidence, unresolved assumptions, and rollback steps. Never publish tokens or session cookies.

Sources: [OWASP browser storage](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html), [session lifecycle](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), and [CSRF controls](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
