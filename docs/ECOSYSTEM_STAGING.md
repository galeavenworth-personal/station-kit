# Ecosystem and staged public exposure

Station Kit (SK) is the **workflow + contract layer** for building complex systems with AI assistance.

It exists for two reasons:

1) **Career signal**: a self-contained blueprint of a modern software fabrication workflow.
2) **Mental onramp**: a consistent operating model for building larger projects (repomap and Mimir) without re-deriving workflow discipline each time.

## Mental onramp: recurring problems SK standardizes

SK standardizes the operational discipline that shows up repeatedly in real work:

1) **Multi-session continuity**
- Explicit session import/export for prep and execution (see session export in [`templates/.kilocode/workflows/orchestrate-start-task.md`](../templates/.kilocode/workflows/orchestrate-start-task.md:299)).

2) **Explicit task state**
- A work-order system keeps identity/state outside of chat history (see Beads contract in [`templates/AGENTS.md`](../templates/AGENTS.md:1)).

3) **Determinism and verification discipline**
- Work is not “done” until gates pass and outputs are repeatable.
- Line health exists because stalls/timeouts are normal in real pipelines (see line fault routing in [`templates/.kilocode/workflows/orchestrate-execute-task.md`](../templates/.kilocode/workflows/orchestrate-execute-task.md:408)).

4) **Bounded failure handling**
- Failures route to a maintenance role (Fitter) with explicit contracts, not endless retries.
- See line-health contracts:
  - [`templates/.kilocode/contracts/line_health/line_fault_contract.md`](../templates/.kilocode/contracts/line_health/line_fault_contract.md:1)
  - [`templates/.kilocode/contracts/line_health/restoration_contract.md`](../templates/.kilocode/contracts/line_health/restoration_contract.md:1)

5) **Supervised execution**
- Parent tasks coordinate; subtasks do work; explicit STOP gates prevent uncontrolled implementation.

## How SK relates to repomap and Mimir

SK is a public-facing kit extracted from dogfooding.

### repomap (MIT)

repomap is a deterministic repository analysis tool that produces machine-readable artifacts.

How it connects to the factory:

- repomap can act as a **measurement station** (deterministic artifacts).
- Those artifacts enable higher-level “claims” workflows (optional station).

Public repo (MIT): https://github.com/galeavenworth-personal/repomap

### Mimir (PolyForm Noncommercial)

Mimir is a persistent executive agent with externalized state and long-term memory.

How it connects to the factory:

- Mimir is a “multi-episode” system: it benefits from explicit contracts and disciplined handoffs.
- SK provides the workflow muscle memory to build systems like this without ad-hoc drift.

License posture: PolyForm Noncommercial 1.0.0 — https://polyformproject.org/licenses/noncommercial/1.0.0/

## Staged public exposure plan (recommended)

1) **First public drop**
- SK (MIT)
- repomap (MIT)

2) **Second drop (selective)**
- Mimir as PolyForm Noncommercial with a tighter public surface
- Keep advanced cognitive internals gated until the story is ready

3) **Ongoing**
- Keep SK stable as the workflow reference.
- Keep repomap evolving as the deterministic measurement jig.
- Keep Mimir evolving as the persistent executive mind.
