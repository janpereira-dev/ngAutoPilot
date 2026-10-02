# Release and distribution plan: 0.10.0

<!-- docs:navigation:start -->
[Español](publication-plan.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

![Choose a distribution route](../assets/distribution-routes.svg)

**Build → validate → approve → merge → release → verify.** A complete source release is not automatic public-directory acceptance or a forced update to every user's installation.

## One inventory, distinct states

[Publication target register](../config/publication-targets.json) tracks 21 requested surfaces. `npm run release:inventory` produces `dist/release/release-inventory.json`: all canonical skill IDs/paths, packs, npm member paths and integrity, archive checksums, exact commit and target readiness. `ngautopilot platform --json` provides the broader source asset inventory. These are inventories, not proof of remote visibility.

Pi is an npm-based harness. The internal Python Skill Lab module is not a supported PyPI product. The release inventory lists all tracked Python source/packaging files, hashes and whether each is present in npm; release gates separately audit its resolved dependency tree with pinned pip-audit on Python 3.12, without source builds. A future PyPI distribution needs a separate package contract, tests and owner decision; it is not silently uploaded as part of this release.

## P0 — Security and the first complete release

- [ ] PR head passes source security scan, npm audit, skill/frontmatter/distribution validation, script/repository/Skill Lab tests, bilingual docs and graphic checks, generation drift, OpenAI archive validation and package E2E.
- [ ] Inspect the exact-commit Sage packet; record actual external reviewer findings separately. Generation never marks approval.
- [ ] Obtain the required independent human code-owner approval and pass protected `validate-release` / `validate-skill-lab` checks. The only current code owner is the PR author, who cannot approve their own PR; an authorized independent reviewer must be designated without silently changing ownership. Merge one consolidated PR without bypassing review. [Live rollout tasks](https://github.com/janpereira-dev/ngAutoPilot/issues/69).
- [ ] Release owner configures **RELEASE_NPM_TOKEN in release-security**. On 2026-10-01 the environment's secret-name API returned none; the repository still had `NPM_TOKEN`. Do not copy credentials into files or fall back to the broader token. Rotate/revoke that historical token after activating the protected route. [Trusted publishing](https://docs.npmjs.com/trusted-publishers/) is the preferred later migration once the package owner configures its OIDC binding; this release does not assume it exists.
- [ ] Create annotated tag `v0.10.0` from the reviewed merged main commit and publish the GitHub release. Its event now triggers npm and all archive builders, subject to protected environment approval. Manual retry must select the same tag.
- [ ] Approve the exact-commit release-security deployment after inspecting its packet. Recheck npm version, latest and tarball integrity, GitHub assets/checksums and Actions conclusion.

Retries accept an existing npm version only when its integrity equals the prepared archive. Different bytes fail; `latest` must not move backward. Historical npm versions and user customizations are never replaced. [npm publication rules](https://docs.npmjs.com/cli/v11/commands/npm-publish/) require a new version for changed bytes. Consumers update their chosen host/package explicitly; indexers may lag.

## P1 — Codex first: the three missing completion gates

1. **Publisher and listing:** owner selects the OpenAI organization/project, completes verified publishing identity and checks listing/icon content. The website is present in metadata; support/privacy/terms URLs could not be verified by the browser retrieval on 2026-10-01. Validate actual public content and ownership before using them. Four URLs are required for attached MCP public review, not a blanket skills-only requirement. [Official submission requirements](https://developers.openai.com/plugins/deploy/submission).
2. **Real host evidence:** install from the repository marketplace in a clean Codex profile, inspect Components/Skills, then invoke an appropriate skill with a low-risk prompt. Record host version, exact package/tag, discovered names, invocation and output. Local manifest/MCP tests are different evidence. Repeat for Claude Code using its [marketplace procedure](https://code.claude.com/docs/en/plugin-marketplaces).
3. **Public submission and approval:** validate/build the skills-only ZIP; owner uploads it, makes required policy declarations, submits, resolves findings and publishes. Record draft/submission/approval/public listing IDs separately. Skills-only packages need no MCP review cases, demo or reviewer credentials. Translated metadata import does not yet guarantee translated public listing display. Do not add MCP later without rechecking the official constraints.

No publisher identity, policy attestation, commerce declaration or country selection is fabricated. The existing SVG icon and local package checks are technical evidence, not portal approval.

## P2 — Claude and Vercel skills.sh

- Claude: GitHub marketplace install, component inventory and `/plugin:skill` invocation; submit separately to the official directory if desired. Owning a repository marketplace does not establish Anthropic directory inclusion.
- skills.sh: test a real, authorized `npx skills add janpereira-dev/ngAutoPilot` install with privacy choices intact; inspect the public listing and provider audit timestamps. [The directory uses installation telemetry](https://www.skills.sh/docs/faq), not an upload API inferred from a JSON file. Never synthesize installs, rankings or positive audit verdicts. Record external reindexing separately from a local fix.
- AutoSkills, SkillsMP, SkillsLLM, LobeHub and MCPMarket: existing builders prepare source-snapshot submission bundles. A maintainer must verify each live operator route, submit/index and save the accepted listing URL. Do not reuse a generic upload endpoint or call these bundles accepted submissions.

## P3 — OpenClaw, Hermes, Pi and OpenCode

- **ClawHub:** export reviewed skills to flat portable directories with unique owned slugs. Its workflow scans immediate skill folders; our nested source tree must not be submitted blindly. Review permissions/metadata and publisher login; dry-run `clawhub skill publish <skill-folder> --slug <owned-slug> --name <title> --version 0.10.0 --dry-run`, then publish only reviewed selections and inspect version/scan/moderation. [Official quickstart](https://docs.openclaw.ai/clawhub/quickstart). This is skill publication, not an OpenClaw executable plugin, which has additional compatibility fields. No registry token is currently configured or used here.
- **Hermes:** use its source-backed native export in a trusted project, then capture list and real invocation evidence. [Skills usage](https://hermes-agent.nousresearch.com/docs/guides/work-with-skills). Built-in/official hub inclusion is an upstream acceptance process, not something a local export can grant.
- **Pi:** `pi install npm:ngautopilot@0.10.0`, inspect `pi list` and invoke a skill after trust review. Existing `pi.skills`, prompts and `pi-package` keyword enable package discovery eligibility; [gallery visibility still needs checking](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md).
- **OpenCode:** export to its documented native layout, inspect discovery and invoke one skill. Keep the existing adapter distinct from any other product named OpenCodex; verify identity before adding a separate target.

Copilot, Cursor, Gemini and generic exports already have file-layout regressions; their runtime discovery/invocation remains a separate task, not a universal support badge.

## P4 — Chinese ecosystems without invented support

- **Alibaba Qwen Code:** add a narrow native-layout adapter for `.qwen/skills`, portable naming/resource and conflict tests, then real `/skills` discovery and invocation. [Official skills contract](https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/). Do not rename or move the source tree.
- **Qoder:** add a source-backed `.qoder/skills` export and real host invocation. [Official CLI skills](https://docs.qoder.com/cli/Skills). Its desktop local ZIP import is distinct from public marketplace acceptance.
- **Z.ai / “ZI”:** clarify target identity before creating an adapter or claiming a marketplace. [Z.ai's Claude Code integration](https://docs.z.ai/devpack/tool/claude) is a model-provider route, not proof of a separate skills registry.
- Other harnesses: add one named, sourced target at a time, with scope/trust/precedence, installation, resources, discovery, invocation, updates/removal and publishing owner. Unknown targets stay unknown rather than inheriting a universal certification.

## Evidence required to close a target

Keep version/tag + host version + install command + discovered component names + actual invocation/output + listing URL/ID (if applicable) + audit provider/status/date + owner approval. Record `source-ready`, `built`, `installed`, `host-verified`, `submitted`, `approved` and `published` separately. Complete only when that target's actual contract is verified.
