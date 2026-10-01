# Auditoría histórica de nuevas skills

<!-- docs:navigation:start -->
[English](new-skills-audit.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

> Registro histórico: conserva las decisiones y fechas originales; no demuestra el estado actual de publicación o implementación.

<!-- docs:navigation:end -->

## Alcance y método

Se revisó por completo el área `new-skills/` antes de retirarla: **431 archivos**, distribuidos en ECMA (**124**), frontend product-life (**64**) y fuentes restantes (**243**). La revisión incluyó frontmatter, duplicados, enlaces, portabilidad, acoplamiento corporativo, señales de licencia, ejemplos parecidos a secretos, supuestos sobre herramientas y solapamiento con el catálogo.

Este documento registra decisiones anteriores a la eliminación del staging. Las skills distribuidas son reescrituras y consolidaciones originales de NgAutoPilot, no copias de prompts o frontmatter de staging.

## Entradas adoptadas

Estas entradas originales, basadas en capacidades detectadas, conservan los conceptos útiles de frontend sin crear plantillas casi duplicadas:

| Entrada | Decisión y alcance |
| --- | --- |
| `frontend.accessibility.inclusive-ui-foundations` | Estructura semántica, teclado y lector de pantalla, feedback de formularios, datos, zoom y truncado |
| `frontend.css.responsive-layout-and-motion` | Composición responsive, CSS según contenedor, layout, overflow y movimiento accesible |
| `frontend.design.product-ui-discovery` | Resultado de producto, inventario de flujos/estados y criterios de contenido antes de implementar |
| `frontend.design.design-system-governance` | Gobierno de tokens y contratos neutral respecto al framework; Material opcional, con rutas a skills Angular existentes |
| `frontend.testing.frontend-experience-validation` | Evidencias funcionales, visuales, accesibles y de flujo, sin herramientas obligatorias |
| `frontend.performance.web-performance-evidence` | WPO medido y entrega de recursos; los presupuestos Angular se remiten al catálogo existente |
| `angular.testing.angular-visual-accessibility-e2e-validation` | Validación de recorridos Angular que detecta capacidades y utiliza el ejecutor existente; Playwright es opcional |
| `javascript.ecmascript-compatibility-semantics` | Comprobación semántica opcional de librerías, host, herramientas y polyfills, con ruta al selector de compatibilidad existente |

## Material consolidado y redirigido

- ARIA/headless, CDK, harnesses Material, temas, migración M2 → M3 y presupuestos Angular ya tenían cobertura específica. No se duplicaron los borradores.
- Figma, Stitch, Chrome DevTools, Lighthouse y Playwright se conservaron solo como integraciones opcionales. El catálogo no exige dependencias de runtime, GUI, servidores, cuentas cloud ni declaraciones MCP.
- Prompts de producto/diseño y guías de subagentes se consolidaron en `agents/ngautopilot/`. Se documentan ocho roles, no agentes ejecutables no distribuidos.

## Categorías rechazadas

- El árbol ECMA de 106 ramas no se importó: era demasiado amplio para el catálogo de aplicaciones y duplicaría estándares sin un flujo acotado.
- Se excluyeron recursos corporativos, de marca, acoplados a MAPFRE/MAR, backend, bases de datos, RFP, procesamiento de documentos y meta-herramientas.
- Se excluyeron marcas con restricciones de licencia, enlaces rotos, configuración fija MCP/herramientas, rutas absolutas, flujos solo Bash y ejemplos inseguros de credenciales/PAT.
- Las plantillas casi duplicadas se sustituyeron por skills más amplias únicamente si añadían una decisión frontend diferenciada.

## Seguridad, licencias y portabilidad

La revisión histórica no encontró secretos activos con alta confianza. No se trasladaron ejemplos que fomentaran manejo de credenciales. Las señales corporativas o sin licencia se consideraron no distribuibles. Las guías adoptadas son independientes de empresa, evitan rutas absolutas, ejecutables de un sistema concreto y herramientas comerciales obligatorias; son guías para Windows, macOS y Linux.

Esta conclusión registra aquella revisión; no sustituye un análisis de seguridad actual.

## Regla de mantenimiento

Las nuevas skills deben ser originales, validar con los scripts del repositorio y estar seleccionadas por un bundle existente. Las afirmaciones Angular requieren evidencias del proyecto y versión detectados; ninguna skill frontend adoptada afirma compatibilidad Angular 22 por mera asociación.
