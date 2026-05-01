# Angular Roadmap Guide

This guide is a fast map of the Angular skill catalog added in this roadmap.

## How To Use The Catalog

Use this order:

1. Detect stack and versions.
2. Run the Angular version compatibility gate.
3. Pick the next hop only.
4. Add satellite skills only when the hop or repo risk requires them.
5. Keep modernization separate from upgrade hops.

If an agent is doing the work, the best approach is:

- start with `skills/_core/project-intake/SKILL.md`
- detect versions with `skills/_core/stack-version-detection/SKILL.md`
- route through `skills/angular/versioning/angular-versioning-index/SKILL.md`
- decide with `skills/angular/versioning/angular-version-compatibility-gate/SKILL.md`
- execute one hop at a time
- validate build, tests, SSR, Material, and routing where relevant

## Core Versioning Skills

### `angular.versioning.angular-version-gates`

Lightweight compatibility helper for choosing safe Angular APIs.

Gets:
- a quick compatibility profile
- safe APIs for the detected version
- a future migration path when modern APIs are not available

### `angular.versioning.angular-version-compatibility-gate`

Formal Angular compatibility gate.

Gets:
- allowed Node, TypeScript, RxJS, Angular CLI, and browser ranges
- blocking issues
- required satellite skills
- the next safe hop

### `angular.versioning.angular-versioning-index`

Master navigation point for Angular version work.

Gets:
- a single entry point for agents
- a clear next skill or hop
- separation between gating, hopping, and modernization

## Angular Upgrade Hops

These are the major-hop executors.

### `angular.upgrade.hops.angular-2-to-4` through `angular.upgrade.hops.angular-20-to-21`

What they do:
- move one Angular major at a time
- stop at the next major
- route to satellites for version-specific risks

What you get:
- a controlled major upgrade
- version-specific blockers called out
- validation gates before the next hop

## AngularJS and Hybrid Migration

### `angular.upgrade.angularjs.*`

What they do:
- inventory legacy AngularJS code
- bootstrap hybrid apps
- migrate templates, controllers, services, directives, filters, and routing
- bridge downgrade and upgrade APIs
- decide when AngularJS can be removed

What you get:
- a staged path out of AngularJS
- explicit hybrid boundaries
- decommission criteria

## Workspace, RxJS, and HttpClient

### `angular.upgrade.workspace.angular-cli-workspace-migration-v6`
### `angular.upgrade.rxjs.angular-rxjs-5-to-6-bridge`
### `angular.upgrade.http.angular-httpclient-migration-v6`

What they do:
- move old CLI workspace config to `angular.json`
- bridge RxJS 5 to RxJS 6
- replace legacy `Http`/`HttpModule` with `HttpClient`

What you get:
- a usable baseline for Angular 6+ and later hops
- fewer legacy package blockers

## Ivy, Libraries, and Localize

### `angular.upgrade.ivy.*`
### `angular.upgrade.libraries.angular-view-engine-library-audit-v13`
### `angular.upgrade.libraries.angular-ngcc-view-engine-removal-v16`
### `angular.upgrade.i18n.angular-localize-v9-migration`

What they do:
- check Ivy readiness
- block View Engine and ngcc dependencies
- move i18n to modern localize tooling

What you get:
- clearer compatibility for Angular 9+ and Angular 13+ and Angular 16+
- explicit library risk

## Router

### `angular.upgrade.router.*`

What they do:
- move lazy routes to dynamic imports
- review router public APIs
- handle redirects, error handlers, resolvers, and route validation

What you get:
- router behavior that matches the target Angular major
- fewer hidden navigation regressions

## SSR and Service Worker

### `angular.upgrade.ssr.*`
### `angular.upgrade.service-worker.*`

What they do:
- modernize server rendering APIs
- review transfer state and platform-server changes
- update service worker update flows

What you get:
- explicit SSR compatibility
- safer server-side update behavior

## Testing

### `angular.upgrade.testing.*`

What they do:
- update TestBed APIs
- review timing and change detection behavior
- align tests with router, SSR, animations, and fakeAsync changes

What you get:
- less brittle tests
- fewer upgrade surprises hidden behind green builds

## Forms

### `angular.upgrade.forms.*`

What they do:
- move to typed forms or use a temporary untyped bridge
- review ngModel template writes
- check numeric validation and form-array conflicts

What you get:
- stronger type safety
- clearer form migration boundaries

## Material

### `angular.upgrade.material.*`

What they do:
- orchestrate MDC migration
- inventory components
- review theming, density, overlays, harnesses, and visual regressions

What you get:
- a bounded Material migration with visual validation

## Zone, Zoneless, Signals, Resources, Templates, Components, DI, Debug

### `angular.upgrade.zone.*`
### `angular.upgrade.zoneless.*`
### `angular.upgrade.signals.*`
### `angular.upgrade.resources.*`
### `angular.upgrade.templates.*`
### `angular.upgrade.components.*`
### `angular.upgrade.di.*`
### `angular.upgrade.debug.*`

What they do:
- normalize Zone.js imports and root providers
- prepare or rename zoneless APIs
- move signal mutation patterns to supported forms
- migrate resource/rxResource APIs
- handle template operator changes
- handle dynamic component creation and projectable nodes
- clean up deprecated DI APIs
- remove debug attribute dependencies

What you get:
- modern Angular behavior without mixing modernization into the hop itself

## Post-Upgrade Modernization

### `angular.modernization.*`

What they do:
- adopt control flow
- adopt `@defer`
- move toward standalone-first
- prepare for zoneless execution

What you get:
- modernization after the hop is already stable

## Best Agent Strategy

If I were an agent using this catalog, I would do this:

1. Detect the current stack with the core detectors.
2. Run the compatibility gate.
3. Select only the next hop.
4. Add satellites only for detected risks.
5. Validate the slice.
6. Commit.
7. Repeat for the next hop.

That gives the smallest safe change, the least cross-talk between skills, and the cleanest upgrade path.
