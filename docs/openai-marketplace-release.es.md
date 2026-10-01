# Preparación de publicación OpenAI 📦

<!-- docs:navigation:start -->
[English](openai-marketplace-release.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

El repositorio prepara un paquete público de **solo skills**, `ngautopilot-skills`. Su manifiesto es [`openai/plugin.json`](../openai/plugin.json). El árbol canónico [`skills/`](../skills/) se transforma en un catálogo público plano durante el empaquetado; no se mantiene un segundo catálogo editable.

## Ruta rápida

1. Comprueba qué herramientas existen realmente en `package.json` de la rama.
2. Valida fuentes y recursos generados sin afirmar aprobación externa.
3. Deja el envío y las declaraciones humanas al responsable de publicación.

## Validación y empaquetado

En esta rama, el validador y empaquetador ejecutables de OpenAI están aplazados al siguiente trabajo. No anuncies comandos npm que todavía no existen.

Ese trabajo debe añadir un validador de solo lectura para manifiesto, URLs legales, cobertura canónica, alcance exclusivo de skills, rutas seguras, integridad de referencias, límites de archivo y expediente de envío. También debe crear un ZIP determinista y su suma de comprobación.

## Ruta de versión y etiqueta

1. Ejecutar la validación de la rama elegida y revisar cambios generados.
2. Crear una etiqueta anotada o firmada `v0.6.0`, según la política del responsable, solo cuando proceda.
3. Construir y adjuntar ZIP y suma a la publicación GitHub correspondiente.
4. Enviar mediante el procedimiento OpenAI aplicable después de que el responsable complete la declaración humana.

El expediente [`openai/submission/0.6.0/`](../openai/submission/0.6.0/) conserva su contexto de versión: **no enviado** y **no verificado por OpenAI**. No afirma aprobación de portal ni verificación del desarrollador.

## Separación de distribuciones

`ngautopilot-tools` es una distribución local Agent Plugin/MCP separada y queda fuera de este paquete.

Los diez manifiestos `plugins/*/.codex-plugin/` son metadatos locales de bundles Codex, no diez entradas independientes del directorio OpenAI. El envío público corresponde a `openai/plugin.json` y su archivo generado.

[Guía de mantenimiento](maintainer-guide.es.md) · [Lista de publicación](release-checklist.es.md).
