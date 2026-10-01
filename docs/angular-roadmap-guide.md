# Angular catalog: choose one route 🧭

<!-- docs:navigation:start -->
[Español](angular-roadmap-guide.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

**Detect → gate → one hop → validate.** This is a navigation guide to source skills, not a promise that installing a pack migrates an application.

## Start here

1. Gather project context with `skills/_core/project-intake/SKILL.md`.
2. Detect stack and versions with `skills/_core/stack-version-detection/SKILL.md`.
3. Route through `skills/angular/versioning/angular-versioning-index/SKILL.md`.
4. Apply `skills/angular/versioning/angular-version-compatibility-gate/SKILL.md`.
5. Choose only the next hop and satellites required by actual risk.
6. Validate build, tests, routing, SSR and Material where present. Commit only if authorized.
7. Repeat only after the slice is stable; modernize in a separate task.

See the [era folder map](angular-version-era-map.md) and [version policy](angular-version-support.md) for location and support boundaries.

## Versioning: three jobs, not three competing answers

| Skill | Job | Expected evidence |
| --- | --- | --- |
| `angular.versioning.angular-version-gates` | Lightweight compatibility routing | Detected profile, allowed APIs, future path when modern APIs are unavailable |
| `angular.versioning.angular-version-compatibility-gate` | Formal compatibility decision | Node, TypeScript, RxJS, CLI and browser ranges; blockers, satellites and next safe hop |
| `angular.versioning.angular-versioning-index` | Master navigation | Clear next skill and separation between gates, hops and modernization |

## Upgrade hops

`angular.upgrade.hops.angular-2-to-4` through `angular.upgrade.hops.angular-20-to-21` guide the historical major-hop path. They are procedures for an authorized agent, **not executable source transformers**. Angular 2 → 4 is the historical numbering exception; otherwise move one major at a time, stop at the target, document blockers and validate before the next hop.

For **21 → 22**, use `skills/angular/upgrades/21-to-22/angular-21-to-22-upgrade-orchestrator/SKILL.md`. Complete preflight and the breaking-change gate before applying an authorized upgrade; collect post-upgrade evidence afterwards. The [hop README](../skills/angular/upgrades/21-to-22/README.md) gives the reading order.

## Satellite map: add only what the project needs

| Area / source family | What to inspect | Outcome |
| --- | --- | --- |
| `angular.upgrade.angularjs.*` | Legacy inventory; hybrid bootstrap; templates, controllers, services, directives, filters and routing; upgrade/downgrade APIs | Staged AngularJS exit, explicit hybrid boundaries and removal criteria |
| `angular.upgrade.workspace.angular-cli-workspace-migration-v6` | Old workspace configuration → `angular.json` | Usable workspace baseline for Angular 6+ |
| `angular.upgrade.rxjs.angular-rxjs-5-to-6-bridge` | RxJS 5 → 6 transition | Fewer legacy package blockers |
| `angular.upgrade.http.angular-httpclient-migration-v6` | `Http` / `HttpModule` → `HttpClient` | Supported HTTP baseline |
| `angular.upgrade.ivy.*`; `angular.upgrade.libraries.angular-view-engine-library-audit-v13`; `angular.upgrade.libraries.angular-ngcc-view-engine-removal-v16`; `angular.upgrade.i18n.angular-localize-v9-migration` | Ivy readiness, View Engine/ngcc dependencies and localize tooling | Explicit library risks for Angular 9+, 13+ and 16+ |
| `angular.upgrade.router.*` | Dynamic-import lazy routes, public APIs, redirects, errors, resolvers and route validation | Target-version navigation without hidden regressions |
| `angular.upgrade.ssr.*`; `angular.upgrade.service-worker.*` | Server rendering, transfer state, platform-server and update flows | Explicit SSR and service-worker compatibility |
| `angular.upgrade.testing.*` | TestBed, timing, change detection, router, SSR, animations and fakeAsync | Less brittle tests; evidence beyond a green build |
| `angular.upgrade.forms.*` | Typed/untyped bridge, ngModel writes, numeric validation and form arrays | Type safety and bounded form migration |
| `angular.upgrade.material.*` | MDC inventory, themes, density, overlays, harnesses and visual regression | Bounded Material change with visual evidence |
| `angular.upgrade.zone.*`; `angular.upgrade.zoneless.*` | Zone.js imports, root providers and renamed/prepared zoneless APIs | Correct runtime configuration |
| `angular.upgrade.signals.*`; `angular.upgrade.resources.*` | Signal mutation and resource/rxResource API changes | Supported reactivity contracts |
| `angular.upgrade.templates.*`; `angular.upgrade.components.*` | Template operators, dynamic creation and projectable nodes | Target-version template/component behavior |
| `angular.upgrade.di.*`; `angular.upgrade.debug.*` | Deprecated DI and debug-attribute dependencies | Removal of unsupported assumptions |

## Modernization comes afterwards

`angular.modernization.*` covers control flow, `@defer`, standalone-first and zoneless preparation. API eligibility still depends on the project version. Do not expand a compatibility upgrade merely because a newer pattern exists.

## Already on Angular 22?

Read the [API-specific support guide](angular-22-support.md), then choose a narrow `angular-v22-*` skill in the relevant concern:

`skills/angular/build/`, `components/`, `forms/`, `modules/`, `resources/`, `router/`, `security/`, `signals/`, `ssr/`, `templates/`, `testing/`, `zone/`, or `zoneless/` (all under `skills/angular/`).

Use versioning indices for feature routing, risk matrix and roadmap alignment. Do not create a generic `skills/angular/v22/` tree or assume that a major-22 gate proves every minor-version API exists.

## Completion check

- [ ] Project and target versions are evidenced.
- [ ] One hop and only required satellites are selected.
- [ ] Upgrade and modernization remain separate.
- [ ] Relevant application checks ran; skipped/blocked checks are explicit.
- [ ] Any commit, push or publication is separately authorized.
