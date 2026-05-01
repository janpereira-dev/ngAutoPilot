---
id: quality.no-dead-code.orphan-files-cleanup-monorepo
name: Orphan Files Cleanup Monorepo
description: >
  Detects and removes orphan files in monorepo workspaces by checking project graphs, build targets, tests, dynamic loaders, and runtime conventions before deleting anything.
stack:
  - JavaScript
  - TypeScript
category: no-dead-code
status: stable
version: 0.1.0
owner: NgAutoPilot
triggers:
  - orphan files monorepo
  - nx orphan files
  - workspace file cleanup
  - dead files monorepo
  - project graph cleanup
compatibility:
  runtime:
    browser: true
    node: true
---

# Orphan Files Cleanup Monorepo

## Purpose

Use this skill to detect and remove orphan files safely in monorepo workspaces.

This variant adds project-graph awareness so files are checked against workspace dependencies, targets, and conventions before deletion.

## When to Use

Use this skill when:

- the workspace is a monorepo
- build targets and project graphs matter
- stale files may be referenced by conventions or generators
- migration cleanup needs repo-wide verification

## Do

Check:

- project graph
- imports
- build targets
- test targets
- runtime conventions
- glob-based loaders
- dynamic paths

## Do Not

Avoid deleting files based only on local grep results.

Avoid ignoring generators or convention-based paths.

## Review Checklist

- [ ] The workspace graph was checked.
- [ ] Dynamic and convention-based loading was checked.
- [ ] Build and tests still pass.

## Expected Output

When this skill is used, the agent should:

1. Verify the file is orphaned in the workspace graph.
2. Check dynamic loading paths.
3. Remove dead files safely.
4. Validate the repo.
5. Keep the cleanup bounded.

