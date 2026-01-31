# Fitter Line Health — Implementation Plan (Template)

This is a kit-scoped grounding document for the **Fitter Line Health** workflow.

## Purpose

Keep quality-gate execution **deterministic** and **bounded** at the workflow/runner layer.

## Constraints

- **No product code changes** as part of line-health fitting.
- **No toolchain migrations**. Fitter adjusts runner/workflow invocation and budgets only.
- **Bounded retries**: default 1 retry after a restoration contract; a second retry only if mitigation materially changes.
- **Contracts and pointers only**: do not paste full logs; pass a tail + file paths.

## Outcome semantics

- **GREEN**: fitted + verified; orchestrator may proceed.
- **YELLOW**: partially fitted or ambiguous; operator decision required.
- **RED**: cannot fit safely (e.g., requires secrets or interactive steps).

