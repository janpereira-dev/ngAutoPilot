# Write skills that change decisions

A useful micro-skill names a specific problem, helps an agent make the right decision, and explains how to check the outcome. More text is not automatically more guidance.

## Start with the contract

Before writing, identify the request that should select the skill, a nearby request that should not, the evidence needed, and the observable outcome. Keep the workflow proportional to the risk. A documentation review should not trigger implementation, a test fix should not trigger runner migration, and an upgrade satellite should not take over the entire upgrade.

Keep source in `skills/`. Preserve IDs, folders, compatibility metadata, and public language unless the change explicitly requires otherwise. Regenerate distribution copies; do not hand-edit them or the installed plugin cache.

## Make selection precise

Front-load the actual job and its distinguishing context in `description`. Names and descriptions are used before the body is loaded, so repeated introductions and broad trigger lists compete with useful context.

Instead of:

> Use this skill for Fix tests. Use when work needs explicit validation and no invented APIs.

Write:

> Write or review Angular tests in existing Jest projects, with narrow typed mocks and deterministic async behavior.

Do not append the same testing or safety paragraph to every skill. Keep domain-specific invariants where they matter; preserve security and compatibility requirements even when shortening prose. Add an exclusion only when it prevents likely misrouting.

## Explain the decision, then show the evidence

- **Purpose:** state the concrete problem, not “handle this workflow for this skill.”
- **When to Use:** name recognizable symptoms or requests. Do not treat the skill's own name as a meaningful scenario.
- **Do:** connect the recommended action to the constraint it protects. Use a small counterexample when it clarifies a failure mode.
- **Do Not:** explain the tempting shortcut that changes the contract or exceeds scope.
- **Review Checklist:** use observable checks, not “the solution is good.”
- **Expected Output:** describe the useful artifact or finding. Do not force every small fix into a long ceremonial report.

Keep substantial, conditional examples in a reference within the skill folder and link it at the decision that needs it. That preserves self-contained plugin packaging without loading a tutorial for every invocation. Do not move safety gates into an optional reference if the main workflow relies on them.

## Use behavior to validate engineering guidance

For a code-changing skill, ask: what plausible incorrect implementation would its recommended test reject? Match the check to the domain:

| Concern | Observable evidence |
| --- | --- |
| Debounced search | No early request, reset wait, normalized arguments, obsolete response rejection, teardown, post-error recovery |
| Component interaction | A user action reaches the rendered control and produces the expected output; directly emitting the output is not a click test |
| Version migration | The target version is detected and the affected build or runtime contract is checked |
| Read-only audit | Findings cite inspected evidence; no implementation is performed or implied |

Do not generalize a Jest-specific drill into a requirement for CSS, architecture, or documentation skills. Keep timing and concurrency instructions in the skills that own those contracts.

## Review and report honestly

1. Inspect the source and its callers or routing neighbors before editing.
2. Verify API or compatibility claims against the installed version and authoritative sources. Pin references when a current documentation branch describes a different major version.
3. Read the changed skill as an agent would: can it identify the task, make the decision, and know when to stop without loading unrelated guidance?
4. Run `node scripts/audit-skill-content.mjs` for known editorial signals, then the existing frontmatter and skill validators. Use `--json` for the per-skill inventory. The scan is read-only and advisory; it does not grade semantic quality.
5. Run the affected executable examples and repository tests when available. Inspect runner and lifecycle scripts before execution; do not add tools solely to invent a score.
6. Regenerate the catalog and plugin distributions and validate the resulting packages.

Separate editorial/structural checks, executed examples, manual regression experiments, mutation results, and real agent invocation evidence. Passing one category does not establish another. A zero-signal scan is not proof that every skill is well designed.

## References

- [Official OpenAI skill guidance](https://learn.chatgpt.com/docs/build-skills): precise descriptions, focused jobs, progressive disclosure, and trigger testing.
- [Jest timer mocks](https://jestjs.io/docs/timer-mocks): deterministic clock control.
- [RxJS 7.8.2 switchMap](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/switchMap.ts): actual cancellation boundary.
