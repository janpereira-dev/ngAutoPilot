# Política de seguridad 🛡️

<!-- docs:navigation:start -->
[English](SECURITY.md) · [Mapa](docs/README.es.md) · [Inicio](README.es.md)

<!-- docs:navigation:end -->

**No publiques información sensible en una incidencia pública.** Utiliza un canal privado disponible y comparte solo la evidencia necesaria.

## Alcance de esta política

La orientación cubre workflows, scripts, bundles publicados, plantillas de adaptadores y metadatos/contenido de skills. Esta sección no promete una ventana de soporte por versión que el repositorio no haya definido.

## Notificar una vulnerabilidad

1. Utiliza GitHub Security Advisory si está habilitado, o un contacto privado del responsable que exista realmente.
2. No supongas que GitHub ofrece mensajería privada genérica ni inventes direcciones de contacto.
3. Envía archivo o workflow afectado, riesgo, reproducción segura y una posible corrección si la conoces.

Elimina credenciales y datos de clientes de la evidencia. Si no encuentras un canal privado, solicita únicamente un medio de contacto sin divulgar la vulnerabilidad.

## Ejemplos de problemas de seguridad

- Ejecución shell que pueda abusarse mediante instrucciones o workflows.
- Copia de archivos no confiables en publicación.
- Filtración de credenciales en acciones.
- Valores predeterminados peligrosos en bundles.
- Riesgos de dependencias o cadena de suministro.

## Revisión local

El paquete de revisión Sage puede ayudar a revisar `skills/**/SKILL.md`, `adapters/**`, `.github/workflows/**` y `scripts/*.mjs` antes de una revisión pública. Su generación no implica haber instalado o ejecutado un proveedor externo.

No sustituye la notificación a responsables ni las validaciones del repositorio. [Modelo de seguridad](docs/security-model.es.md) · [Revisión Sage](docs/sage-review.es.md).

## Objetivo de respuesta

Reconocer el aviso, clasificarlo y resolverlo con el cambio seguro más pequeño. Si afecta a workflows o automatización de publicación, validar antes de distribuir. No se promete un plazo de respuesta que el proyecto no haya establecido.
