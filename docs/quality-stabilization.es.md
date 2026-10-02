# Entrega de estabilización de calidad

<!-- docs:navigation:start -->
[English](quality-stabilization.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

Esta mejora implementa un plan de cinco fases. Inspección, pruebas locales, CI remoto, resolución de revisiones y aprobación humana son evidencias diferentes. Un adaptador instalado o un expediente generado no demuestra invocación del host ni aprobación de seguridad.

## Contrato de finalización

| Fase | Entrega | Verificación |
| --- | --- | --- |
| 1: CI y scripts | Gates obligatorios de PR/catálogo y regresiones Vitest | Protección de rama actual, checks del HEAD y pruebas |
| 2: Adaptadores | Revisión trimestral de diez adaptadores y exportaciones nativas | Workflow, fuentes oficiales y aserciones de layout/formato/recursos |
| 3: Packs | Transiciones conservan cambios, preflight y recuperación | Regresiones de archivos/secciones, simulación, force y restore |
| 4: Seguridad | Política Sage ampliada y expediente previo al release | Hashes, procedencia y aprobación protegida real |
| 5: Contribución | Procedimientos de guardrails/subagentes/adaptadores y diagramas | Documentación enlazada y ejemplos alineados |
| Entrega PR | Publicar, inspeccionar todas las PR y resolver hallazgos accionables | Heads exactos, comentarios paginados, checks, revisión y mergeability |

## Decisiones de seguridad

Se mantiene node:test; Vitest se limita a scripts. Cuando se conserva un conflicto, sigue siendo autoritativo el checksum anterior: no adoptes bytes del usuario para poner verify en verde. Las ediciones excluidas permanecen registradas. El texto exterior de instrucciones es del usuario; las secciones acotadas editadas requieren force y los límites malformados fallan. Dry-run no escribe. El respaldo no autoriza a reemplazar: hazlo antes de force explícito. No deduzcas invocación, auditoría externa, aprobación ni posibilidad de merge a partir de pruebas locales; no fabriques ni eludas aprobaciones.

## Validación

~~~sh
npm run test:scripts
node --test tests/installer/installer.test.mjs
npm run skill-lab:ci
npm run release:validate
claude plugin validate .
~~~

Registra resultados y requisitos externos pendientes antes de declarar finalización.

## Hallazgos de implementación verificados

- Antes se sobrescribían archivos propios editados y se perdía la propiedad de exclusiones conservadas; ahora se conserva la base original.
- La exportación histórica omitía layout, recursos y registro; las instantáneas nativas tienen checksums e índice independientes.
- El scanner de versiones confundía dependencias transitivas del lockfile con releases antiguos; se mantienen comprobaciones explícitas de identidad.
- Esbuild reabría inmediatamente su salida desde otro proceso y Windows devolvía UNKNOWN; la normalización ocurre en memoria antes de una escritura, preservando las regresiones.
- La planificación omitía recursos y la lectura textual corrompía binarios; ahora siguen propiedad, verificación, respaldo y restauración exacta.
- Los metadatos leían la versión del proyecto receptor; ahora usan el paquete instalado.

La credencial npm protegida necesita activación humana. GitHub muestra nombres, no valores. No declares seguras todas las rutas mientras siga utilizable una credencial histórica a nivel de repositorio. La aprobación humana de PR también es un requisito externo que el agente no puede fabricar.
