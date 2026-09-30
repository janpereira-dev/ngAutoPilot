# Sage Review Layer

The Sage-oriented packet is a reproducible security review input, **not** an approval. It can be examined with Sage or another compatible reviewer. NgAutoPilot does not pretend a packet generator invokes a proprietary reviewer or proves a host integration.

## Risk coverage

Review the changed code and its execution path, not only its filenames:

| Boundary | Required evidence |
| --- | --- |
| Install/update/uninstall and pack switches | Original checksums, user-edit preservation, retained ownership, bounded sections, explicit force, dry-run parity, rollback tests |
| Export/resource packaging | Canonical source containment, symlink refusal, path traversal, portable name collisions, binary integrity, no writes on known conflicts |
| Backup/restore | Contained paths, no arbitrary ownership adoption, precise restore target, local/private instruction exposure |
| External commands and dependency changes | No untrusted shell interpolation, lifecycle-script review, lockfile provenance, production audit, no curl-to-shell execution |
| Workflow changes | Least privilege, pinned changed actions, no fork/PR code with publishing secrets, no pull_request_target checkout of untrusted code |
| Network, MCP, and agent routing | Explicit capabilities, no credentials in artifacts, no hidden provider fallback or authority escalation |
| Skill and instruction changes | Prompt injection, invented permissions/APIs, source-versus-generated separation, version/compatibility gates, no unsupported runtime claims |
| Release and marketplace publishing | Exact source commit, full packet digest/inventory, generated drift checks, approved security verdict, artifact scope, no approval inferred from upload |

Escalate confirmed HIGH/CRITICAL prompt-injection, supply-chain, and malware findings. Other scanner heuristics are review notes after inspection, not invented security verdicts. Validation and domain review remain mandatory.

## Build and inspect

```bash
npm run review:sage:pack
```

Inspect `dist/review/sage/REVIEW.md`, `manifest.json`, and the included source. The manifest records the exact Git commit, dirty-tree state, review scope, every file's SHA-256/size, and a digest bound to the identity and complete inventory. Source README content is preserved. Symlinked sources/output parents and escaping paths fail before the old packet is replaced.

A dirty local packet is useful for development review but **cannot** satisfy release verification. After committing, regenerate the packet and review the exact clean revision.

## Release approval boundary

`.github/workflows/release.yml` first builds and uploads the packet in a read-only job for a commit on main history. The publishing job depends on that successful job and uses the protected GitHub environment `release-security`. No publishing step or npm token is available to that job until a required human reviewer approves it.

The environment is configured separately in GitHub, not by YAML alone. Required reviewer: repository maintainer `janpereira-dev`; administrator bypass disabled. Self-review prevention is intentionally off because this repository currently has one human maintainer: that person may approve a run they requested, but the agent must never submit the human approval. Adding an independent security maintainer allows stricter separation later. Recheck environment protection before every release; deleting its rules would remove this boundary.

**Before approving**, the human reviewer must inspect the exact packet and record a security review on the release PR or linked audit issue:

```text
Commit: <40-character SHA>
Packet SHA-256: <manifest packetSha256>
Reviewer: <human identity and reviewer/tool used>
Verdict: APPROVED / CHANGES_REQUIRED
Findings: <resolved high-risk findings or none, with evidence>
Validation: <links to checks and tests for this revision>
```

Only an APPROVED verdict for that exact revision authorizes the environment approval. A new commit, dirty tree, unresolved blocking finding, or changed digest requires a fresh review. Reject the deployment on CHANGES_REQUIRED; do not bypass the environment.

After approval, the job downloads the artifact from the **same workflow run**, checks commit, digest, complete inventory, and every source/packet byte before installation and again after tests/generation. Publication still runs validation and drift checks. The manifest remains `NOT_APPROVED`: approval is evidenced by the human review and GitHub deployment record, not by silently changing a generated flag.

GitHub's [environment protection documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments) and [deployment review procedure](https://docs.github.com/en/actions/how-tos/managing-workflow-runs-and-deployments/managing-deployments/reviewing-deployments) describe this external approval mechanism. A PR's Sage packet upload does not mean a release has been approved or published.
