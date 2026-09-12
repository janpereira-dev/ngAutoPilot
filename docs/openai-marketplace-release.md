# OpenAI Marketplace Release Preparation

The repository prepares one public skills-only package: `ngautopilot-skills`. Its source manifest is [`openai/plugin.json`](../openai/plugin.json); the canonical [`skills/`](../skills/) tree is transformed into a flattened public catalog during packaging, so the repository does not maintain a second editable skill catalog.

## Validate and package

The executable OpenAI validator and packager are intentionally deferred to the
follow-up tooling slice. This metadata slice does not advertise npm commands
that are not yet present in the committed branch. That follow-up must add a
read-only validator for the manifest, legal URLs, canonical skill coverage,
skills-only scope, safe paths, generated-package referential integrity, archive
limits, and the versioned submission packet, plus a deterministic packager for
the flattened public catalog and checksum.

## Release/tag path

1. Run the release validation on the intended release branch and verify the resulting generated-artifact diff.
2. Create an annotated or signed `v0.6.0` tag according to maintainer policy after all repository checks pass.
3. Build the public archive and attach the ZIP plus checksum to the matching GitHub release.
4. Submit through the applicable OpenAI workflow only after a release owner completes the human attestation.

The packet in [`openai/submission/0.6.0/`](../openai/submission/0.6.0/) is intentionally honest: it records that the package is not submitted and not OpenAI verified. It does not claim portal approval or developer verification.

`ngautopilot-tools` remains a separate local Agent Plugin/MCP distribution and is deliberately excluded from this package.

The ten manifests under `plugins/*/.codex-plugin/` remain local Codex bundle metadata. They are not separate OpenAI directory listings; the public submission is represented only by `openai/plugin.json` and its generated archive.
