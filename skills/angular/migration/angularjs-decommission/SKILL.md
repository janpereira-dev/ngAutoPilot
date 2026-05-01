---
id: angular.migration.angularjs-decommission
name: AngularJS Decommission
description: >
  Removes the remaining AngularJS runtime, modules, bridges, and legacy bootstrapping after the application has been migrated to Angular.
stack:
  - AngularJS
  - Angular
  - TypeScript
category: migration
status: draft
version: 0.1.0
owner: NgAutoPilot
triggers:
  - remove AngularJS
  - decommission hybrid runtime
  - legacy cleanup
  - AngularJS shutdown
compatibility:
  angularjs:
    min: "1.x"
  angular:
    min: "2"
---

# AngularJS Decommission

## Purpose

Use this skill to remove AngularJS runtime pieces after the application has been fully migrated to Angular.

This skill is the end of the AngularJS modernization path. It only applies when no AngularJS-owned routes, templates, services, or bootstrap entry points remain.

## When to Use This Skill

Use this skill when:

- The hybrid runtime is no longer needed.
- AngularJS-owned routes and features have been migrated.
- AngularJS modules, bootstrap code, and bridges can be removed safely.
- The decommission plan has been approved or is already in motion.

## When Not to Use This Skill

Do not use this skill when:

- AngularJS is still owning active routes or features.
- The hybrid runtime still serves real traffic.
- The migration is incomplete.
- The repository still depends on AngularJS-specific runtime behavior.

## Inputs Expected

- Inventory of remaining AngularJS artifacts
- Hybrid boundary status
- Target Angular ownership map
- Validation commands
- Rollback expectations

## Compatibility by Version

| Framework | Strategy recommended | Observations |
|---|---|---|
| AngularJS still present | Do not decommission yet | First remove all AngularJS-owned features. |
| Angular-only runtime | Remove bridges and bootstrap remnants | Keep the cleanup bounded and verifiable. |

If a version cannot be confirmed from the project files, mark it as `verify in project`.

## Procedure

1. Confirm that no AngularJS-owned routes or features remain.
2. Inventory all AngularJS bootstrap and bridge artifacts.
3. Remove hybrid runtime wiring.
4. Delete leftover AngularJS modules, services, and templates only when unused.
5. Update bootstrap and build entry points.
6. Validate the Angular-only runtime.
7. Document the final state and rollback notes.

## Do

- Remove only confirmed dead AngularJS artifacts.
- Keep the decommission bounded and reviewable.
- Validate the app after removing the legacy runtime.
- Preserve Angular behavior and public URLs.
- Update documentation if the runtime model changed.

## Recommended Patterns

Remove leftover hybrid wiring in a deliberate order:

1. Confirm ownership has moved.
2. Remove AngularJS route registration.
3. Remove AngularJS bootstrap hooks.
4. Remove upgrade/downgrade adapters.
5. Remove unused AngularJS modules and templates.
6. Re-run validation.

## Anti-Patterns

- Deleting AngularJS runtime code before confirming it is unused.
- Leaving dead bootstrap entry points behind.
- Removing bridges while routes still depend on them.
- Treating decommission as a cosmetic cleanup.
- Folding decommission into unrelated refactors.

## Do Not

- Do not decommission while AngularJS still owns active traffic.
- Do not remove fallback paths before validation succeeds.
- Do not rewrite unrelated Angular code while cleaning up legacy runtime.
- Do not introduce new dependencies during decommission.
- Do not run commands that do not exist in `package.json`.

## Review Checklist

- [ ] No AngularJS-owned routes or features remain.
- [ ] Hybrid bridges are no longer needed.
- [ ] Bootstrap remnants were identified and removed.
- [ ] Validation was planned or executed.
- [ ] Angular-only behavior still works.
- [ ] Rollback notes exist.
- [ ] No unrelated files were changed.

## Validation Minimum

Use only repository commands that actually exist.

Prefer:

- build
- test
- lint

If validation cannot run, report the blocker and the safest next step.

## Risks

- Removing AngularJS too early can break legacy routes or services.
- Hidden dynamic registration can leave stray runtime dependencies.
- Bootstrap cleanup can break startup if ownership was incomplete.
- Dead code elimination may expose missing validation coverage.

## Expected Output

When this skill is used, return:

1. Remaining AngularJS artifact summary.
2. Removed bridge and bootstrap pieces.
3. Angular-only runtime status.
4. Validation commands and results.
5. Rollback notes.
6. Final cleanup summary.

## Exit Criteria

This skill is complete only when:

- No AngularJS-owned runtime pieces remain.
- Hybrid bridges are removed.
- Validation succeeds or a concrete blocker is reported.
- The Angular-only runtime is stable.

