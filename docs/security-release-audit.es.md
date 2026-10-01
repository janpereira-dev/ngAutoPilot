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

## Verificación posterior del 2026-10-02

- El candidato `45eb9a1c` de la PR #68 superó los doce checks publicados en la PR, incluidos CodeQL, los dos gates protegidos y Socket. La validación remota aprobó 239 pruebas del repositorio y 22 pruebas de scripts; Skill Lab reportó 96 pruebas sin fallos. Es evidencia de ese candidato, no aprobación de un commit posterior.
- CodeQL encontró inicialmente sanitización incompleta de varios caracteres al procesar encabezados de documentación. La corrección usa un recorrido con estado de etiquetas y una lista permitida de caracteres emitidos, con regresión de etiquetas malformadas. La última ejecución de CodeQL aprobó y el hilo original está resuelto y obsoleto. Las consultas paginadas actualizadas de alertas abiertas de Dependabot, secret scanning y code scanning devolvieron listas vacías.
- La ejecución adicional **Code scanning AI findings** de GitHub falló antes de revisar por cuota mensual agotada. Que CodeQL apruebe no significa que esta revisión opcional con IA haya terminado. Restaurar la cuota del propietario y repetir si se requiere esa revisión; no eludir ningún check obligatorio.
- Una invocación real de Codex 0.156.1 rechazó el modelo configurado `gpt-6.1-sol` para la cuenta ChatGPT activa. Una invocación aislada de Claude Code 2.1.226 no produjo resultado dentro del plazo de observación y se detuvo. Ningún intento prueba descubrimiento de Components/Skills ni invocación exitosa. No se sustituyeron el modelo/proveedor configurados ni ajustes globales. Los logs completos del host permanecen como evidencia privada local.

## Obligatorio antes de publicar

La evidencia Python es independiente de npm: una auditoría aislada con Python 3.12.7 y pip-audit 2.10.1 resolvió 38 dependencias de Skill Lab y no encontró vulnerabilidades conocidas el 2026-10-02. Usó advisories de PyPI, recolección estricta y resolución solo de wheels, sin instalar Skill Lab ni usar credenciales de proveedores. Es una instantánea de resolución sin lock y específica de plataforma, no prueba de todas las versiones antiguas permitidas ni una evaluación del runtime Python. Los gates protegidos repiten ahora esta auditoría; el inventario registra aparte hashes fuente Python y el estado explícito INTERNAL_NOT_PYPI.

Para repetirla, activa un entorno aislado Python 3.12, instala `python -m pip install --only-binary=:all: pip-audit==2.10.1` y ejecuta `python scripts/audit-python-dependencies.py`. El informe JSON queda en `dist/security/python-dependency-audit.json`; un resultado distinto de cero bloquea el release. El workflow protegido lo adjunta al release GitHub. El auditor es una herramienta de validación, no una nueva dependencia de ejecución de Skill Lab.

Los hallazgos posteriores de la PR se reprodujeron y quedaron cubiertos por regresiones específicas: resolución MCP autónoma sin árbol fuente, rangos compuestos del toolchain, aprobación explícita en CLI (también instalación y desinstalación), checkpoints desde la raíz de paquete, límites del lockfile del workspace propietario, planes de bibliotecas Angular con solo peerDependencies, retención acotada del limitador y contrato de checkpoints. Se fija `semver` 7.8.5 como dependencia de ejecución necesaria para usar la gramática npm mantenida, sin ampliar el parser Angular deliberadamente restringido. Las pruebas específicas y el CI del HEAD final deben aprobar antes de cerrar esos hilos de revisión.

- Ejecutar los gates finales del HEAD y Skill Lab; registrar CI remoto aparte de resultados locales.
- Inspeccionar expediente exacto y obtener aprobación humana de PR y entorno. El expediente sigue NOT_APPROVED; no se afirma ejecución Sage externa ni auditoría SkillSpector.
- Configurar credencial npm protegida y rotar/revocar token histórico del repositorio. El entorno vacío bloquea el release; no autoriza usar otra credencial más amplia.
- Comprobar inventario del tarball, hashes y versión/latest publicados tras el workflow protegido.
- Revisar proveedor, estado, auditedAt y snapshot de auditorías de directorios después de publicar. Una corrección local no fuerza la reindexación externa.

## Límites

No se afirma certificación universal de hosts, puntuación semántica del catálogo, auditoría externa completa, declaraciones del portal, aceptación de marketplaces ni enforcement global de hooks. Fixtures y registros históricos conservan su alcance. Publicar no concede permiso para ejecutar instrucciones, reemplazar personalizaciones ni subir contexto privado.

Consulta las [tareas ordenadas](publication-plan.es.md) para acciones del responsable y evidencia de cierre por destino.
