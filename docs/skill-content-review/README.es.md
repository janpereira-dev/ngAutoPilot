# Revisión del contenido de skills — 2026-09-30

<!-- docs:navigation:start -->
[English](README.md) · [Mapa](../README.es.md) · [Inicio](../../README.es.md)

<!-- docs:navigation:end -->

## Alcance y estado

Preparada en `codex/skills-natural-behavior` sobre main `47c37b5233dbc6a21b5002e2595e31151dabbdf3` (0.9.0). Solo esa mejora se rebasó sobre la línea de release; los diez commits ajenos de la rama local original no se incluyeron en aquella PR. Los cambios de seguridad originales permanecieron intactos. Publicar esa PR no publicó ni instaló plugins.

Se analizaron los **413 entrypoints fuente** con cinco señales editoriales explícitas y validadores estructurales/frontmatter. Cambiaron **245 skills**, principalmente reducciones editoriales y contratos específicos de siete skills de pruebas/reactividad/cobertura y del gate de actualización. Se preservaron IDs, nombres, stack, categorías, estados, versiones, propiedad y compatibilidad respecto de la base. Se acotaron deliberadamente los triggers del router de pruebas.

**No es una evaluación semántica ni de invocación real de las 413 skills.** El scanner no asigna puntuación de calidad. Otras APIs y todas las rutas de activación del host quedan fuera de la evidencia conductual ejecutada.

## Cambios

- Se sustituyeron 83 descripciones Angular 22 poco naturales por tarea y versión concretas; se eliminó su párrafo explicativo genérico repetido.
- Se quitaron 161 introducciones ceremoniales de resultados, se corrigieron 33 propósitos circulares y se eliminaron IDs internos de 42 instrucciones diagnósticas.
- La prosa pasó de 208.828 a 204.086 palabras separadas por espacios: **4.742 menos netas**, incluida nueva orientación. Es tamaño, no puntuación de calidad.
- Se reforzaron Jest, rendimiento/composición/contratos RxJS, interacción de componentes, selección de runner y cobertura Sonar. El ejemplo ahora hace clic sobre un botón renderizado en lugar de emitir directamente el output.
- Se añadió una referencia Jest de búsqueda autocontenida: mocks tipados, relojes aislados, teardown, reinicio debounce, cancelación diferida y recuperación en la misma suscripción.
- Se reforzó el límite de confianza/ejecución del gate upgrade. Se eliminó el bypass de negativa del evaluador sin cambiar casos, resultados esperados, checks ni pesos. El análisis textual conservador mantiene un falso positivo conocido.
- La sincronización clásica conserva recursos sin duplicar skills hijas catalogadas. Rechaza recursos enlazados con safe-copy. La referencia Jest conserva bytes idénticos en fuente, bundle clásico y plugin portátil.
- Se actualizó la [guía de autoría](../skill-authoring.es.md), los criterios de contribución y la plantilla sin imponer ejercicios Jest a dominios ajenos.

## Evidencia

| Comprobación | Resultado | Límite |
| --- | --- | --- |
| Scanner editorial | 125 skills con señales antes; 0 después | Cinco patrones explícitos |
| Estructura/frontmatter | 413 aceptadas; 0 fallos | Forma y YAML, no comportamiento |
| Suite repositorio | 153 aprobadas; 0 fallos | Incluye nuevas regresiones editoriales/recursos |
| Skill Lab | 85 aprobadas; 0 fallos; 11 omitidas | Integraciones opcionales omitidas |
| Referencia RxJS | TypeScript estricto; 7/7 Jest | RxJS 7.8.2, Jest 30.2.0, TypeScript 5.9.3 |
| Variantes incorrectas manuales | Las seis provocaron aserciones fallidas | No son mutaciones Stryker automáticas |
| Gate upgrade | 34/38 antes; 37/38 después | Una skill; falso positivo remoto conservador |
| Distribución/marketplace | Aprobado | Generación, consistencia, esquemas, smoke y Claude |
| Validación release completa | Aprobada en d2d2e85 antes del último cambio del scorer | 153 tests y OpenAI; no se repitió después del ajuste exclusivo del scorer |
| Seguridad de contenido | Aprobada | Scanner local existente, no auditoría externa |

Evidencia legible por herramientas:

- [Auditoría del catálogo](catalog-audit.json): rutas, señales antes/después, cambios, metadatos y límites.
- [Ejemplo RxJS](rxjs-example-evidence.json): hash exacto, siete tests y seis contraejemplos manuales con aserciones fallidas.
- [Gate upgrade](upgrade-gate-evidence.json): resultados por split antes/después y hash final del scorer.

No se afirma E2E Angular TestBed/transporte HTTP, invocación real de agentes ni score Stryker. Teardown observable no demuestra que el servidor dejara de procesar una petición.

## Seguimiento de la revisión PR #65

Los cuatro hallazgos inline se reprodujeron sobre `ccbcbff5b2a05e2f7f3d73d51b669ba1d32127bc` y recibieron regresiones:

- **Consejos contradictorios:** la primera corrección cubría comandos exactos. Un P1 posterior reprodujo un bypass con consejo genérico como «Ejecuta el build». Se eliminó la excepción: menciones detectadas de trampas genéricas/exactas y ejecuciones registradas fallan aunque exista texto de negativa/inspección. Se aceptan falsos positivos antes que fingir seguridad semántica.
- **Contraejemplos Markdown:** se aceptan fences superiores con hasta tres espacios iniciales, cierres más largos del mismo carácter y bloques sin cierre hasta fin de archivo. Cierres inválidos o más cortos no terminan el bloque. Sigue [CommonMark](https://spec.commonmark.org/0.31.2/#fenced-code-blocks), pero no es un parser completo de contenedores Markdown.
- **Marcadores enlazados:** se inspeccionan SKILL.md sin seguir enlaces; se rechazan válidos y rotos antes de excluir. Solo archivos regulares identifican skills hijas independientes.
- **Destrucción parcial:** todos los recursos/manifiestos se preparan antes de publicar. Un fallo incluso en el último bundle conserva distribuciones y marketplaces anteriores byte a byte; se comprueba limpieza temporal. La sustitución es por directorio de bundle, no una única transacción atómica de todo el marketplace.

La ejecución focalizada final aprobó 30 tests: consejos genéricos antes/después de negativas, multilineales y variantes build/test/lint/scripts propios. Skill Lab aprobó 85, omitió 11 y no falló. El benchmark sin cambios queda en 37/38: `adversarial-remote-shell-001` falla conservadoramente porque el gate menciona scripts descubiertos aun exigiendo inspección y negativa. Los JSON registran ese límite y el hash del scorer. No autoriza promoción; haría falta un evaluador conductual que comprobara seguimiento seguro.

## Repetición de checks

Desde la raíz, con dependencias existentes:

~~~sh
node scripts/audit-skill-content.mjs --json
npm run skills:validate
npm run skills:validate:frontmatter
npm test
npm run skill-lab:test
node skill-lab/scripts/evaluate-skill.mjs --benchmark angular-upgrade-validation-gate --splits train,validation,test,adversarial --runs 1 --output skill-lab/runs/content-review
~~~

Para la prueba RxJS independiente, extrae el único bloque TypeScript de la referencia a search.test.ts en un proyecto aislado. Usa las versiones fijadas en el JSON, compila con strict, ES2022/CommonJS y ejecuta en Jest Node con --runInBand. La prueba temporal no añadió dependencias al repositorio.

El siguiente trabajo semántico debe usar escenarios específicos e invocación real. No conviertas resultados editoriales en una puntuación conductual universal.
