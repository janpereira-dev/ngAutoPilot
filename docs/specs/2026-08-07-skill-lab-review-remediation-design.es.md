# Diseño histórico de correcciones de revisión de Skill Lab

<!-- docs:navigation:start -->
[English](2026-08-07-skill-lab-review-remediation-design.md) · [Mapa](../README.es.md) · [Inicio](../../README.es.md)

> Registro histórico: conserva las decisiones y fechas originales; no demuestra el estado actual de publicación o implementación.

<!-- docs:navigation:end -->

## Alcance

Corregir defectos confirmados de la revisión de PR #33 en workflows, comprobaciones de promoción, evidencias de evaluación, seguridad y documentación. Conservar la semántica de los fixtures.

## Decisiones

- La CI estática instala el puente local, incluida su dependencia declarada `skillopt`, antes de las pruebas.
- Agregados de promoción y evidencias del repositorio deben llevar el hash del candidato activo. Se rechazan hashes ausentes o diferentes.
- Los expedientes de promoción exigen informe aceptado y hash coincidente. El parche canónico se genera desde la skill objetivo del manifiesto después de verificar su hash registrado.
- La validación repetida compara cada ejecución base con su ejecución candidata correspondiente. `winningRuns` cuenta solo comparaciones independientes sin regresiones.
- La evaluación determinista carga la rúbrica del benchmark y emite dimensiones cualitativas con nombre. La agregación utiliza los pesos de esa rúbrica.
- La seguridad del candidato aplica las mismas comprobaciones de contenido que el análisis del repositorio: marcadores de merge, controles Unicode, pipelines de shell remoto, claves privadas, tokens con forma de credencial y permisos amplios.
- Las rutas objetivo de benchmark deben resolverse dentro del catálogo de origen `skills/`.
- El rollout de SkillOpt EnvAdapter llama a `chat_target` con la skill candidata como contenido system y la petición del benchmark como contenido user. Las comprobaciones deterministas puntúan esa respuesta.
- La documentación exporta variables Bash, pasa explícitamente credenciales en el workflow de optimización y reúne evidencias del repositorio, agénticas, test y adversarial antes de la comprobación final.

## Vulnerabilidades de fixtures

Los `skill-lab/benchmarks/**/fixtures/**/package.json` de este diseño son entradas de benchmark, no dependencias distribuidas. Sus versiones antiguas de Angular son datos necesarios. Configurar Socket para excluir solo ese subárbol tras verificar la sintaxis admitida; no actualizar versiones de fixtures e invalidar su significado.

**Nota actual:** el nombre de manifiesto utilizado se explica en el [README del laboratorio](../../skill-lab/README.es.md). La referencia anterior conserva el diseño original.

## Validación

- Añadir pruebas de regresión para cada corrección de comprobaciones, rutas, repeticiones, rúbrica, puente y promoción.
- Reproducir dependencias de CI en un entorno Python limpio.
- Ejecutar `npm run skill-lab:ci`, `npm run release:validate` y pruebas específicas del puente.
- Confirmar que la seguridad de candidatos rechaza todos los patrones del analizador del repositorio.
