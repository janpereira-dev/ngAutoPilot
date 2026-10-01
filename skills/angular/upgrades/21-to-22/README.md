# Angular 21 to 22 Upgrade Skills

<!-- docs:navigation:start -->
[Español](README.es.md) · [Map](../../../../docs/README.md) · [Home](../../../../README.md)

<!-- docs:navigation:end -->

This folder contains the bounded Angular 21 -> 22 hop skills.

These are procedures for an authorized agent, not executable source transformers or proof of a completed migration.

Use this order:

1. `angular-21-to-22-preflight-inventory`
2. `angular-21-to-22-upgrade-orchestrator`
3. `angular-21-to-22-breaking-changes-gate`
4. `angular-21-to-22-post-upgrade-validation-gate`

Keep the hop separate from modernization. Route domain risks to the concern-first v22 satellite skills under `skills/angular/upgrades/<domain>/` or the relevant Angular domain folder.

Collect versions and constraints first. The orchestrator coordinates breaking-change checks before any authorized execution; reading order does not mean editing before checking. Proceed only with build, test and behavior evidence.
