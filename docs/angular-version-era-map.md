# Angular Version Era Folder Map

This repository is organized primarily by concern, not by Angular major version.
The map below groups the current Angular skill folders by the version era they
most commonly serve.

## 2-12

Primary upgrade path:

- `skills/angular/upgrades/hops/angular-2-to-4/`
- `skills/angular/upgrades/hops/angular-4-to-5/`
- `skills/angular/upgrades/hops/angular-5-to-6/`
- `skills/angular/upgrades/hops/angular-6-to-7/`
- `skills/angular/upgrades/hops/angular-7-to-8/`
- `skills/angular/upgrades/hops/angular-8-to-9/`
- `skills/angular/upgrades/hops/angular-9-to-10/`
- `skills/angular/upgrades/hops/angular-10-to-11/`
- `skills/angular/upgrades/hops/angular-11-to-12/`

Supporting folders that commonly matter in this era:

- `skills/angular/versioning/`
- `skills/angular/upgrades/workspace/`
- `skills/angular/upgrades/rxjs/`
- `skills/angular/upgrades/http/`
- `skills/angular/upgrades/i18n/`
- `skills/angular/upgrades/ivy/`
- `skills/angular/upgrades/libraries/`
- `skills/angular/upgrades/service-worker/`
- `skills/angular/upgrades/testing/`

## 12-15

Primary upgrade path:

- `skills/angular/upgrades/hops/angular-12-to-13/`
- `skills/angular/upgrades/hops/angular-13-to-14/`
- `skills/angular/upgrades/hops/angular-14-to-15/`

Supporting folders that commonly matter in this era:

- `skills/angular/upgrades/router/`
- `skills/angular/upgrades/forms/`
- `skills/angular/upgrades/material/`
- `skills/angular/upgrades/ssr/`
- `skills/angular/upgrades/components/`
- `skills/angular/upgrades/templates/`
- `skills/angular/upgrades/di/`
- `skills/angular/upgrades/changelog/`
- `skills/angular/upgrades/deprecations/`
- `skills/angular/upgrades/debug/`
- `skills/angular/upgrades/browser-support/`

## 15-19

Primary upgrade path:

- `skills/angular/upgrades/hops/angular-15-to-16/`
- `skills/angular/upgrades/hops/angular-16-to-17/`
- `skills/angular/upgrades/hops/angular-17-to-18/`
- `skills/angular/upgrades/hops/angular-18-to-19/`

Supporting folders that commonly matter in this era:

- `skills/angular/modernization/`
- `skills/angular/architecture/`
- `skills/angular/signals/`
- `skills/angular/state/`
- `skills/angular/performance/`
- `skills/angular/security/`
- `skills/angular/ssr/`
- `skills/angular/testing/`
- `skills/angular/forms/`
- `skills/angular/router/`
- `skills/angular/templates/`
- `skills/angular/upgrades/standalone/`
- `skills/angular/upgrades/signals/`
- `skills/angular/upgrades/zoneless/`
- `skills/angular/upgrades/zone/`
- `skills/angular/upgrades/resources/`
- `skills/angular/upgrades/hydration/`
- `skills/angular/upgrades/hybrid/`
- `skills/angular/upgrades/modules/`

## 20-22

Primary upgrade path currently available:

- `skills/angular/upgrades/hops/angular-19-to-20/`
- `skills/angular/upgrades/hops/angular-20-to-21/`
- `skills/angular/upgrades/21-to-22/`

Angular 22 now has dedicated concern-first skills in:

- `skills/angular/modernization/`
- `skills/angular/signals/`
- `skills/angular/performance/`
- `skills/angular/security/`
- `skills/angular/ssr/`
- `skills/angular/testing/`
- `skills/angular/forms/`
- `skills/angular/router/`
- `skills/angular/templates/`
- `skills/angular/build/`
- `skills/angular/components/`
- `skills/angular/modules/`
- `skills/angular/resources/`
- `skills/angular/zone/`
- `skills/angular/zoneless/`

The older upgrade satellites still live under:

- `skills/angular/upgrades/build/`
- `skills/angular/upgrades/components/`
- `skills/angular/upgrades/forms/`
- `skills/angular/upgrades/modules/`
- `skills/angular/upgrades/resources/`
- `skills/angular/upgrades/ssr/`
- `skills/angular/upgrades/templates/`
- `skills/angular/upgrades/testing/`
- `skills/angular/upgrades/zone/`
- `skills/angular/upgrades/zoneless/`

## Extension Rule For The Next Major

Angular 3 was never released as a standalone major, so the historical path is
`2 -> 4`, not `2 -> 3`. Every later supported major has a bounded, sequential
hop.

When a new Angular major is supported, add only its compatibility declaration,
one bounded prior-major hop, concern-specific satellites where the public API
actually changed, validation fixtures, and pack/docs references. Do not revise
or silently modernize prior-version guidance as part of that addition.
