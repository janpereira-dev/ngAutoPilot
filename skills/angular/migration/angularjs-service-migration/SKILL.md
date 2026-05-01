---
id: angular.migration.angularjs-service-migration
name: AngularJS Service Migration
description: >
  Migrates AngularJS services, factories, providers, and async data access patterns to Angular injectables in bounded, version-aware slices.
stack:
  - AngularJS
  - Angular
  - TypeScript
  - RxJS
category: migration
status: draft
version: 0.1.0
owner: NgAutoPilot
triggers:
  - AngularJS services
  - factory to injectable
  - provider migration
  - $http migration
  - $q migration
compatibility:
  angularjs:
    min: "1.x"
  angular:
    min: "2"
---

# AngularJS Service Migration

## Purpose

Use this skill to migrate AngularJS services, factories, providers, and async access patterns to Angular `@Injectable` services in a controlled slice.

This skill focuses on service-layer migration only. It does not migrate templates, routing, or controllers unless the service boundary forces a minimal supporting change.

## When to Use This Skill

Use this skill when:

- The service inventory already exists.
- AngularJS services, factories, or providers are part of the migration surface.
- The code uses `$http`, `$q`, shared mutable service state, or factory-based async patterns.
- You need to convert data access or shared behavior to Angular injectables.
- The service layer is a blocker for later controller or template migration.

## When Not to Use This Skill

Do not use this skill when:

- There is no AngularJS service evidence in the repository.
- The task is only about templates, routing, or forms.
- The migration strategy has not been selected.
- The project is already Angular-only and needs no legacy service conversion.

## Inputs Expected

- Service inventory
- Target Angular major
- HTTP and async patterns used in AngularJS
- Shared state or singleton behavior
- Validation commands
- Version constraints for RxJS and TypeScript

## Compatibility by Version

| Framework | Strategy recommended | Observations |
|---|---|---|
| AngularJS 1.x | Convert one service boundary at a time | Keep the old contract stable while changing implementation. |
| Angular 2+ | Prefer `@Injectable({ providedIn: 'root' })` or feature-scoped providers | Do not force root scope if the service should stay local. |
| Angular 16+ | `takeUntilDestroyed` and newer lifecycle helpers may be available | Verify project support before using them. |

If a version cannot be confirmed from the project files, mark it as `verify in project`.

## Procedure

1. Identify the AngularJS service boundary.
2. Classify the service as data access, domain logic, state holder, adapter, or utility.
3. Preserve the public contract where possible.
4. Convert `$http` and `$q` usage to Angular-compatible async patterns.
5. Decide whether the service should be root-scoped or feature-scoped.
6. Apply one bounded service migration.
7. Validate the slice.
8. Document what remains on the legacy side.

## Do

- Keep the service contract stable unless a minimal API change is unavoidable.
- Prefer typed data models and explicit return types.
- Move HTTP access to Angular `HttpClient` when the project supports it.
- Use RxJS or promises according to the project style and version.
- Separate pure mapping logic from transport logic.
- Preserve shared behavior while removing AngularJS-specific dependencies.

## Recommended Patterns

Convert AngularJS factories or services to Angular injectables:

```ts
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly http: HttpClient) {}

  getUser(id: string): Observable<UserDto> {
    return this.http.get<UserDto>(`/api/users/${id}`);
  }
}
```

Prefer explicit async composition over `$q` chaining:

```ts
loadUser(id: string): Observable<UserViewModel> {
  return this.userService.getUser(id).pipe(
    map((user) => this.mapper.toViewModel(user)),
  );
}
```

Preserve feature-scoped providers when the service should not become global:

```ts
@Injectable()
export class FeatureStateService {}
```

## Anti-Patterns

- Recreating `$q` style chaining in Angular services without a reason.
- Moving a service to `providedIn: 'root'` when it should stay feature-scoped.
- Leaving AngularJS globals or `$rootScope` dependencies inside the new service.
- Mixing transport concerns, mapping, and view-model logic in one opaque method.
- Migrating all services at once instead of a bounded slice.

## Do Not

- Do not migrate controllers, templates, or routing in the same slice unless required by the service boundary.
- Do not invent RxJS or Angular APIs that the project cannot support.
- Do not remove legacy service consumers until the replacement path is ready.
- Do not introduce state libraries as part of the first service migration slice.
- Do not run commands that are not present in `package.json`.

## Review Checklist

- [ ] The service boundary was identified.
- [ ] The old contract was preserved or the API change was minimal and justified.
- [ ] The new service scope matches the real ownership model.
- [ ] `$http` and `$q` usage were replaced appropriately.
- [ ] Mapping logic is separated from transport logic.
- [ ] Validation was planned or executed.
- [ ] No unrelated files were changed.

## Validation Minimum

Use only repository commands that actually exist.

Prefer:

- build
- test
- lint

If validation cannot run, report the blocker and the safest next step.

## Risks

- A global singleton can accidentally accumulate state.
- Changing the service scope can break consumers that relied on the AngularJS lifecycle.
- Replacing `$q` with promises or observables can alter timing if done carelessly.
- Service migration can expose hidden coupling to `$rootScope` or DOM assumptions.

## Expected Output

When this skill is used, return:

1. Service inventory summary.
2. Service boundary selected.
3. New service scope.
4. Async pattern chosen.
5. Remaining legacy consumers.
6. Validation commands and results.
7. Next recommended skill.

## Exit Criteria

This skill is complete only when:

- A service boundary was migrated.
- The service contract remains understandable.
- The new scope matches ownership.
- Validation was run or planned.
- The next migration step is clear.

