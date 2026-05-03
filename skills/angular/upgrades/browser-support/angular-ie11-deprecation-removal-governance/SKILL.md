---
id: angular.upgrade.browser-support.angular-ie11-deprecation-removal-governance
name: Angular IE11 Deprecation and Removal Governance
description: >
  Assesses, documents, and controls Internet Explorer 11 support risk during Angular upgrades, especially across the Angular 11->12 and Angular 12->13 boundaries.
stack:
  - Angular
  - TypeScript
category: browser-support
status: draft
version: 0.3.0
owner: NgAutoPilot
triggers:
  - IE11 support
  - browser policy
  - Angular 12 IE11 deprecation
  - Angular 13 IE11 removal
  - legacy browser governance
compatibility:
  angular:
    min: "11"
    max: "13"
---

# Angular IE11 Deprecation and Removal Governance

## Purpose

Use this skill to assess, document, and control Internet Explorer 11 support risk during Angular upgrades.

This skill does not upgrade Angular by itself. It determines whether the upgrade path is allowed, blocked, or allowed with explicit business risk acceptance.

Angular 12 deprecates IE11 support. Angular 13 removes IE11 support.

## When to Use This Skill

Use this skill when:

- The upgrade route crosses Angular 11 -> 12.
- The upgrade route crosses Angular 12 -> 13.
- The project browser policy mentions IE11.
- `.browserslistrc` includes IE targets.
- `browserslist` includes IE targets.
- `polyfills.ts` contains IE-specific polyfills.
- The app supports legacy enterprise browsers.
- The product, client, or contract still mentions IE11.
- The validation gate needs a browser-support decision.

## When Not to Use This Skill

Do not use this skill when:

- The upgrade path does not cross Angular 11 -> 12 or Angular 12 -> 13.
- The project already targets Angular 13+ and IE11 is explicitly out of scope.
- The task is only CSS cleanup unrelated to browser support.
- The project has a documented evergreen-only browser policy.

Even when not used, Angular 13+ projects must not assume IE11 support.

## Inputs Expected

- `package.json`
- `angular.json`
- `.browserslistrc`
- `browserslist`
- `polyfills.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `src/styles.*`
- global styles
- Angular version
- Angular CLI version
- Angular Material version
- Browser support policy
- Product requirements
- Contractual browser requirements
- Analytics/browser usage data if available
- Enterprise workstation/browser policy if available
- CI production build command
- e2e/smoke test coverage
- screenshot/golden tests if present

Search for:

- `IE 11`
- `IE11`
- `Internet Explorer`
- `ie 11`
- `ie_mob`
- `not IE`
- `dead`
- `polyfills`
- `classlist.js`
- `web-animations-js`
- `core-js`
- `es5`
- `differential loading`

## Compatibility by Version

| Angular version | IE11 status | Gate behavior |
|---|---|---|
| Angular <= 11 | IE11 may still exist in legacy policy | Document and plan removal |
| Angular 12 | IE11 is deprecated | Allow only with explicit warning and migration plan |
| Angular 13+ | IE11 is removed | Block if IE11 support is required |

## Procedure

1. Inspect browser policy files and product/browser requirements.
2. Check whether IE11 is explicitly required, deprecated, or out of scope.
3. Inspect polyfills and browser support targeting.
4. Inspect Angular Material and styles for IE-specific workarounds.
5. Inspect build behavior and differential loading assumptions.
6. Decide whether the path is allowed, allowed with warnings, or blocked.
7. Document the business decision and the next action.

## Do

- Treat IE11 as a product and contract decision, not just a technical flag.
- Use `.browserslistrc` and `browserslist` as source of truth for browser targeting.
- Review IE-specific polyfills before removing them.
- Review CSS hacks and Material/layout assumptions before dropping IE11.
- Block Angular 13+ if IE11 is a hard requirement.

## Recommended Patterns

Use one of these strategies:

- `drop-IE11-support`
- `temporary-Angular-12-ceiling`
- `legacy-split`
- `enterprise-browser-migration`

Document the selected strategy and the rollback or fallback path.

## Anti-Patterns

- Treating IE11 as just another polyfill problem.
- Claiming Angular 13+ supports IE11.
- Removing IE11 from browser policy without stakeholder approval.
- Keeping IE11 in browser policy while targeting Angular 13+.
- Hiding browser support decisions inside a technical PR.
- Removing CSS hacks without visual validation.
- Removing polyfills without understanding supported browsers.
- Forcing ES5 output as a workaround for Angular 13+.
- Continuing to Angular 13 with unknown browser policy.

## Do Not

- Do not upgrade Angular by itself.
- Do not guess browser support policy from memory.
- Do not delete polyfills blindly.
- Do not remove IE11 support without product approval.
- Do not run commands that do not exist in `package.json`.

## Review Checklist

- [ ] IE11 status is explicit.
- [ ] Browser policy has been reviewed.
- [ ] Product/business requirement is documented.
- [ ] Angular route impact is clear.
- [ ] IE-specific polyfills are reviewed.
- [ ] IE-specific CSS hacks are reviewed.
- [ ] Angular Material/style impact is reviewed.
- [ ] Production build is validated.
- [ ] Gate result is explicit.

## Validation Minimum

Use only repository commands that actually exist.

Prefer:

- build
- test
- lint
- e2e

For production build validation:

- `ng build --configuration production`

If screenshot/golden tests exist, run them after browser policy changes.

## Validation Gate

Gate result must be one of:

- `PASS`
- `PASS_WITH_WARNINGS`
- `FAIL_BLOCK_NEXT_HOP`

Use `PASS` when IE11 is not required and evergreen policy is confirmed.

Use `PASS_WITH_WARNINGS` when IE11 residue exists but is not a hard requirement.

Use `FAIL_BLOCK_NEXT_HOP` when IE11 is a hard requirement and target is Angular 13+.

## Expected Output

When this skill is used, return:

1. Current Angular version.
2. Target Angular version.
3. Browser policy summary.
4. IE11 business requirement.
5. IE-specific polyfills and CSS hacks.
6. Gate result.
7. Recommendation for the next action.

## Output Contract

Return:

```md
## IE11 Browser Support Governance Report

### Source

- Current Angular version:
- Target Angular version:
- Browser policy file:
- IE11 listed in browser policy:
- IE11 business requirement:
- IE11 analytics evidence:
- IE-specific polyfills:
- IE-specific CSS hacks:
- Angular Material used:
- Production build command:
- Screenshot/golden tests:

### Decision

- Gate result:
- IE11 status:
- Angular route impact:
- Business sign-off required:

### Changes Applied

- browserslist:
- polyfills:
- tsconfig target:
- styles:
- Material/style checks:
- docs/support policy:

### Validation

- Commands run:
- Result:
- Failures:
- Warnings:

### Risks

- Remaining IE11 requirement:
- Remaining polyfills:
- Remaining CSS hacks:
- Remaining legacy browser policy:
- Material/style risk:
- Contract/product risk:

### Recommendation

- Continue to Angular 13:
  YES / NO

- Recommended next action:
```

## Exit Criteria

This skill is complete only when:

- IE11 support status is explicit.
- Browser policy has been reviewed.
- Product/business requirement is documented.
- Angular route impact is clear.
- Angular 13+ is blocked when IE11 is a hard requirement.
- IE-specific polyfills are reviewed.
- IE-specific CSS hacks are reviewed.
- Angular Material/style impact is reviewed.
- Production build is validated.
- Gate result is explicit.
