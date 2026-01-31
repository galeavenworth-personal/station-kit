# Comparison matrix (positioning)

Kilo Factory Kit (KFK) is easiest to understand if you treat it as **workflow + contracts + operations**, not as an agent runtime.

## What KFK is optimizing

- Supervised execution (STOP gates)
- Resumability via explicit handoffs
- Accountability artifacts (contracts)
- Bounded failure handling (line health)

## What KFK is not optimizing

- Inline code completion speed
- Hosting or running agents as a service
- Building agent graphs/runtimes

## Matrix

| Category | Typical strengths | Typical gaps | Where KFK differentiates |
| --- | --- | --- | --- |
| IDE copilots | fast edits, inline suggestions | weak audit trail, weak task state, weak failure routing | explicit work orders, gates, and contracts |
| End-to-end coding agents | broader autonomy, multi-step execution | repeatability, supervision, bounded retries | supervised subtasks + contract handoffs |
| Orchestration frameworks | agent graphs, tool routing, runtime building blocks | operational discipline is app-specific | KFK is the operational discipline blueprint |
| Human runbooks | domain-accurate procedures | high cognitive load, inconsistent execution | KFK encodes runbooks into executable workflows |

## Concrete differentiators (the wedge)

1) **Contracts-first**
- Handoff packet schema in [`docs/SCHEMAS.md`](SCHEMAS.md:1)
- PR ledger row schema in [`docs/SCHEMAS.md`](SCHEMAS.md:87)

2) **Bounded failure handling**
- Line fault + restoration contracts:
  - [`templates/.kilocode/contracts/line_health/line_fault_contract.md`](../templates/.kilocode/contracts/line_health/line_fault_contract.md:1)
  - [`templates/.kilocode/contracts/line_health/restoration_contract.md`](../templates/.kilocode/contracts/line_health/restoration_contract.md:1)

3) **Supervised orchestration (parent foreman + worker subtasks)**
- Prep workflow: [`templates/.kilocode/workflows/orchestrate-start-task.md`](../templates/.kilocode/workflows/orchestrate-start-task.md:1)
- Execute workflow: [`templates/.kilocode/workflows/orchestrate-execute-task.md`](../templates/.kilocode/workflows/orchestrate-execute-task.md:1)

4) **Model-per-role experimentation without changing the contracts**
- See [`docs/MODEL_STRATEGY.md`](MODEL_STRATEGY.md:1)

