# Skills para actualizar Angular 21 → 22

<!-- docs:navigation:start -->
[English](README.md) · [Mapa](../../../../docs/README.es.md) · [Inicio](../../../../README.es.md)

<!-- docs:navigation:end -->

Esta carpeta contiene las skills del salto acotado Angular 21 → 22. Son procedimientos para un agente autorizado, no transformadores ejecutables ni prueba de una migración terminada.

## Orden de uso

1. `angular-21-to-22-preflight-inventory`
2. `angular-21-to-22-upgrade-orchestrator`
3. `angular-21-to-22-breaking-changes-gate`
4. `angular-21-to-22-post-upgrade-validation-gate`

Mantén el salto separado de la modernización. Los riesgos por dominio se dirigen a las guías específicas v22 de `skills/angular/upgrades/<domain>/` o de la carpeta Angular correspondiente.

Primero reúne versiones y restricciones. El orquestador coordina las comprobaciones de cambios incompatibles antes de cualquier ejecución autorizada; el orden de lectura no significa que debas editar primero y comprobar después. Continúa solo con evidencias de build, pruebas y comportamiento.
