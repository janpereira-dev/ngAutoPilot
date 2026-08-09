# Agent Plugins 0.6.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship pack-driven Agent Plugins 1.0 artifacts, reproducible ZIP distribution, and a tested read-only NgAutoPilot MCP server in release `0.6.0`.

**Architecture:** Source skills remain NgAutoPilot-specific and are rendered into portable Agent Skills only during generation. A shared portable-plugin library resolves packs, enforces containment, renders artifacts, validates them, and feeds archive generation. A separate MCP plugin uses current MCP SDK v2 server/client packages and only read-only catalog and repository analysis.

**Tech Stack:** Node.js 18.18+, ESM, Node test runner, `@modelcontextprotocol/server`, `@modelcontextprotocol/client`, Zod, esbuild, `yazl`, Agent Plugins 1.0, Agent Skills.

## Global Constraints

- Keep `skills/` canonical; never bulk-rewrite its 413 frontmatters for portability.
- Select portable plugin skills solely by resolved `packs/*.json` prefixes and dependencies.
- Generate exactly four skill plugins plus separate `ngautopilot-tools` MCP plugin.
- Preserve existing `plugins/`, adapters, marketplaces, and CLI behavior.
- Use Agent Plugins schema `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json` and Agent Skills naming rules.
- Use current split MCP SDK v2 packages, not retired monolithic `@modelcontextprotocol/sdk`.
- MCP tools may read only; no Git, dependency, filesystem, package, or upgrade mutation.
- Release target is `0.6.0`; version synchronization includes source skills, catalog, packs, native bundles, marketplaces, portable plugins, docs, and release validation.
- Do not add client-by-client installation validation to this change.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| `agent-plugins.config.json` | Declares portable outputs and source packs; never lists skills manually. |
| `lib/agent-plugins/pack-resolver.mjs` | Resolves pack dependencies and catalog skill prefixes deterministically. |
| `lib/agent-plugins/portable-skill.mjs` | Creates portable names, transforms frontmatter, copies skill trees, validates references. |
| `lib/agent-plugins/path-safety.mjs` | Resolves paths and rejects symlink/junction/reparse-point escapes. |
| `lib/agent-plugins/manifest.mjs` | Builds and validates closed Agent Plugins manifests and MCP config. |
| `lib/agent-plugins/archive.mjs` | Builds deterministic ZIPs and `SHA256SUMS`. |
| `lib/agent-plugins/repository.mjs` | Pure read-only catalog, pack, project, stack, route, compatibility, upgrade, and validation queries. |
| `lib/agent-plugins/mcp-server.mjs` | Registers Zod-validated read-only MCP tools. |
| `scripts/sync-agent-plugins.mjs` | Produces portable plugin trees from config and sources. |
| `scripts/validate-agent-plugins.mjs` | Validates generated artifacts without mutating them. |
| `scripts/pack-agent-plugins.mjs` | Produces deterministic ZIP distribution. |
| `scripts/smoke-agent-plugins.mjs` | Tests rendered skills and MCP configuration at component boundaries. |
| `agent-plugins/ngautopilot-tools/*` | Generated MCP plugin runtime and operational skill. |
| `tests/agent-plugins/*.test.mjs` | Unit and end-to-end generator, validation, archive, repository, and MCP coverage. |
| `docs/agent-plugins/*.md` | Format, installation boundaries, artifact inventory, and compatibility evidence policy. |

### Task 1: Add Dependencies, Release Paths, and Plugin Configuration

**Files:**
- Create: `agent-plugins.config.json`
- Modify: `package.json`
- Modify: `scripts/check-release-version.mjs`
- Modify: `scripts/security-scan-skills.mjs`
- Test: `tests/agent-plugins/config.test.mjs`

**Interfaces:**
- Produces `loadPluginConfig(filePath): PortablePluginDefinition[]` consumed by generator and validator.
- Adds npm commands `agent-plugins:sync`, `agent-plugins:validate`, `agent-plugins:pack`, and `agent-plugins:smoke`.

- [ ] **Step 1: Write failing configuration tests**

```javascript
test('defines four pack-driven skill plugins and one MCP plugin', () => {
  const config = loadPluginConfig(configPath);
  assert.deepEqual(config.map(({ name }) => name), [
    'ngautopilot-core',
    'ngautopilot-angular-architecture',
    'ngautopilot-angular-testing',
    'ngautopilot-angular-21-to-22',
    'ngautopilot-tools',
  ]);
  assert.equal(config.filter(({ kind }) => kind === 'skills').length, 4);
  assert.equal(config.find(({ name }) => name === 'ngautopilot-tools').kind, 'mcp');
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test tests/agent-plugins/config.test.mjs`

Expected: FAIL because config loader and file do not exist.

- [ ] **Step 3: Add config and package contracts**

```json
{
  "$schemaVersion": "1.0.0",
  "plugins": [
    { "name": "ngautopilot-core", "kind": "skills", "pack": "ngautopilot-core", "enabled": true },
    { "name": "ngautopilot-angular-architecture", "kind": "skills", "pack": "ngautopilot-angular-foundations", "enabled": true },
    { "name": "ngautopilot-angular-testing", "kind": "skills", "pack": "ngautopilot-angular-testing", "enabled": true },
    { "name": "ngautopilot-angular-21-to-22", "kind": "skills", "pack": "ngautopilot-angular-21-to-22", "enabled": true },
    { "name": "ngautopilot-tools", "kind": "mcp", "enabled": true }
  ]
}
```

Add runtime dependencies `@modelcontextprotocol/server` and `zod`; add development dependencies `@modelcontextprotocol/client`, `esbuild`, and `yazl`. Add `agent-plugins` to package `files`, scripts to `package.json`, `agent-plugins` to release-version roots, and `agent-plugins` to security scan roots.

- [ ] **Step 4: Run test to verify pass**

Run: `node --test tests/agent-plugins/config.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json agent-plugins.config.json scripts/check-release-version.mjs scripts/security-scan-skills.mjs tests/agent-plugins/config.test.mjs
git commit -m "feat: configure agent plugins release"
```

### Task 2: Implement Pure Pack Resolution and Portable Skill Rendering

**Files:**
- Create: `lib/agent-plugins/pack-resolver.mjs`
- Create: `lib/agent-plugins/portable-skill.mjs`
- Create: `lib/agent-plugins/path-safety.mjs`
- Test: `tests/agent-plugins/pack-resolver.test.mjs`
- Test: `tests/agent-plugins/portable-skill.test.mjs`

**Interfaces:**
- Produces `resolvePackSkills({ catalogPath, packsRoot, sourceRoot, packId }): SourceSkill[]`.
- Produces `toPortableSkillName(id): string` and `renderPortableSkill({ sourceDir, targetDir, skill })`.
- Consumes catalog objects shaped `{ id, path, name, stack, category, status, version, triggers }` and enriches them from source `SKILL.md` frontmatter to return `SourceSkill` objects with `description` and NgAutoPilot metadata.

- [ ] **Step 1: Write failing resolver and renderer tests**

```javascript
assert.deepEqual(
  resolvePackSkills({ catalogPath, packsRoot, sourceRoot, packId: 'ngautopilot-angular-testing' })
    .map(({ id }) => id).slice(0, 2),
  ['core.compatibility-router', 'core.project-intake'],
);
assert.equal(toPortableSkillName('core.project-intake'), 'core-project-intake');
assert.throws(() => ensureUniquePortableNames(['a.b', 'a-b']), /portable skill name collision/);
```

- [ ] **Step 2: Run tests to verify failure**

Run: `node --test tests/agent-plugins/pack-resolver.test.mjs tests/agent-plugins/portable-skill.test.mjs`

Expected: FAIL because module files do not exist.

- [ ] **Step 3: Implement minimal pure modules**

```javascript
export function toPortableSkillName(id) {
  const name = id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!name || name.length > 64 || name.includes('--')) throw new Error(`invalid portable skill name: ${id}`);
  return name;
}

export function renderFrontmatter(source, skill, portableName) {
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  return `---\nname: ${portableName}\ndescription: ${skill.description}\nlicense: MIT\nmetadata:\n  ngautopilot-id: "${skill.id}"\n  ngautopilot-source: "${skill.path}"\n  ngautopilot-version: "${skill.version}"\n---\n\n${body}`;
}
```

`resolvePackSkills` must read selected source frontmatter because `catalog.json` does not retain portable `description`. `renderPortableSkill` must copy the complete skill directory, reject outside-root links before copying, overwrite only target `SKILL.md`, and verify each Markdown relative link resolves inside its destination skill root.

- [ ] **Step 4: Run focused tests**

Run: `node --test tests/agent-plugins/pack-resolver.test.mjs tests/agent-plugins/portable-skill.test.mjs`

Expected: PASS; testing pack includes all transitive Core skills and copied nested assets survive.

- [ ] **Step 5: Commit**

```bash
git add lib/agent-plugins/pack-resolver.mjs lib/agent-plugins/portable-skill.mjs lib/agent-plugins/path-safety.mjs tests/agent-plugins/pack-resolver.test.mjs tests/agent-plugins/portable-skill.test.mjs
git commit -m "feat: render portable skills from packs"
```

### Task 3: Generate and Validate Agent Plugin Trees

**Files:**
- Create: `lib/agent-plugins/manifest.mjs`
- Create: `scripts/sync-agent-plugins.mjs`
- Create: `scripts/validate-agent-plugins.mjs`
- Create: `tests/agent-plugins/manifest.test.mjs`
- Create: `tests/agent-plugins/generation.test.mjs`
- Create: `agent-plugins/ngautopilot-*/plugin.json` generated artifacts

**Interfaces:**
- Produces `buildPluginManifest({ name, version, description, keywords }): object`.
- Produces `syncAgentPlugins({ root }): GenerationReport[]`.
- Produces `validateAgentPlugins({ root }): ValidationResult` with `{ errors, plugins }`.

- [ ] **Step 1: Write failing manifest and generation tests**

```javascript
assert.deepEqual(Object.keys(buildPluginManifest(input)), [
  '$schema', 'name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords',
]);
assert.match(readJson('agent-plugins/ngautopilot-core/plugin.json').$schema, /plugin\.schema\.json$/);
assert.equal(readJson('agent-plugins/ngautopilot-core/plugin.json').skills, undefined);
assert.equal(validateAgentPlugins({ root }).errors.length, 0);
```

- [ ] **Step 2: Run tests to verify failure**

Run: `node --test tests/agent-plugins/manifest.test.mjs tests/agent-plugins/generation.test.mjs`

Expected: FAIL because portable manifests and generator do not exist.

- [ ] **Step 3: Implement manifest, sync, and validation**

```javascript
export const PLUGIN_SCHEMA = 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json';

export function buildPluginManifest({ name, version, description, keywords }) {
  return {
    $schema: PLUGIN_SCHEMA,
    name,
    version,
    description,
    author: { name: 'Jan Pereira', url: 'https://github.com/janpereira-dev' },
    homepage: 'https://github.com/janpereira-dev/ngAutoPilot',
    repository: 'https://github.com/janpereira-dev/ngAutoPilot',
    license: 'MIT',
    keywords,
  };
}
```

The validator must enforce root manifest existence and allowed fields, portable plugin name rules, immediate `skills/<name>/SKILL.md` discovery, Agent Skills frontmatter constraints, metadata string values, path containment, duplicate portable names, and generated skill source traceability.

- [ ] **Step 4: Run generator twice and validate**

Run: `npm run agent-plugins:sync && git diff --exit-code -- agent-plugins && npm run agent-plugins:sync && git diff --exit-code -- agent-plugins && npm run agent-plugins:validate`

Expected: first run creates artifacts; second run creates no diff; validator reports five valid plugins after Task 6 adds MCP.

- [ ] **Step 5: Commit**

```bash
git add lib/agent-plugins/manifest.mjs scripts/sync-agent-plugins.mjs scripts/validate-agent-plugins.mjs tests/agent-plugins/manifest.test.mjs tests/agent-plugins/generation.test.mjs agent-plugins
git commit -m "feat: generate portable agent plugins"
```

### Task 4: Add Reproducible Distribution Archives and Artifact Documentation

**Files:**
- Create: `lib/agent-plugins/archive.mjs`
- Create: `scripts/pack-agent-plugins.mjs`
- Create: `tests/agent-plugins/archive.test.mjs`
- Create: `docs/agent-plugins/overview.md`
- Create: `docs/agent-plugins/compatibility.md`
- Modify: `README.md`

**Interfaces:**
- Produces `createPluginArchives({ sourceRoot, outputRoot, version }): ArchiveReport`.
- `ArchiveReport` contains sorted `{ name, sha256, size }[]` for every plugin ZIP.

- [ ] **Step 1: Write failing archive tests**

```javascript
const first = await createPluginArchives({ sourceRoot, outputRoot: firstOutput, version: '0.6.0' });
const second = await createPluginArchives({ sourceRoot, outputRoot: secondOutput, version: '0.6.0' });
assert.deepEqual(first.archives, second.archives);
assert.match(readText(path.join(firstOutput, 'SHA256SUMS')), /^.+  ngautopilot-core-0\.6\.0\.zip$/m);
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test tests/agent-plugins/archive.test.mjs`

Expected: FAIL because archive module does not exist.

- [ ] **Step 3: Implement deterministic ZIP creation**

```javascript
const archive = new ZipFile();
for (const file of files.sort((left, right) => left.relative.localeCompare(right.relative))) {
  archive.addFile(file.absolute, file.relative, { mtime: new Date(0), mode: 0o100644, compress: true });
}
archive.end();
```

Use normalized POSIX paths, lexicographic order, epoch timestamps, fixed modes, and SHA-256 of completed ZIP bytes. `dist/agent-plugins/` is generated and ignored; docs must state checksums validate artifacts but do not replace client conformance testing.

- [ ] **Step 4: Run archive tests and pack command**

Run: `node --test tests/agent-plugins/archive.test.mjs && npm run agent-plugins:pack`

Expected: PASS; `dist/agent-plugins/SHA256SUMS` lists five archives.

- [ ] **Step 5: Commit**

```bash
git add lib/agent-plugins/archive.mjs scripts/pack-agent-plugins.mjs tests/agent-plugins/archive.test.mjs docs/agent-plugins README.md .gitignore
git commit -m "feat: package portable agent plugins"
```

### Task 5: Implement Read-Only Repository Query Engine

**Files:**
- Create: `lib/agent-plugins/repository.mjs`
- Create: `tests/agent-plugins/repository.test.mjs`

**Interfaces:**
- Produces `createRepositoryTools({ root }): RepositoryTools`.
- `RepositoryTools` exposes `catalogSearch`, `packList`, `packResolve`, `projectInspect`, `stackDetect`, `skillRoute`, `compatibilityCheck`, `upgradePlan`, and `repositoryValidate`.
- Every method returns JSON-serializable data and performs only `readFile`, `readdir`, `stat`, and pure computation.

- [ ] **Step 1: Write failing read-only behavior tests**

```javascript
const tools = createRepositoryTools({ root: fixtureRoot });
assert.equal(tools.catalogSearch({ query: 'typed forms' }).matches[0].id, 'angular.forms.angular-typed-forms-governance');
assert.deepEqual(tools.packResolve({ packId: 'ngautopilot-angular-testing' }).packs, ['ngautopilot-core', 'ngautopilot-angular-testing']);
assert.equal(tools.repositoryValidate().mutatesRepository, false);
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test tests/agent-plugins/repository.test.mjs`

Expected: FAIL because repository engine does not exist.

- [ ] **Step 3: Implement pure queries**

```javascript
export function createRepositoryTools({ root }) {
  return Object.freeze({
    catalogSearch: ({ query, limit = 10 }) => searchCatalog(readCatalog(root), query, limit),
    packList: () => listPacks(root),
    packResolve: ({ packId }) => resolvePack(root, packId),
    projectInspect: () => inspectProject(root),
    stackDetect: () => detectStack(root),
    skillRoute: ({ request }) => routeSkills(readCatalog(root), request),
    compatibilityCheck: ({ target }) => checkCompatibility(root, target),
    upgradePlan: ({ from, to }) => planUpgrade(from, to),
    repositoryValidate: () => validateRepositoryReadOnly(root),
  });
}
```

`repositoryValidate` must inspect existing contracts without invoking mutating scripts such as `skills:catalog` or `plugins:sync`.

- [ ] **Step 4: Run focused test**

Run: `node --test tests/agent-plugins/repository.test.mjs`

Expected: PASS and fixture content hashes are unchanged before and after every call.

- [ ] **Step 5: Commit**

```bash
git add lib/agent-plugins/repository.mjs tests/agent-plugins/repository.test.mjs
git commit -m "feat: expose read-only repository queries"
```

### Task 6: Build and Test MCP Plugin Runtime

**Files:**
- Create: `lib/agent-plugins/mcp-server.mjs`
- Create: `mcp/server-entry.mjs`
- Create: `agent-plugins/ngautopilot-tools/bin/server.mjs` generated self-contained bundle
- Create: `agent-plugins/ngautopilot-tools/mcp.json`
- Create: `agent-plugins/ngautopilot-tools/skills/ngautopilot-tooling/SKILL.md`
- Create: `tests/agent-plugins/mcp-server.test.mjs`
- Modify: `scripts/sync-agent-plugins.mjs`

**Interfaces:**
- Produces `createMcpServer({ root, version }): McpServer`.
- Uses `createRepositoryTools({ root })` from Task 5.
- Registers exactly nine tool names from approved scope.

- [ ] **Step 1: Write failing MCP integration tests**

```javascript
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
const server = createMcpServer({ root: fixtureRoot, version: '0.6.0' });
await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
const { tools } = await client.listTools();
assert.deepEqual(tools.map(({ name }) => name).sort(), [
  'catalog.search', 'compatibility.check', 'pack.list', 'pack.resolve', 'project.inspect',
  'repository.validate', 'skill.route', 'stack.detect', 'upgrade.plan',
]);
assert.equal((await client.callTool({ name: 'pack.resolve', arguments: { packId: 'missing' } })).isError, true);
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test tests/agent-plugins/mcp-server.test.mjs`

Expected: FAIL because MCP server module does not exist.

- [ ] **Step 3: Register tools with strict Zod input schemas**

```javascript
server.registerTool('pack.resolve', {
  description: 'Resolve a NgAutoPilot pack and its transitive dependencies without changing repository files.',
  inputSchema: z.object({ packId: z.string().min(1).max(128) }),
}, async ({ packId }) => textResult(tools.packResolve({ packId })));
```

Use `StdioServerTransport` in `mcp/server-entry.mjs`; write operational diagnostics only to stderr. Run esbuild with `bundle: true`, `platform: 'node'`, `format: 'esm'`, `target: 'node18'`, and `outfile: 'agent-plugins/ngautopilot-tools/bin/server.mjs` so standalone ZIPs contain their MCP runtime. Generate this closed `mcp.json`:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "ngautopilot": {
      "type": "stdio",
      "command": "node",
      "args": ["${PLUGIN_ROOT}/bin/server.mjs"],
      "cwd": "${PLUGIN_ROOT}"
    }
  }
}
```

- [ ] **Step 4: Run MCP and portable validation**

Run: `node --test tests/agent-plugins/mcp-server.test.mjs && npm run agent-plugins:sync && npm run agent-plugins:validate && npm run agent-plugins:smoke`

Expected: PASS; the five generated plugins validate, all MCP tool calls are read-only, and invalid inputs return MCP errors.

- [ ] **Step 5: Commit**

```bash
git add lib/agent-plugins/mcp-server.mjs mcp/server-entry.mjs agent-plugins/ngautopilot-tools tests/agent-plugins/mcp-server.test.mjs scripts/sync-agent-plugins.mjs
git commit -m "feat: add read-only ngautopilot mcp"
```

### Task 7: Integrate Release 0.6.0 and Full Regression Gates

**Files:**
- Modify: `scripts/bump-release-version.mjs`
- Modify: `scripts/check-release-version.mjs`
- Modify: `package.json`
- Modify: `catalog.json` generated
- Modify: `skills/**/SKILL.md` generated version changes
- Modify: `packs/*.json`
- Modify: `plugins/**/plugin.json` generated
- Modify: `.agents/plugins/marketplace.json` generated
- Modify: `.claude-plugin/marketplace.json` generated
- Modify: `CHANGELOG.md`
- Modify: `README.md`
- Modify: `docs/agent-plugins/overview.md`
- Test: `tests/bump-release-version.test.mjs`

**Interfaces:**
- `release:bump-version 0.6.0` updates portable plugin manifests and Agent Plugin configuration-derived outputs together with existing release surfaces.
- `release:validate` runs source, native bundle, portable plugin, MCP smoke, and package checks.

- [ ] **Step 1: Write failing version and gate tests**

```javascript
assert.equal(readJson('agent-plugins/ngautopilot-core/plugin.json').version, '0.6.0');
assert.match(readText('package.json'), /"agent-plugins:validate"/);
assert.match(readText('package.json'), /agent-plugins:sync/);
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test tests/bump-release-version.test.mjs`

Expected: FAIL because portable plugin manifests are not included in release-version assertions.

- [ ] **Step 3: Update release scripts and generated metadata**

Extend version replacement roots to include `agent-plugins` and `agent-plugins.config.json`. Add `agent-plugins:sync`, `agent-plugins:validate`, and `agent-plugins:smoke` between native `plugins:sync` and marketplace validation in `release:validate`. Update changelog and README to state Agent Plugins `1.0.0` support is Preview and that client conformance remains release-close work.

- [ ] **Step 4: Execute complete release gate**

Run: `npm run release:bump-version -- 0.6.0 && npm run release:validate && npm run agent-plugins:pack && npm run pack:dry`

Expected: all source and generated version contracts report `0.6.0`; 413 source skills validate; native plugins and marketplaces remain valid; portable plugins and MCP smoke pass; package dry run includes `agent-plugins` and excludes `dist`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json catalog.json skills packs plugins agent-plugins .agents .claude-plugin scripts README.md CHANGELOG.md docs tests
git commit -m "feat: release agent plugins preview 0.6.0"
```

### Task 8: Final Integrity Review

**Files:**
- Modify: none unless a preceding gate finds a defect.

**Interfaces:**
- Confirms all preceding exported contracts remain compatible.

- [ ] **Step 1: Verify clean regeneration**

Run: `npm run skills:catalog && npm run plugins:sync && npm run agent-plugins:sync && git diff --exit-code -- catalog.json plugins agent-plugins .agents .claude-plugin`

Expected: PASS with no generated drift.

- [ ] **Step 2: Verify security and test gates**

Run: `npm run security:scan && npm test && npm run marketplaces:validate && npm run consistency:validate && npm run distribution:validate && npm run agent-plugins:validate && npm run agent-plugins:smoke`

Expected: PASS with no security findings, test failures, marketplace regressions, or portable plugin violations.

- [ ] **Step 3: Verify distribution artifacts reproducibility**

Run: `npm run agent-plugins:pack && copy /Y dist\agent-plugins\SHA256SUMS C:\Users\cowbo\AppData\Local\Temp\ngautopilot-first-sha256sums && npm run agent-plugins:pack && fc /B dist\agent-plugins\SHA256SUMS C:\Users\cowbo\AppData\Local\Temp\ngautopilot-first-sha256sums`

Expected: `FC: no differences encountered`.

- [ ] **Step 4: Inspect final worktree and commits**

Run: `git status --short && git log --oneline main..HEAD && git diff --stat main...HEAD`

Expected: only intentional `0.6.0` Agent Plugins changes and design/plan documentation.
