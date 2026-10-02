# Política de Skill Lab

<!-- docs:navigation:start -->
[English](POLICY.md) · [Mapa](../docs/README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

Estas reglas bloquean promociones y ejecuciones respaldadas por modelos:

1. No adoptar automáticamente.
2. No escribir en `skills/**`.
3. No utilizar datos privados.
4. No extraer información de sesiones personales.
5. No incluir secretos.
6. No utilizar secretos de modelos en PR de forks.
7. No promover sin el conjunto de prueba.
8. No aceptar regresiones críticas.
9. No modificar frontmatter.
10. No optimizar varias skills en una ejecución.

## Límite de datos

Los fixtures deben ser sintéticos y seguros para publicación. No incluir nombres de repositorios privados, URL corporativas, clientes, credenciales, arquitectura interna ni registros de incidentes reales.

## Límite de candidatos

Los candidatos son artefactos. Solo se convierten en entradas del catálogo cuando una persona aplica un diff revisado y pasan las comprobaciones del repositorio.

## Límite de herramientas

SkillOpt es externo y debe fijarse al implementar el puente. `skillopt-sleep adopt` y los flujos de adopción automática están prohibidos.

## Límite de comprobación agéntica

Las comprobaciones consumen evidencia previamente registrada en `skill-lab/runs/**`. No lanzan comandos no confiables, publican artefactos, escriben skills canónicas ni exponen credenciales del proveedor en PR.
