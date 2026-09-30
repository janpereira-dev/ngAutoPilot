# Quality stabilization delivery

This change implements the five-phase repository quality plan. Source inspection,
local tests, remote CI, reviewer resolution, and human approval are separate evidence.
An installed adapter or generated review packet is not a host invocation or security approval.

## Completion contract

| Phase | Required deliverables | Verification |
| --- | --- | --- |
| 1 — CI and script tests | Mandatory PR validation/catalog gates; Vitest script regression tests | Current branch protection API; current-head Actions checks; script tests |
| 2 — Adapters | Quarterly review process for all ten adapters; native layout/export integration tests | Scheduled workflow; first-party source register; emitted file/format/resource assertions |
| 3 — Pack safety | Core/full transitions preserve user edits; conflicts reported before replacement; backup/restore documented | Shared/excluded file and instruction-section regressions; dry-run parity; explicit force/restore tests |
| 4 — Security review | Expanded Sage risk policy; pre-release packet generation; actual approval boundary | Packet tests/hash/provenance; release workflow dependency and protected approval, not packet creation alone |
| 5 — Contribution DX | Guardrail/subagent/adapter contribution procedures; architecture diagrams | Linked repository docs; examples aligned with implementation and checks |
| PR delivery | Publish this change; inspect every open PR; no unresolved actionable reviewer threads | Exact remote heads, paginated comments/threads, checks, review decision and mergeability |

## Safety decisions

- Existing `node:test` suites remain; Vitest is scoped to processing-script tests.
- A managed file's previous checksum remains authoritative when a conflict is preserved.
  Do not adopt the user's modified bytes as an installed checksum merely to make verification green.
- Modified files excluded by a downgrade stay tracked until explicitly resolved; they are not silently orphaned.
- Instructions outside NgAutoPilot's bounded section are user-owned. Modified bounded
  sections also require explicit force; malformed boundaries are rejected.
- `--dry-run` reports conflicts without writing files or the manifest.
- A backup is a recovery artifact, not authorization to overwrite. Default operations
  preserve conflicting files; use the documented backup command before explicit `--force`.
- No real-agent, external Sage, release approval, or merge-readiness claim may be made
  from local test results alone. Human approvals must not be fabricated or bypassed.

## Validation commands

```sh
npm run test:scripts
node --test tests/installer/installer.test.mjs
npm run skill-lab:ci
npm run release:validate
claude plugin validate .
```

Final evidence and remaining external requirements must be recorded before declaring completion.
