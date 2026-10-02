# Plan histórico de correcciones de revisión de Skill Lab

<!-- docs:navigation:start -->
[English](2026-08-07-skill-lab-review-remediation.md) · [Mapa](../../README.es.md) · [Inicio](../../../README.es.md)

> Registro histórico: conserva las decisiones y fechas originales; no demuestra el estado actual de publicación o implementación.

<!-- docs:navigation:end -->

> **Instrucción del plan original para agentes:** utilizar superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar tarea por tarea. Las casillas (`- [ ]`) sirven para seguimiento. Este registro no autoriza ejecutar ahora el plan ni delegar automáticamente.

**Objetivo:** hacer que CI, evaluación, evidencias de promoción y seguridad rechacen ante incertidumbre, con evidencias reproducibles.

**Arquitectura:** separar evaluación determinista y rollout con modelos SkillOpt. Extraer seguridad de contenido y contención de rutas reutilizables. La promoción consume únicamente evidencias vinculadas a un hash y manifiesto.

**Herramientas:** Node.js ESM, Python 3.11, SkillOpt 0.2, GitHub Actions y ejecutor Node.

## Restricciones globales

- Candidatos y artefactos en `skill-lab/runs/**`.
- Nunca modificar automáticamente `skills/**`.
- Conservar fixtures Angular antiguos; excluir solo rutas de fixtures del análisis Socket.
- Preservar frontmatter canónico.

---

### Tarea 1: restaurar CI limpia y documentación

**Archivos:**
- Modificar: `.github/workflows/skill-lab-static.yml`
- Modificar: `.github/workflows/skill-lab-optimize.yml`
- Modificar: `skill-lab/README.md`
- Crear: `socket.yml`
- Prueba: `skill-lab/tests/phase-d.test.mjs`

- [ ] Añadir aserción fallida: la CI instala `skill-lab/python` antes de pruebas.
- [ ] Ejecutar `npm run skill-lab:test`; fallo esperado hasta incluir instalación editable del puente.
- [ ] Instalar `python -m pip install -e skill-lab/python` en CI, mapear `OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}` al workflow de optimización y usar `export` en ejemplos Bash.
- [ ] Colocar la comprobación final después de evidencias del repositorio, agénticas, test y adversarial en README.
- [ ] Añadir `socket.yml` raíz versión 2 con `projectIgnorePaths: ["skill-lab/benchmarks/**/fixtures/**"]`.
- [ ] Ejecutar pruebas específicas; resultado esperado correcto.

### Tarea 2: vincular evidencias y promoción al candidato/manifiesto

**Archivos:**
- Modificar: `skill-lab/lib/gate-evidence.mjs`
- Modificar: `skill-lab/lib/promotion-packet.mjs`
- Modificar: `skill-lab/scripts/run-gate.mjs`
- Prueba: `skill-lab/tests/phase-d.test.mjs`

- [ ] Añadir pruebas fallidas de evidencias test/adversarial/repositorio obsoletas, informe rechazado y hash objetivo diferente.
- [ ] Hacer que `collectGateEvidence(runRoot, candidateHash)` rechace `skillHash`/`candidateHash` ausentes o distintos.
- [ ] Exigir informe aceptado y hash coincidente en `generatePromotionPacket`.
- [ ] Leer `manifest.json`, resolver `targetSkillPath` dentro de `skills/`, comparar hash con `targetSkillHash` y generar diff objetivo/candidato.
- [ ] Ejecutar pruebas específicas de promoción y comprobación; resultado esperado correcto.

### Tarea 3: utilizar repetición, rúbrica y rutas como entradas reales

**Archivos:**
- Modificar: `skill-lab/lib/deterministic-scorer.mjs`
- Modificar: `skill-lab/scripts/evaluate-skill.mjs`
- Modificar: `skill-lab/scripts/compare-results.mjs`
- Modificar: `skill-lab/scripts/snapshot-baseline.mjs`
- Modificar: `skill-lab/scripts/validate-lab.mjs`
- Modificar: `skill-lab/benchmarks/angular-upgrade-validation-gate/benchmark.yaml`
- Prueba: `skill-lab/tests/phase-d.test.mjs`

- [ ] Añadir pruebas: comparar victorias por ejecución, pesos de rúbrica afectan agregado, cambios de fixtures afectan hash de entrada y se rechaza `skills/../plugins/...`.
- [ ] Cargar `rubric.json` por benchmark y emitir dimensiones antes de agregar con pesos.
- [ ] Guardar y comparar pares base/candidato `run-N`; contar solo pares sin regresiones ni casos ausentes.
- [ ] Hash de fixtures JSON referenciados en el snapshot; incrementar versión de benchmark si cambian entradas.
- [ ] Resolver objetivo con comprobaciones de contención `path.relative(repoRoot/skills, resolvedTarget)`.
- [ ] Ejecutar el archivo de pruebas específico; resultado esperado correcto.

### Tarea 4: reutilizar todo el análisis de seguridad

**Archivos:**
- Crear: `skill-lab/lib/candidate-security.mjs`
- Modificar: `scripts/security-scan-skills.mjs`
- Modificar: `skill-lab/scripts/run-gate.mjs`
- Prueba: `skill-lab/tests/phase-d.test.mjs`

- [ ] Añadir pruebas fallidas de marcadores merge/claves privadas, valores con forma de credencial, controles invisibles, shells remotos y `allowed-tools` amplios.
- [ ] Extraer analizador de contenido que devuelva hallazgos sin recorrer archivos.
- [ ] Reutilizarlo en el analizador del repositorio y pasar `securityPassed: findings.length === 0` a la comprobación.
- [ ] Ejecutar análisis de seguridad y pruebas; resultado esperado correcto.

### Tarea 5: ejecutar rollouts del modelo objetivo SkillOpt

**Archivos:**
- Modificar: `skill-lab/python/ngautopilot_skillopt/bridge.py`
- Modificar: `skill-lab/tests/phase-d.test.mjs`

- [ ] Añadir prueba con SkillOpt simulado que exija `chat_target(system=skill_content, user=request)` durante rollout EnvAdapter.
- [ ] Importar e invocar `skillopt.model.chat_target`, conservar predicción/conversación y puntuar respuesta.
- [ ] Restringir llamadas a train y validation.
- [ ] Ejecutar pruebas del puente, `npm run skill-lab:ci` y `npm run release:validate`; resultado esperado correcto.

### Tarea 6: entregar una corrección revisable

**Archivos:** modificar únicamente los anteriores.

- [ ] Inspeccionar `git diff --check` y `git status --short`.
- [ ] Ejecutar todas las validaciones de la tarea 5.
- [ ] Crear commit solo con petición explícita; subir rama si se solicita.

Este plan conserva la propuesta histórica. Las referencias antiguas a configuración Socket o fixtures no sustituyen la [guía actual del laboratorio](../../../skill-lab/README.es.md).
