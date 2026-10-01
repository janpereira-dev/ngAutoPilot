# Escribe skills que cambien decisiones

<!-- docs:navigation:start -->
[English](skill-authoring.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

Una micro-skill útil nombra un problema concreto, ayuda al agente a decidir correctamente y explica cómo comprobar el resultado. Más texto no equivale a mejor orientación.

## Empieza por el contrato

Define la petición que debe activarla, otra cercana que no debe hacerlo, evidencia necesaria y resultado observable. Ajusta el proceso al riesgo: revisar documentación no implica implementar; arreglar tests no implica migrar runners; un satélite de actualización no debe apropiarse de todo el upgrade.

Mantén la fuente en `skills/`. Conserva IDs, carpetas, compatibilidad e idioma público salvo cambio explícito. Regenera distribuciones: no edites sus copias ni la caché instalada.

## Selección precisa

Sitúa la tarea y el contexto diferenciador al principio de description. Nombre y descripción se usan antes de cargar el cuerpo; introducciones repetidas y listas genéricas compiten con información útil.

En lugar de «Usa esta skill para arreglar tests; requiere validación y APIs reales», expresa la tarea: «Escribe o revisa tests Angular en proyectos Jest existentes, con mocks tipados acotados y comportamiento asíncrono determinista».

No añadas el mismo párrafo de pruebas o seguridad a todas las skills. Conserva invariantes del dominio y requisitos de seguridad/compatibilidad al acortar. Añade exclusiones cuando eviten errores de selección probables.

## Decisión y evidencia

- **Purpose:** problema concreto, no una frase circular sobre gestionar la propia skill.
- **When to Use:** síntomas o peticiones reconocibles; el nombre no es un escenario.
- **Do:** conecta la acción y la restricción que protege; usa contraejemplos pequeños.
- **Do Not:** explica el atajo tentador que cambia el contrato o excede el alcance.
- **Review Checklist:** comprobaciones observables, no «la solución es buena».
- **Expected Output:** artefacto o hallazgo útil, sin imponer ceremonias a cambios pequeños.

Coloca ejemplos condicionales extensos dentro de referencias de la carpeta y enlázalos en la decisión pertinente. Así se empaquetan autónomamente sin cargar siempre un tutorial. No conviertas gates obligatorios de seguridad en lecturas opcionales.

## Validación conductual

Pregunta qué implementación incorrecta plausible rechazaría el test recomendado.

| Riesgo | Evidencia observable |
| --- | --- |
| Búsqueda con debounce | Sin petición anticipada, reinicio de espera, argumentos normalizados, rechazo de respuesta obsoleta, teardown y recuperación tras error |
| Interacción | La acción del usuario llega al control renderizado y produce el resultado; emitir directamente un output no prueba un clic |
| Migración | Versión destino detectada y contrato de build/runtime afectado comprobado |
| Auditoría de solo lectura | Hallazgos citan evidencia inspeccionada; no se implementa ni implica implementación |

No generalices un ejercicio Jest a CSS, arquitectura o documentación. Mantén temporización y concurrencia en las skills responsables.

## Revisión e informe honesto

1. Inspecciona fuente y consumidores o rutas vecinas.
2. Verifica APIs y compatibilidad con versión instalada y fuentes autorizadas; fija referencias cuando la rama actual corresponda a otro major.
3. Lee como agente: ¿puede reconocer la tarea, decidir y saber cuándo detenerse sin material ajeno?
4. Ejecuta `node scripts/audit-skill-content.mjs` y los validadores existentes. `--json` da inventario por skill; el análisis es orientativo y de solo lectura, no puntúa semántica.
5. Ejecuta ejemplos y pruebas disponibles. Inspecciona runners y ciclos de vida antes de ejecutar; no añadas herramientas para inventar una puntuación.
6. Regenera catálogo y distribuciones y valida los paquetes.

Separa checks editoriales/estructurales, ejemplos ejecutados, experimentos manuales, mutaciones e invocación real. Aprobar una categoría no demuestra otra. Cero señales no prueba buen diseño universal.

## Referencias

- [Guía oficial OpenAI](https://learn.chatgpt.com/docs/build-skills): descripciones precisas, tareas enfocadas y activación.
- [Temporizadores Jest](https://jestjs.io/docs/timer-mocks): control determinista del reloj.
- [switchMap RxJS 7.8.2](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/operators/switchMap.ts): límite real de cancelación.
