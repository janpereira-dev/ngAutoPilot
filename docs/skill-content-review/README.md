# Skill content review — 2026-09-30

## Scope and status

Prepared on `codex/skills-natural-behavior` against `main` at commit `47c37b5233dbc6a21b5002e2595e31151dabbdf3` (package version 0.9.0). Only this improvement was rebased onto the current release line; the ten unrelated commits from the original local branch are not included. The original checkout's existing security changes remain untouched. Publishing this PR does not release or install the plugins.

All **413 source entrypoints** were scanned for five explicit editorial signals and passed the existing structural/frontmatter validators. **245 source skills** were changed: mostly editorial reductions, with focused contract improvements in seven testing/reactive/coverage skills and the upgrade validation gate. IDs, names, stack, categories, status, versions, ownership, and compatibility metadata were checked against the base commit and preserved. Only the testing router's triggers were narrowed deliberately.

This is **not a complete semantic or real-agent evaluation of all 413 skills**. The scan assigns no quality score. Other API examples and all host routing behavior remain outside the executed behavioral evidence below.

## What changed

- Replaced 83 awkward Angular 22 descriptions with the actual job and version context; removed their identical, non-specific explainer paragraph.
- Removed 161 ceremonial output introductions, replaced 33 circular purposes with the stated capability, and removed internal IDs from 42 diagnosis instructions.
- Reduced source entrypoint prose from 208,828 to 204,086 whitespace-delimited words: **4,742 fewer words net**, including new domain guidance. This is a size measurement, not a quality score.
- Strengthened Jest, RxJS performance/composition/contracts, component interaction, testing-runner selection, and Sonar coverage guidance. The component example now clicks the rendered button rather than emitting its own output.
- Added a conditional, self-contained Jest search reference with typed mocks, isolated clocks, teardown, debounce reset, delayed-cancellation semantics, and recovery on the same subscription.
- Strengthened the upgrade gate's trust and execution boundary. Removed the evaluator's refusal bypass without changing benchmark cases, expected outcomes, checks, or weights; the conservative text check retains a known false positive.
- Fixed classic bundle synchronization to retain supporting resources without duplicating independently catalogued child skills. It rejects linked resources using the existing safe-copy helper. The Jest reference is byte-identical in its source, classic bundle, and portable testing plugin.
- Updated the [authoring guide](../skill-authoring.md), contribution criteria, and starter template without imposing a testing drill on unrelated skills.

## Evidence

| Check | Result | Meaning |
| --- | --- | --- |
| Editorial scan | 125 source skills with known signals before; 0 after | Five explicit text patterns only |
| Structural/frontmatter validation | 413 accepted; 0 failures | Catalog shape and YAML, not behavioral quality |
| Repository suite | 153 passed; 0 failed | Includes new editorial and bundle resource regressions |
| Skill Lab suite | 85 passed; 0 failed; 11 skipped | Existing optional integrations remain skipped |
| RxJS reference | Strict TypeScript check; 7/7 Jest tests | RxJS 7.8.2, Jest 30.2.0, TypeScript 5.9.3 |
| Manual incorrect variants | All 6 detected by failing assertions | Not automatic Stryker mutations |
| Upgrade gate benchmark | 34/38 before; 37/38 after | Deterministic checks for one skill; one conservative remote-shell false positive remains |
| Distribution and marketplace checks | Passed | Classic/portable generation, consistency, schema checks, smoke checks, and Claude validator |
| Full release validation | Passed at d2d2e85 before the scorer-only follow-up | Includes OpenAI package validation and all 153 repository tests; not rerun for the subsequent scorer-only change |
| Repository security content scan | Passed | Existing local content scanner; not an external security audit |

Machine-readable evidence:

- [Catalog audit](catalog-audit.json): all source paths, before/after signals, changed paths, metadata checks, and scope limits.
- [RxJS example evidence](rxjs-example-evidence.json): exact example hash, seven executed tests, and six manual counterexamples with failing test names.
- [Upgrade gate evidence](upgrade-gate-evidence.json): all split case outcomes before/after and final scorer hash.

No Angular TestBed/HTTP transport E2E, real agent invocation, or Stryker score is claimed. In particular, observable teardown does not establish that a server stopped processing a request.

## PR #65 review follow-up

All four inline review findings were reproduced against the reviewed commit `ccbcbff5b2a05e2f7f3d73d51b669ba1d32127bc` and addressed with regression coverage:

- **Contradictory safety advice:** the first correction covered exact command text only. A subsequent P1 reproduced a remaining bypass using generic advice such as "Run the build script." The refusal exception was then removed entirely: all detected generic/exact trap mentions and recorded execution fail, even alongside refusal/inspection prose. This deliberately permits false positives rather than claiming semantic safety from text matching.
- **Markdown counterexamples:** the editorial scan handles top-level fences with up to three leading spaces, longer same-character closers, and unclosed blocks through end-of-document. Invalid or shorter closers do not terminate a block. These rules follow [CommonMark fenced code blocks](https://spec.commonmark.org/0.31.2/#fenced-code-blocks); this helper is not a complete Markdown container parser.
- **Linked nested-skill markers:** `SKILL.md` markers are inspected without following links; valid and broken links are rejected before exclusion. Only regular files identify independently catalogued nested skills.
- **Partial bundle destruction:** every bundle's resources and manifest are staged before publication. A resource-copy failure, including one in the last bundle, preserves all existing distributions and marketplaces byte-for-byte. The regression also verifies temporary staging cleanup. Publication uses per-bundle directory replacement, not a single atomic transaction across the entire marketplace.

The final focused run passed all 30 tests, including generic advice before/after a refusal, multiline advice, and build/test/lint/custom-script variants. The full Skill Lab suite passed 85 tests with 11 skipped and no failures. The unchanged upgrade gate benchmark now passes 37/38: `adversarial-remote-shell-001` conservatively fails because the gate mentions discovered validation scripts, even though it requires inspection and refusal. The machine-readable evidence reflects this limitation and the final scorer hash. This result does not authorize candidate promotion; a behavioral evaluator would be needed to establish whether the guarded instructions are followed safely.

## Repeat the repository checks

Run from the repository root using the existing dependencies:

```sh
node scripts/audit-skill-content.mjs --json
npm run skills:validate
npm run skills:validate:frontmatter
npm test
npm run skill-lab:test
node skill-lab/scripts/evaluate-skill.mjs --benchmark angular-upgrade-validation-gate --splits train,validation,test,adversarial --runs 1 --output skill-lab/runs/content-review
```

For the standalone RxJS proof, extract the single TypeScript fence from the source reference into `search.test.ts` in an isolated test project. Use the pinned versions in its evidence file, compile with `strict: true`, ES2022/CommonJS, and run the compiled file in Jest's Node environment with `--runInBand`. The temporary proof did not add dependencies to this repository.

Next semantic work should use skill-specific scenarios and actual invocation evidence. Do not promote these editorial results into a catalog-wide behavioral score.
