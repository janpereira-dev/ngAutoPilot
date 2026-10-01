# Evidencia de seguridad del candidato 0.10.0

<!-- docs:navigation:start -->
[English](security-release-audit.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

## Verificado el 2026-10-01

- La instalación auditó 54 paquetes y reportó cero vulnerabilidades. El JSON completo de npm audit queda en la evidencia local; incluye dependencias de producción y desarrollo.
- Dependabot se consultó con state=open, per_page=100 y paginación: ninguna alerta. Las respuestas observadas de secret scanning y code scanning tampoco mostraron hallazgos abiertos. Son instantáneas, no certificados ni prueba de que se haya ejecutado todo scanner posible.
- El scanner de contenido del repositorio aprobó, manteniendo el alcance y exclusiones del [modelo de seguridad](security-model.es.md).
- El validador OpenAI aprobó las 413 skills canónicas en 0.10.0. Comprueba forma, referencias, rutas, límites y reproducibilidad local; no acceso real a URLs, identidad ni aprobación pública.
- Las exportaciones probaron diez layouts, rechazo de conflictos y límites fuente. La exportación completa maneja la navegación bilingüe sin copiar código operativo ni credenciales adyacentes; los documentos exclusivos del checkout usan enlaces al tag cuando faltan en npm.
- La instalación Angular usa las skills realmente incluidas, no los packs fuente sin filtrar. La regresión cubre exclusiones Angular 14.1; las instantáneas comparten compatibilidad/rangos y rechazan campos de rutas del cliente.

## Obligatorio antes de publicar

- Ejecutar los gates finales del HEAD y Skill Lab; registrar CI remoto aparte de resultados locales.
- Inspeccionar expediente exacto y obtener aprobación humana de PR y entorno. El expediente sigue NOT_APPROVED; no se afirma ejecución Sage externa ni auditoría SkillSpector.
- Configurar credencial npm protegida y rotar/revocar token histórico del repositorio. El entorno vacío bloquea el release; no autoriza usar otra credencial más amplia.
- Comprobar inventario del tarball, hashes y versión/latest publicados tras el workflow protegido.
- Revisar proveedor, estado, auditedAt y snapshot de auditorías de directorios después de publicar. Una corrección local no fuerza la reindexación externa.

## Límites

No se afirma certificación universal de hosts, puntuación semántica del catálogo, auditoría externa completa, declaraciones del portal, aceptación de marketplaces ni enforcement global de hooks. Fixtures y registros históricos conservan su alcance. Publicar no concede permiso para ejecutar instrucciones, reemplazar personalizaciones ni subir contexto privado.

Consulta las [tareas ordenadas](publication-plan.es.md) para acciones del responsable y evidencia de cierre por destino.
