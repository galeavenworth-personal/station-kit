# Comparison matrix (positioning)

Station Kit (SK) is easiest to understand if you treat it as **workflow + contracts + operations**, not as an agent runtime.

## What SK is optimizing

- Supervised execution (STOP gates)
- Resumability via explicit handoffs
- Accountability artifacts (contracts)
- Bounded failure handling (line health)

## What SK is not optimizing

- Inline code completion speed
- Hosting or running agents as a service
- Building agent graphs/runtimes

## Matrix

| Category | Typical strengths | Typical gaps | Where SK differentiates |
| --- | --- | --- | --- |
| IDE copilots | fast edits, inline suggestions | weak audit trail, weak task state, weak failure routing | explicit work orders, gates, and contracts |
| End-to-end coding agents | broader autonomy, multi-step execution | repeatability, supervision, bounded retries | supervised subtasks + contract handoffs |
| Orchestration frameworks | agent graphs, tool routing, runtime building blocks | operational discipline is app-specific | SK is the operational discipline blueprint |
| Human runbooks | domain-accurate procedures | high cognitive load, inconsistent execution | SK encodes runbooks into executable workflows |

## Concrete differentiators (the wedge)

1) **Contracts-first**
- Handoff packet schema in [`docs/SCHEMAS.md`](SCHEMAS.md#handoff-packet-minimal-skeleton)
- PR ledger row schema in [`docs/SCHEMAS.md`](SCHEMAS.md#pr-review-ledger-row-object)

2) **Bounded failure handling**
- Line fault + restoration contracts:
  - [`templates/.kilocode/contracts/line_health/line_fault_contract.md`](../templates/.kilocode/contracts/line_health/line_fault_contract.md)
  - [`templates/.kilocode/contracts/line_health/restoration_contract.md`](../templates/.kilocode/contracts/line_health/restoration_contract.md)

3) **Supervised orchestration (parent foreman + worker subtasks)**
- Prep workflow: [`templates/.kilocode/workflows/orchestrate-start-task.md`](../templates/.kilocode/workflows/orchestrate-start-task.md)
- Execute workflow: [`templates/.kilocode/workflows/orchestrate-execute-task.md`](../templates/.kilocode/workflows/orchestrate-execute-task.md)

4) **Model-per-role experimentation without changing the contracts**
- See [`docs/MODEL_STRATEGY.md`](MODEL_STRATEGY.md)
