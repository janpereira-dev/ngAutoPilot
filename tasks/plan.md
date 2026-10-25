# Issue 69: verified publication and ecosystem rollout

Requested on 2026-10-25. Tracking issue: https://github.com/janpereira-dev/ngAutoPilot/issues/69.

## Scope and decisions

Finish the existing rollout checklist using current source and live evidence. Preserve historical tags, archives, npm versions, private client configuration and user edits. A generated package, discovered skill, successful invocation and accepted public listing are different outcomes.

The existing v0.10.0 tag predates security and installation fixes on main. Check those bytes before deciding whether that historical publication is still appropriate. Changed release bytes require a new version. Keep release-security approval and credentials protected; never use the historical repository token as a fallback.

## Execution order

1. Reconcile live GitHub/npm state and independently verify historical release assets.
2. Complete Qwen Code and Qoder native exports using the shared exporter, first-party contracts and independent regression expectations.
3. Build a versioned candidate, audit it, run required repository checks and exercise available native hosts in isolated projects.
4. Verify public legal/support pages and each directory's real installation/submission route. Prepare exact submission artifacts where login or operator review is required.
5. Publish only through the protected route when its credential and approval are available; verify remote bytes, update issue 69 with evidence and close only when every acceptance condition is satisfied.

## Verification and boundaries

Use Node 24 for repository gates. Reuse existing generation, export, release and audit commands. Run focused exporter regressions before the complete release/Skill Lab gates. Record host version, source commit, package hash, prompt and observed result. Record explicit authentication/approval failures without treating them as successful tests.

Directory review, publisher identity declarations and unavailable credentials remain external dependencies. Do all independent work while these are pending. Tasks and their acceptance checks are in todo.md.
