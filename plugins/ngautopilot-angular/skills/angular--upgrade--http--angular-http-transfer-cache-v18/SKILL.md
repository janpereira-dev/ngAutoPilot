---
id: angular.upgrade.http.angular-http-transfer-cache-v18
name: Angular HTTP Transfer Cache v18
description: >
  Review Angular HTTP transfer cache behavior after Angular 18 when SSR or hydration apps cache authenticated requests or rely on transfer cache semantics. Use when auth headers, cookies, or user-scoped responses may affect cache safety.
stack:
  - Angular
  - TypeScript
category: http
status: stable
version: 0.4.0
owner: NgAutoPilot
triggers:
  - HTTP transfer cache
  - authenticated HTTP requests
  - SSR transfer cache
  - withHttpTransferCache
compatibility:
  angular:
    min: "18"
---

# Angular HTTP Transfer Cache v18 Migration

## Purpose

Review Angular HTTP transfer cache behavior after Angular 18.

## When to Use

- The app uses SSR or hydration.
- The app uses transfer cache.
- The app has authenticated HTTP requests.

## When Not to Use

- The app does not use transfer cache.
- The app is still in a version upgrade.

## Required Inputs

- HTTP client code
- SSR config
- transfer cache config
- authenticated request paths
- security review notes

## Procedure

1. Identify transfer-cached requests.
2. Review auth header and cookie behavior.
3. Decide whether auth-scoped caching is safe.
4. Validate SSR and client fetch behavior.

## Do

- Keep transfer cache policy explicit.
- Review user-scoped cache risks.
- Validate production behavior.

## Do Not

- Do not enable auth transfer cache without review.
- Do not mix this with the version upgrade itself.

## Review Checklist

- [ ] Cached request list is known.
- [ ] Auth header behavior is reviewed.
- [ ] Security decision is explicit.
- [ ] Validation passes.

## Expected Output

1. Transfer cache summary.
2. Auth risk review.
3. Validation result.

## Exit Criteria

- Transfer cache risk is explicit.
