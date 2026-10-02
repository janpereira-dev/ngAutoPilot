# Plan histórico de implementación Agent Plugins 0.6.0

<!-- docs:navigation:start -->
[English](2026-08-09-agent-plugins-0-6.md) · [Mapa](../../README.es.md) · [Inicio](../../../README.es.md)

> Registro histórico: conserva las decisiones y fechas originales; no demuestra el estado actual de publicación o implementación.

<!-- docs:navigation:end -->

> **Instrucción original para agentes:** usar superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans tarea por tarea. Las casillas `- [ ]` permiten seguimiento. Este documento registra el plan; no autoriza su ejecución actual ni delegación automática.

**Objetivo:** entregar artefactos Agent Plugins 1.0 basados en packs, ZIP reproducibles y servidor MCP probado de solo lectura en `0.6.0`.

**Arquitectura:** las skills conservan formato NgAutoPilot y se convierten en Agent Skills portables solo al generar. Una librería compartida resuelve packs, impone contención, genera y valida artefactos y alimenta archivos. Un plugin MCP independiente utiliza paquetes servidor/cliente SDK v2 y análisis de catálogo/repositorio de solo lectura.

**Stack:** Node.js 24.x, ESM, ejecutor Node, `@modelcontextprotocol/server`, `@modelcontextprotocol/client`, Zod, esbuild, `yazl`, Agent Plugins 1.0 y Agent Skills.

## Restricciones globales

- Conservar `skills/` canónico; no reescribir masivamente sus 413 frontmatters.
- Seleccionar skills únicamente por prefijos y dependencias resueltos de `packs/*.json`.
- Generar exactamente cuatro plugins de skills y `ngautopilot-tools` MCP separado.
- Preservar plugins nativos, adaptadores, marketplaces y comportamiento CLI.
- Utilizar esquema `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json` y nombres Agent Skills.
- Utilizar paquetes MCP SDK v2 separados, no el monolítico anterior `@modelcontextprotocol/sdk`.
- Exigir Node `>=24.0.0 <25` localmente, en metadatos y CI.
- MCP solo lee; no modifica Git, dependencias, archivos, paquetes ni actualizaciones.
- Sincronizar `0.6.0` en skills, catálogo, packs, bundles, marketplaces, plugins portables, documentación y validación.
- No añadir validación de instalación cliente por cliente.

**Límite histórico:** los ejemplos de código, comandos, nueve herramientas y rutas locales se conservan como fueron propuestos. No prueban capacidades actuales. Los pasos de commit requieren autorización independiente. Para uso actual consulta la [guía Agent Plugins](../../agent-plugins/overview.es.md) y [mantenimiento](../../maintainer-guide.es.md).

---

## Estructura de archivos

| Ruta | Responsabilidad |
| --- | --- |
| `agent-plugins.config.json` | Salidas portables y packs de origen; nunca lista manual de skills |
| `lib/agent-plugins/config.mjs` | Cargar y validar definiciones |
| `lib/agent-plugins/pack-resolver.mjs` | Resolver dependencias y prefijos determinísticamente |
| `lib/agent-plugins/portable-skill.mjs` | Nombres, frontmatter, copia de árboles y referencias |
| `lib/agent-plugins/path-safety.mjs` | Rutas y rechazo de escapes symlink/junction/reparse point |
| `lib/agent-plugins/manifest.mjs` | Manifiestos cerrados y configuración MCP |
| `lib/agent-plugins/archive.mjs` | ZIP deterministas y SHA256SUMS |
| `lib/agent-plugins/repository.mjs` | Consultas puras de catálogo, packs, proyecto, stack, selección, compatibilidad, actualizaciones y validación |
| `lib/agent-plugins/mcp-server.mjs` | Registrar herramientas de solo lectura con Zod |
| `scripts/sync-agent-plugins.mjs` | Generar árboles desde configuración y origen |
| `scripts/validate-agent-plugins.mjs` | Validar sin modificar |
| `scripts/pack-agent-plugins.mjs` | Distribución ZIP determinista |
| `scripts/smoke-agent-plugins.mjs` | Comprobar skills y configuración MCP en límites de componentes |
| `agent-plugins/ngautopilot-tools/*` | Runtime MCP y skill operativa generados |
| `tests/agent-plugins/*.test.mjs` | Pruebas unitarias/E2E de generación, validación, archivos, repositorio y MCP |
| `docs/agent-plugins/*.md` | Formato, límites de instalación, inventario y política de evidencias |

### Tarea 1: dependencias, rutas de release y configuración

**Archivos:**
- Crear: `agent-plugins.config.json`
- Crear: `lib/agent-plugins/config.mjs`
- Modificar: `package.json`
- Modificar: `scripts/check-release-version.mjs`
- Modificar: `scripts/security-scan-skills.mjs`
- Prueba: `tests/agent-plugins/config.test.mjs`

**Interfaces:**
- Producir `loadPluginConfig(filePath): PortablePluginDefinition[]` para generador y validador.
- Añadir comandos agent-plugins:sync, validate, pack y smoke.

- [ ] **Paso 1: escribir pruebas de configuración que fallen**

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

- [ ] **Paso 2: confirmar fallo**

Ejecutar: `node --test tests/agent-plugins/config.test.mjs`.

Esperado: FAIL porque aún no existen cargador y archivo.

- [ ] **Paso 3: añadir configuración y contratos**

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

Añadir runtime `@modelcontextprotocol/server` y `zod`; desarrollo `@modelcontextprotocol/client`, `esbuild` y `yazl`. Incluir agent-plugins en files, scripts, raíces de versión y seguridad.

- [ ] **Paso 4: confirmar éxito**

Ejecutar: `node --test tests/agent-plugins/config.test.mjs`. Esperado: PASS.

- [ ] **Paso 5: commit propuesto**

```bash
git add package.json package-lock.json agent-plugins.config.json lib/agent-plugins/config.mjs scripts/check-release-version.mjs scripts/security-scan-skills.mjs tests/agent-plugins/config.test.mjs
git commit -m "feat: configure agent plugins release"
```

### Tarea 2: resolver packs y generar skills portables

**Archivos:**
- Crear: `lib/agent-plugins/pack-resolver.mjs`
- Crear: `lib/agent-plugins/portable-skill.mjs`
- Crear: `lib/agent-plugins/path-safety.mjs`
- Prueba: `tests/agent-plugins/pack-resolver.test.mjs`
- Prueba: `tests/agent-plugins/portable-skill.test.mjs`

**Interfaces:**
- `resolvePackSkills({ catalogPath, packsRoot, sourceRoot, packId }): SourceSkill[]`.
- `toPortableSkillName(id): string` y `renderPortableSkill({ sourceDir, targetDir, skill })`.
- Consumir catálogo `{ id, path, name, stack, category, status, version, triggers }` y enriquecer desde frontmatter para devolver SourceSkill con description y metadatos NgAutoPilot.

- [ ] **Paso 1: escribir pruebas fallidas**

```javascript
assert.deepEqual(
  resolvePackSkills({ catalogPath, packsRoot, sourceRoot, packId: 'ngautopilot-angular-testing' })
    .map(({ id }) => id).slice(0, 2),
  ['core.compatibility-router', 'core.project-intake'],
);
assert.equal(toPortableSkillName('core.project-intake'), 'core-project-intake');
assert.throws(() => ensureUniquePortableNames(['a.b', 'a-b']), /portable skill name collision/);
```

- [ ] **Paso 2: confirmar fallo**

Ejecutar: `node --test tests/agent-plugins/pack-resolver.test.mjs tests/agent-plugins/portable-skill.test.mjs`.

Esperado: FAIL por módulos ausentes.

- [ ] **Paso 3: implementar módulos puros mínimos**

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

resolvePackSkills debe leer frontmatter porque catalog.json no conserva description portable. renderPortableSkill copia el directorio completo, rechaza enlaces fuera de raíz antes de copiar, sobrescribe solo SKILL.md de destino y verifica enlaces Markdown dentro de la skill destino.

- [ ] **Paso 4: pruebas específicas**

Ejecutar: `node --test tests/agent-plugins/pack-resolver.test.mjs tests/agent-plugins/portable-skill.test.mjs`.

Esperado: PASS; el pack testing contiene todo Core transitivo y conserva recursos anidados.

- [ ] **Paso 5: commit propuesto**

```bash
git add lib/agent-plugins/pack-resolver.mjs lib/agent-plugins/portable-skill.mjs lib/agent-plugins/path-safety.mjs tests/agent-plugins/pack-resolver.test.mjs tests/agent-plugins/portable-skill.test.mjs
git commit -m "feat: render portable skills from packs"
```

### Tarea 3: generar y validar árboles de plugins

**Archivos:**
- Crear: `lib/agent-plugins/manifest.mjs`
- Crear: `scripts/sync-agent-plugins.mjs`
- Crear: `scripts/validate-agent-plugins.mjs`
- Crear: `tests/agent-plugins/manifest.test.mjs`
- Crear: `tests/agent-plugins/generation.test.mjs`
- Crear: artefactos generados `agent-plugins/ngautopilot-*/plugin.json`

**Interfaces:**
- `buildPluginManifest({ name, version, description, keywords }): object`.
- `syncAgentPlugins({ root }): GenerationReport[]`.
- `validateAgentPlugins({ root }): ValidationResult`, con `{ errors, plugins }`.

- [ ] **Paso 1: pruebas fallidas de manifiesto/generación**

```javascript
assert.deepEqual(Object.keys(buildPluginManifest(input)), [
  '$schema', 'name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords',
]);
assert.match(readJson('agent-plugins/ngautopilot-core/plugin.json').$schema, /plugin\.schema\.json$/);
assert.equal(readJson('agent-plugins/ngautopilot-core/plugin.json').skills, undefined);
assert.equal(validateAgentPlugins({ root }).errors.length, 0);
```

- [ ] **Paso 2: confirmar fallo**

Ejecutar: `node --test tests/agent-plugins/manifest.test.mjs tests/agent-plugins/generation.test.mjs`.

Esperado: FAIL por manifiestos y generador ausentes.

- [ ] **Paso 3: implementar manifiesto, sync y validación**

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

Exigir manifiesto raíz/campos permitidos, nombres, descubrimiento inmediato skills/<name>/SKILL.md, frontmatter Agent Skills, metadatos de cadenas, contención, nombres duplicados y trazabilidad al origen.

- [ ] **Paso 4: generar dos veces y validar**

Ejecutar: `npm run agent-plugins:sync && git diff --exit-code -- agent-plugins && npm run agent-plugins:sync && git diff --exit-code -- agent-plugins && npm run agent-plugins:validate`.

Esperado registrado: primera ejecución crea artefactos, segunda sin diferencias; cinco plugins válidos cuando la tarea 6 añade MCP. El comando original se conserva; una primera generación con cambios puede detener la cadena en git diff.

- [ ] **Paso 5: commit propuesto**

```bash
git add lib/agent-plugins/manifest.mjs scripts/sync-agent-plugins.mjs scripts/validate-agent-plugins.mjs tests/agent-plugins/manifest.test.mjs tests/agent-plugins/generation.test.mjs agent-plugins
git commit -m "feat: generate portable agent plugins"
```

### Tarea 4: archivos reproducibles y documentación

**Archivos:**
- Crear: `lib/agent-plugins/archive.mjs`
- Crear: `scripts/pack-agent-plugins.mjs`
- Crear: `tests/agent-plugins/archive.test.mjs`
- Crear: `docs/agent-plugins/overview.md`
- Crear: `docs/agent-plugins/compatibility.md`
- Modificar: `README.md`

**Interfaces:**
- `createPluginArchives({ sourceRoot, outputRoot, version }): ArchiveReport`.
- ArchiveReport contiene `{ name, sha256, size }[]` ordenados por ZIP.

- [ ] **Paso 1: pruebas fallidas de archivos**

```javascript
const first = await createPluginArchives({ sourceRoot, outputRoot: firstOutput, version: '0.6.0' });
const second = await createPluginArchives({ sourceRoot, outputRoot: secondOutput, version: '0.6.0' });
assert.deepEqual(first.archives, second.archives);
assert.match(readText(path.join(firstOutput, 'SHA256SUMS')), /^.+  ngautopilot-core-0\.6\.0\.zip$/m);
```

- [ ] **Paso 2: confirmar fallo**

Ejecutar: `node --test tests/agent-plugins/archive.test.mjs`. Esperado: FAIL por módulo ausente.

- [ ] **Paso 3: ZIP deterministas**

```javascript
const archive = new ZipFile();
for (const file of files.sort((left, right) => left.relative.localeCompare(right.relative))) {
  archive.addFile(file.absolute, file.relative, { mtime: new Date(0), mode: 0o100644, compress: true });
}
archive.end();
```

Usar rutas POSIX normalizadas, orden lexicográfico, fechas epoch, modos fijos y SHA-256 de bytes ZIP terminados. dist/agent-plugins se genera e ignora. Los checksums validan artefactos, no conformidad con clientes.

- [ ] **Paso 4: pruebas y empaquetado**

Ejecutar: `node --test tests/agent-plugins/archive.test.mjs && npm run agent-plugins:pack`.

Esperado: PASS; SHA256SUMS enumera cinco archivos.

- [ ] **Paso 5: commit propuesto**

```bash
git add lib/agent-plugins/archive.mjs scripts/pack-agent-plugins.mjs tests/agent-plugins/archive.test.mjs docs/agent-plugins README.md .gitignore
git commit -m "feat: package portable agent plugins"
```

### Tarea 5: consultas de repositorio de solo lectura

**Archivos:**
- Crear: `lib/agent-plugins/repository.mjs`
- Crear: `tests/agent-plugins/repository.test.mjs`

**Interfaces:**
- `createRepositoryTools({ root }): RepositoryTools`.
- Métodos catalogSearch, packList, packResolve, projectInspect, stackDetect, skillRoute, compatibilityCheck, upgradePlan y repositoryValidate.
- Retornar datos serializables JSON y efectuar solo readFile, readdir, stat y cálculo puro.

- [ ] **Paso 1: pruebas fallidas de solo lectura**

```javascript
const tools = createRepositoryTools({ root: fixtureRoot });
assert.equal(tools.catalogSearch({ query: 'typed forms' }).matches[0].id, 'angular.forms.angular-typed-forms-governance');
assert.deepEqual(tools.packResolve({ packId: 'ngautopilot-angular-testing' }).packs, ['ngautopilot-core', 'ngautopilot-angular-testing']);
assert.equal(tools.repositoryValidate().mutatesRepository, false);
```

- [ ] **Paso 2: confirmar fallo**

Ejecutar: `node --test tests/agent-plugins/repository.test.mjs`. Esperado: FAIL por motor ausente.

- [ ] **Paso 3: consultas puras**

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

repositoryValidate inspecciona contratos sin invocar scripts que modifican datos, como skills:catalog o plugins:sync.

- [ ] **Paso 4: prueba específica**

Ejecutar: `node --test tests/agent-plugins/repository.test.mjs`.

Esperado: PASS y hashes de fixtures idénticos antes/después de cada llamada.

- [ ] **Paso 5: commit propuesto**

```bash
git add lib/agent-plugins/repository.mjs tests/agent-plugins/repository.test.mjs
git commit -m "feat: expose read-only repository queries"
```

### Tarea 6: construir y probar runtime MCP

**Archivos:**
- Crear: `lib/agent-plugins/mcp-server.mjs`
- Crear: `mcp/server-entry.mjs`
- Crear: bundle autosuficiente generado `agent-plugins/ngautopilot-tools/bin/server.mjs`
- Crear: `agent-plugins/ngautopilot-tools/mcp.json`
- Crear: `agent-plugins/ngautopilot-tools/skills/ngautopilot-tooling/SKILL.md`
- Crear: `tests/agent-plugins/mcp-server.test.mjs`
- Modificar: `scripts/sync-agent-plugins.mjs`

**Interfaces:**
- `createMcpServer({ root, version }): McpServer`.
- Utiliza createRepositoryTools de la tarea 5.
- Registra exactamente nueve nombres del alcance aprobado original.

- [ ] **Paso 1: pruebas fallidas de integración**

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

- [ ] **Paso 2: confirmar fallo**

Ejecutar: `node --test tests/agent-plugins/mcp-server.test.mjs`. Esperado: FAIL por módulo ausente.

- [ ] **Paso 3: registrar herramientas con esquemas Zod estrictos**

```javascript
server.registerTool('pack.resolve', {
  description: 'Resolve a NgAutoPilot pack and its transitive dependencies without changing repository files.',
  inputSchema: z.object({ packId: z.string().min(1).max(128) }),
}, async ({ packId }) => textResult(tools.packResolve({ packId })));
```

Utilizar StdioServerTransport en mcp/server-entry.mjs y diagnósticos solo en stderr. Configurar esbuild con bundle: true, platform: node, format: esm, target: node18 y salida agent-plugins/ngautopilot-tools/bin/server.mjs para incluir runtime en ZIP. Generar mcp.json cerrado:

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

- [ ] **Paso 4: MCP y validación portable**

Ejecutar: `node --test tests/agent-plugins/mcp-server.test.mjs && npm run agent-plugins:sync && npm run agent-plugins:validate && npm run agent-plugins:smoke`.

Esperado: PASS; cinco plugins válidos, llamadas de solo lectura y errores MCP para entradas inválidas.

- [ ] **Paso 5: commit propuesto**

```bash
git add lib/agent-plugins/mcp-server.mjs mcp/server-entry.mjs agent-plugins/ngautopilot-tools tests/agent-plugins/mcp-server.test.mjs scripts/sync-agent-plugins.mjs
git commit -m "feat: add read-only ngautopilot mcp"
```

### Tarea 7: integrar release 0.6.0 y regresiones

**Archivos:**
- Modificar: `scripts/bump-release-version.mjs`
- Modificar: `scripts/check-release-version.mjs`
- Modificar: `package.json`
- Modificar: `catalog.json` generado
- Modificar: versiones generadas `skills/**/SKILL.md`
- Modificar: `packs/*.json`
- Modificar: `plugins/**/plugin.json` generado
- Modificar: `.agents/plugins/marketplace.json` generado
- Modificar: `.claude-plugin/marketplace.json` generado
- Modificar: `CHANGELOG.md`
- Modificar: `README.md`
- Modificar: `docs/agent-plugins/overview.md`
- Prueba: `tests/bump-release-version.test.mjs`

**Interfaces:**
- release:bump-version 0.6.0 actualiza manifiestos portables y salidas derivadas junto a las superficies existentes.
- release:validate comprueba origen, bundles nativos, portables, MCP smoke y paquete.

- [ ] **Paso 1: pruebas fallidas de versión y comprobaciones**

```javascript
assert.equal(readJson('agent-plugins/ngautopilot-core/plugin.json').version, '0.6.0');
assert.match(readText('package.json'), /"agent-plugins:validate"/);
assert.match(readText('package.json'), /agent-plugins:sync/);
```

- [ ] **Paso 2: confirmar fallo**

Ejecutar: `node --test tests/bump-release-version.test.mjs`. Esperado: FAIL por manifiestos portables fuera de aserciones.

- [ ] **Paso 3: scripts y metadatos generados**

Ampliar raíces a agent-plugins y agent-plugins.config.json. Añadir sync, validate y smoke entre plugins:sync nativo y validación de marketplaces en release:validate. Changelog y README indican vista previa de Agent Plugins 1.0.0 y conformidad por cliente pendiente de cierre.

- [ ] **Paso 4: comprobación completa**

Ejecutar: `npm run release:bump-version -- 0.6.0 && npm run release:validate && npm run agent-plugins:pack && npm run pack:dry`.

Esperado: versiones 0.6.0, 413 skills válidas, plugins nativos/marketplaces válidos, plugins portables y MCP smoke correctos, npm incluye agent-plugins y excluye dist.

- [ ] **Paso 5: commit propuesto**

```bash
git add package.json package-lock.json catalog.json skills packs plugins agent-plugins .agents .claude-plugin scripts README.md CHANGELOG.md docs tests
git commit -m "feat: release agent plugins preview 0.6.0"
```

### Tarea 8: revisión final de integridad

**Archivos:** ninguno salvo defecto de comprobaciones anteriores.

**Interfaces:** confirmar compatibilidad de todos los contratos exportados.

- [ ] **Paso 1: regeneración limpia**

Ejecutar: `npm run skills:catalog && npm run plugins:sync && npm run agent-plugins:sync && git diff --exit-code -- catalog.json plugins agent-plugins .agents .claude-plugin`.

Esperado: PASS sin diferencias generadas.

- [ ] **Paso 2: seguridad y pruebas**

Ejecutar: `npm run security:scan && npm test && npm run marketplaces:validate && npm run consistency:validate && npm run distribution:validate && npm run agent-plugins:validate && npm run agent-plugins:smoke`.

Esperado: PASS sin hallazgos, fallos, regresiones de marketplace ni infracciones portables.

- [ ] **Paso 3: reproducibilidad**

Ejecutar, en la shell Windows indicada por el ejemplo original:

`npm run agent-plugins:pack && copy /Y dist\agent-plugins\SHA256SUMS C:\Users\cowbo\AppData\Local\Temp\ngautopilot-first-sha256sums && npm run agent-plugins:pack && fc /B dist\agent-plugins\SHA256SUMS C:\Users\cowbo\AppData\Local\Temp\ngautopilot-first-sha256sums`

Esperado registrado: `FC: no differences encountered`. Las rutas personales y copy/fc pertenecen al ejemplo histórico de cmd.exe, no a comandos PowerShell portables.

- [ ] **Paso 4: estado final y commits**

Ejecutar: `git status --short && git log --oneline main..HEAD && git diff --stat main...HEAD`.

Esperado: únicamente cambios intencionados de Agent Plugins 0.6.0 y documentación de diseño/plan.
