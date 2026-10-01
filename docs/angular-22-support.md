# Angular 22: use the right API, not just the newest one 🔎

<!-- docs:navigation:start -->
[Español](angular-22-support.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

**Detect the exact version first.** A skill gated at major 22 does not prove that every API exists in 22.0. Use the [version policy](angular-version-support.md) and the official API page before implementation.

## Verified reference points

Reviewed against official Angular documentation on **2026-10-01**. These are API-specific observations, not a blanket production-readiness guarantee.

| Topic | Evidence and boundary |
| --- | --- |
| Signal Forms | [FormField](https://angular.dev/api/forms/signals/FormField) is marked stable since 22.0; still validate form behavior and migration scope |
| Resource / HTTP resource | [resource](https://angular.dev/api/core/resource) and [httpResource](https://angular.dev/api/common/http/httpResource) are marked stable since 22.0 |
| Lazy dependency injection | [injectAsync](https://angular.dev/api/core/injectAsync) is stable since 22.0; the service must be auto-provided |
| Service decorator | [Service](https://angular.dev/api/core/Service) documents automatic DI registration; it also supports `autoProvided: false`, so do not rewrite every provider mechanically |
| Change detection | [ChangeDetectionStrategy](https://angular.dev/api/core/ChangeDetectionStrategy) documents OnPush as default and `Default` as a deprecated alias of `Eager`; inspect existing components and tests |
| Detached route cleanup | [destroyDetachedRouteHandle](https://angular.dev/api/router/destroyDetachedRouteHandle) is stable **since 22.2**, not a general 22.0 guarantee |
| Debouncing Signals | [debounced](https://angular.dev/guide/signals/debounced) remains experimental; do not label all asynchronous Signals stable |
| Browser navigation integration | [withExperimentalPlatformNavigation](https://angular.dev/api/router/withExperimentalPlatformNavigation) remains experimental and its documentation warns against production use |
| Injector cleanup | [withExperimentalAutoCleanupInjectors](https://angular.dev/api/router/withExperimentalAutoCleanupInjectors) is now deprecated; follow the replacement linked by the API reference |

## Other topics: check their individual contracts

Angular Aria, linked Signals, effects, zoneless execution, event replay, incremental hydration and route-level rendering are separate features. Review their official guide/API and your version; one stable API does not establish the maturity of its neighbors.

Template spread/rest syntax, arrow functions, multi-case or exhaustive `@switch`, element-level comments and host-directive matching must be checked against the [expression reference](https://angular.dev/guide/templates/expression-syntax) and the corresponding template/component guide. Do not treat a roadmap announcement as a compiler guarantee.

For `@boundary` / `@error`, WebMCP, and builder changes, verify the exact release and current [roadmap](https://angular.dev/roadmap). This guide does not promise a release quarter or authorize replacing a working builder. Keep experimental adoption in a separately approved task.

## Toolchain

Use the exact rows in the [official compatibility matrix](https://angular.dev/reference/versions), not “TypeScript 6.x” as an unlimited range. Angular 22.0.x requires TypeScript `>=6.0.0 <6.1.0`; the CLI's Node requirement and the Angular application's Node requirement are different.

## NgAutoPilot AI skill coverage

The following source skills are under `skills/angular/ai/` and use a major-22 minimum gate:

- `angular-v22-agent-skills-integration`: Angular Agent Skills as a reference.
- `angular-v22-ai-tutor-safe-usage`: safe tutor usage.
- `angular-v22-angular-mcp-agent-workflow`: Angular MCP development workflow.
- `angular-v22-devserver-self-healing-loop`: bounded build-feedback loop.
- `angular-v22-webmcp-tool-exposure`: experimental WebMCP exposure.

The gate is routing metadata, not proof of installed tooling, successful runtime execution, exact-minor availability or authorization to expose application tools.

## Safe route

1. Detect package and lockfile versions.
2. Complete the [21 → 22 hop](../skills/angular/upgrades/21-to-22/README.md) if still on 21.
3. Select one concern-specific skill, check the API source and toolchain.
4. Validate behavior, build and tests.
5. Keep modernization, remediation and optimization outside the upgrade scope.
