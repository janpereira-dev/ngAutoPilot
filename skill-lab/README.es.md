# Skill Lab de NgAutoPilot 🧪

<!-- docs:navigation:start -->
[English](README.md) · [Mapa](../docs/README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

`skill-lab/` es el laboratorio de evaluación con gobierno de las skills. Antes de que una optimización llegue a `skills/**`, responde:

> ¿La skill es realmente mejor y ha introducido alguna regresión crítica?

Lee la [política](POLICY.es.md) antes de cualquier experimento con modelos. El laboratorio pertenece al repositorio y no al paquete npm público.

## Ruta rápida

Estos ejemplos multilínea utilizan **Bash**. En PowerShell escribe cada comando en una línea o utiliza su continuación nativa; `\` no continúa líneas en PowerShell.

```bash
python -m pip install -e skill-lab/python
npm run skill-lab:validate
npm run skill-lab:test

npm run skill-lab:baseline -- \
  --benchmark angular-upgrade-validation-gate \
  --run manual-evaluation

npm run skill-lab:evaluate -- \
  --benchmark angular-upgrade-validation-gate \
  --splits train,validation \
  --output skill-lab/runs/manual-evaluation/baseline-results

npm run skill-lab:optimize -- \
  --benchmark angular-upgrade-validation-gate \
  --run <run-id>
```

`<run-id>` es un valor que debes sustituir. Optimizar puede realizar llamadas de pago y exige proveedor configurado; los comandos estáticos no prueban una optimización real.

## Modelos predeterminados

La configuración de este checkout utiliza el identificador OpenAI API `gpt-4.1-mini` en ambos roles. Son valores de configuración, no una afirmación de disponibilidad actual en tu cuenta ni una recomendación de precios.

| Rol | Predeterminado | Motivo del diseño |
| --- | --- | --- |
| Optimizador | `gpt-4.1-mini` | Ediciones pequeñas de instrucciones y código para benchmarks acotados |
| Objetivo | `gpt-4.1-mini` | Mantener la evaluación alineada con el optimizador en pruebas iniciales |

Utiliza `gpt-4.1` como `optimizerModel` solo si el modelo predeterminado genera ediciones débiles o ruidosas y has aprobado ese proveedor y coste. Mantén `targetModel` estable al comparar candidatos: cambiar ambos altera el experimento.

Las credenciales dependen del backend SkillOpt. Para la ruta compatible con OpenAI configura `OPENAI_API_KEY` en tu entorno privado. Ejemplo de nombres y marcadores, nunca una clave real:

```bash
export OPENAI_API_KEY=<your-key>
```

En PowerShell, el equivalente es `$env:OPENAI_API_KEY = "<your-key>"`. Utiliza almacenamiento privado de secretos; no guardes valores reales en documentación, historial compartido, fixtures ni PR.

Puedes sustituir modelos:

```bash
npm run skill-lab:optimize -- \
  --benchmark angular-upgrade-validation-gate \
  --run manual-evaluation \
  --optimizerModel gpt-4.1 \
  --targetModel gpt-4.1-mini \
  --epochs 3 \
  --editBudget 4 \
  --seed 42
```

Variables equivalentes:

```bash
export SKILL_LAB_OPTIMIZER_MODEL=gpt-4.1-mini
export SKILL_LAB_TARGET_MODEL=gpt-4.1-mini
```

En PowerShell: `$env:SKILL_LAB_OPTIMIZER_MODEL = "gpt-4.1-mini"` y `$env:SKILL_LAB_TARGET_MODEL = "gpt-4.1-mini"`.

## Flujo local completo

```bash
python -m pip install -e skill-lab/python
npm run skill-lab:ci

npm run skill-lab:baseline -- \
  --benchmark angular-upgrade-validation-gate \
  --run manual-evaluation

npm run skill-lab:evaluate -- \
  --benchmark angular-upgrade-validation-gate \
  --run manual-evaluation \
  --skill skill-lab/runs/manual-evaluation/baseline.SKILL.md \
  --splits validation \
  --runs 1 \
  --output skill-lab/runs/manual-evaluation/baseline-results

npm run skill-lab:optimize -- \
  --benchmark angular-upgrade-validation-gate \
  --run manual-evaluation \
  --epochs 3 \
  --editBudget 4 \
  --seed 42

npm run skill-lab:evaluate -- \
  --benchmark angular-upgrade-validation-gate \
  --run manual-evaluation \
  --splits validation \
  --runs 1

npm run skill-lab:compare -- \
  --run manual-evaluation
```

## Evidencias del repositorio

Ejecuta las comprobaciones contra una copia temporal donde se haya aplicado el candidato y registra el resultado en `skill-lab/runs/<run-id>/repository-gates/report.json` antes de solicitar evaluación final:

```bash
npm run release:validate
```

El informe debe corresponder al hash del candidato activo. Un resultado anterior o de otro candidato no sirve.

## Evidencias agénticas

Reúne evidencia del harness y escribe su informe antes de los conjuntos de promoción:

```bash
npm run skill-lab:agentic-gate -- \
  --run manual-evaluation \
  --harness <harness>
```

Después:

```bash
npm run skill-lab:evaluate -- \
  --benchmark angular-upgrade-validation-gate \
  --run manual-evaluation \
  --splits test,adversarial

npm run skill-lab:gate -- \
  --run manual-evaluation \
  --stage final

npm run skill-lab:prepare-promotion -- \
  --run manual-evaluation
```

Revisa `skill-lab/runs/<run-id>/promotion/canonical.diff` antes de aplicar algo a `skills/**`.

## Reglas

- SkillOpt solo propone candidatos.
- NgAutoPilot decide si pueden promoverse.
- Permanecen fuera de `skills/**` hasta que una persona aplica un diff revisado en una rama.
- Test y adversarial son comprobaciones de promoción, no entradas de optimización.
- No se admiten datos privados, sesiones personales ni código corporativo.

## Manifiestos de fixtures

Los manifiestos de benchmarks se guardan como `package.fixture.json`. Son datos JSON inertes, no proyectos npm instalables.

No los renombres a `package.json`, no ejecutes gestores de paquetes en fixtures ni generes lockfiles. El nombre real `package.json` hace que analizadores de dependencias interpreten versiones históricas de prueba como dependencias de producción.

## Alcance actual

Fases implementadas en el diseño del laboratorio:

- A: gobierno, estructura, esquemas y base de benchmark.
- B: evaluador determinista, detección de regresiones, motor de comprobaciones e informes.
- C: primeros fixtures y conjuntos para `angular-upgrade-validation-gate`.
- D: contrato del puente SkillOpt, interfaz de evidencia agéntica, expediente de promoción, entradas basadas en evidencia y CI.

El puente es real pero deliberadamente limitado: llama a `python -m ngautopilot_skillopt.bridge` con un contrato que solo expone train y validation. Si falta `skillopt` local o su API esperada, falla con instrucciones de configuración en lugar de simular optimización.

Siguen siendo manuales: aplicar `canonical.diff`, ejecutar comprobaciones sobre la copia promovida y abrir una PR. Candidatos, evidencias y expedientes permanecen en `skill-lab/runs/**`.

## Promoción manual

1. Revisa `candidate.SKILL.md`.
2. Revisa comparación e informes.
3. Ejecuta `npm run skill-lab:prepare-promotion -- --run <run-id>`.
4. Aplica `promotion/canonical.diff` manualmente en una rama.
5. Ejecuta `npm run release:validate`.
6. Abre una PR borrador con evidencias si está autorizado.

Ningún comando del laboratorio hace commit, push, publicación, abre PR o sobrescribe `skills/**`.
