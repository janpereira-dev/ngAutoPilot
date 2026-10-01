# NgAutoPilot Security Model

<!-- docs:navigation:start -->
[Español](security-model.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

## Threat surface

**Reading guidance does not authorize its recommended operations.** Classify
the action, review paths and data, back up customizations, then validate the
content and actual package. Report unavailable checks separately.

NgAutoPilot is a catalog of Markdown guidance files plus a Node.js installer. The threat surface is:

1. **Skill content** — Could a skill instruct an agent to do something unsafe?
2. **Installer** — Could the installer overwrite user files, escape boundaries, or execute code?
3. **Dependencies** — Does NgAutoPilot pull in dependencies with known vulnerabilities?
4. **Distribution** — Could the npm tarball contain secrets, private paths, or unintended files?

## Mitigation per surface

### 1. Skill content

- All skills are Markdown. They guide agents; they do not execute.
- Skills are reviewed via `npm run skills:validate`, `npm run skills:validate:frontmatter`, and `npm run security:scan`.
- No skill should instruct the agent to execute `curl | sh`, download remote scripts, or run `npx` with untrusted packages.
- No skill should hardcode secrets, tokens, or private URLs.
- No skill should assume a specific OS, shell, or absolute path.
- See [trust levels](trust-levels.md) for the risk classification.

`security:scan` is a deterministic release gate. It scans every UTF-8 text file in the checkout that the public source-snapshot bundles can copy, including source skills, distributable plugin bundles, assets such as SVGs, agents, adapters, CLI and library code, configuration and schemas, Git hooks, packs, scripts, documentation, marketplace manifests, and workflow definitions. It deliberately excludes Git metadata, dependencies, generated `dist/` output, local Skill Lab caches/runs, and generated Python bytecode under `skill-lab/python/**/__pycache__/` / `scripts/**/__pycache__/`; the source-snapshot builder applies the same exclusions. It rejects unresolved merge markers, invisible or bidirectional Unicode controls, remote shell and PowerShell execution pipelines, private-key or credential-shaped material, and broad `allowed-tools` shell permissions in skill frontmatter. It is defense in depth, not proof that prose is safe.

For an optional external review, maintainers can inspect
[NVIDIA SkillSpector](https://github.com/NVIDIA/skillspector). Check the installed
version's options. Do not send unpublished or sensitive content to an external
model without reviewing the selected provider and data-egress policy.

### 2. Installer

- Path traversal is blocked: `adapters/_shared/safe-fs.mjs` resolves all paths through `createRootGuard` and rejects `..` escapes.
- Symlink escape is blocked: `lstatSync` + `realpathSync` with containment checks.
- Unmanaged files are never overwritten without `--force`.
- Apply and uninstall use adapter-declared roots; backups use a separate temporary destination. For Codex, project skills use `.agents/skills/` and instructions use root `AGENTS.md`; user skills use `~/.agents/skills/` and instructions use `~/.codex/AGENTS.md`.
- Edited manifest-owned files and managed instruction sections are preserved by default. Conflicts retain their original checksum and refuse the update before writing; only explicit `--force` authorizes replacement.
- No `postinstall` script in `package.json`.
- No shell execution; the installer uses `node:fs` exclusively.
- The install manifest (`.ngautopilot-manifest.json`) tracks every file with a SHA-256 checksum.
- Angular selections also retain the original resolved package root. Updates re-read that project's evidence, never the invocation directory. Legacy selections without this binding must be reinstalled from the original project; an unavailable original `package.json` blocks the update without writes.
- `uninstall` removes only manifest-owned files.

### 3. Dependencies

- The CLI and installer use Node.js built-ins for file operations. The CLI also requires pinned `semver` 7.8.5 through the shared Angular resolver to interpret npm toolchain dependency ranges; it is not optional. The bundled MCP plugin adds runtime dependencies `@modelcontextprotocol/server` and `zod`.
- Development tooling adds `@modelcontextprotocol/client`, `esbuild`, and `yazl` for MCP integration tests and reproducible Agent Plugin archives.
- No `postinstall`, no `preinstall`, no `prepare` scripts.

### 4. Distribution

- `package.json` `files` array explicitly lists what ships in the tarball.
- Git ignore rules and npm packaging rules serve different purposes. Inspect the actual tarball; do not infer package exclusion from `.gitignore` alone.
- `.gitattributes` normalizes line endings (LF for source, CRLF for `.ps1`).
- `npm pack --dry-run` should be run before any release to verify tarball contents.

## Incident response

If a skill is found to instruct unsafe behavior:

1. Remove the skill from source and generated bundles in the same change.
2. Publish a fixed release after catalog and bundle validation.
3. Record the incident and remediation in the changelog or advisory when disclosure is appropriate.

The active catalog accepts only `stable` skills. It does not support a publishable `blocked` or `experimental` state.
