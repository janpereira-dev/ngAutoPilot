---
id: quality.no-dead-code.orphan-files-cleanup
name: Orphan Files Cleanup
description: >
  Detects and removes orphan files that no longer participate in build, tests, runtime, or documented configuration paths without breaking dynamic loading or convention-based usage.
stack:
  - JavaScript
  - TypeScript
category: no-dead-code
status: stable
version: 0.3.0
owner: NgAutoPilot
triggers:
  - orphan files
  - dead files
  - file cleanup
  - unused file
  - stale file
compatibility:
  runtime:
    browser: true
    node: true
---

# Orphan Files Cleanup

## Purpose

Use this skill to detect and remove orphan files safely.

The goal is to clean files that no longer participate in build, tests, runtime, or documented configuration paths.

The core rule is simple:

```txt
Do not delete what you cannot verify.
```

## When to Use

Use this skill when:

- migrations leave stale files behind
- features were removed
- tests or mocks are obsolete
- assets or modules are disconnected

## Do

Check:

- imports
- build config
- test config
- runtime config
- glob-based loaders
- dynamic loading paths

## Do Not

Avoid deleting files that are loaded dynamically by convention or runtime configuration unless the path is verified.

Avoid assuming the absence of imports means the file is dead.

## Review Checklist

- [ ] The file is verified orphaned.
- [ ] Dynamic or convention-based loading was checked.
- [ ] Build and tests still pass.

## Expected Output

When this skill is used, the agent should:

1. Verify the file is orphaned.
2. Check dynamic loading paths.
3. Remove dead files safely.
4. Validate the repo.
5. Keep the cleanup bounded.

