# Security evidence for the 0.10.0 release candidate

<!-- docs:navigation:start -->
[Español](security-release-audit.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

## Verified on 2026-10-01

- The root dependency installation audited 54 packages and reported zero vulnerabilities. The full `npm audit --json` report is retained in local release verification output; production and development dependencies are included.
- GitHub Dependabot open alerts were queried with `state=open`, `per_page=100` and pagination: none returned. Secret-scanning and code-scanning alert APIs likewise returned no open findings in the observed repository response. Empty provider responses are snapshots, not a security certificate or proof that every possible scanner ran.
- The repository content scanner passed, covering publishable text and retaining the exclusions documented in [the security model](security-model.md).
- The generated OpenAI package validator passed for all 413 canonical source skills at 0.10.0. It validates local shape, references, paths, limits and reproducibility, not live listing URLs, publisher verification or public approval.
- Native exports exercised all ten layouts, conflict refusal and source-path boundaries. Full export now handles bilingual reader navigation without copying operational source or adjacent credentials. Repository-only documents become pinned release links when absent from npm.
- Filtered Angular installation uses the resolver's actual included skills, not all skills from its unfiltered source packs. Regression evidence covers Angular 14.1 exclusions; snapshot resolution shares compatibility/range checks and rejects caller path fields.

## Required before publication

- Run the final current-head release and Skill Lab gates; record remote CI independently from local results.
- Inspect the exact-commit security packet and obtain human PR/environment approval. The packet remains NOT_APPROVED; no external Sage execution or SkillSpector audit is claimed.
- Configure the protected npm credential and rotate/revoke the historical repository-wide token. An empty release-security secret-name response is a release blocker, not permission to reuse a less protected credential.
- Verify the exact npm tarball inventory, every archive hash and the published version/latest after the protected workflow.
- Recheck third-party skill-directory audit provider, status, auditedAt and source snapshot after publication. A local source fix cannot force an external indexer to refresh.

## Limits

No universal real-host certification, full-catalog semantic score, external vulnerability certification, portal attestation, marketplace approval or global hook enforcement is claimed. Local fixtures and historical audit reports retain their original scope. Public update does not grant an agent permission to run instructions, replace user edits or upload private context.

See the ordered [publication tasks](publication-plan.md) for owner actions and each target's closing evidence.
