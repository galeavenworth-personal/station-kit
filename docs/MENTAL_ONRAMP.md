# Mental onramp: why this kit exists

Kilo Factory Kit (KFK) is a workflow blueprint for building software in a world where:

- code is co-produced with AI
- work is multi-session and multi-agent
- reliability is dominated by *process*, not raw generation

This repo is both:

1) a **career-signal artifact** (a readable, reviewable operating model)
2) a **mental onramp** to building larger systems without re-deriving workflow discipline every time

## The recurring problems this onramp solves

### 1) Multi-session continuity (handoffs)

Real work rarely happens in one uninterrupted session.

KFK makes continuity explicit:

- each phase exports a session
- the next phase imports it
- the parent task produces a bounded handoff packet

See:
- session export protocol in [`templates/.kilocode/workflows/orchestrate-start-task.md`](../templates/.kilocode/workflows/orchestrate-start-task.md:199)
- canonical handoff schema in [`docs/SCHEMAS.md`](SCHEMAS.md:47)
- handoff template in [`templates/.kilocode/contracts/handoff/handoff_packet.md`](../templates/.kilocode/contracts/handoff/handoff_packet.md:1)

### 2) Explicit task state (work orders)

When task identity and state live only in chat, you lose auditability and resumability.

KFK treats task state as a station:

- **Beads** is the work-order and task-state source of truth

See:
- Beads operator contract in [`templates/AGENTS.md`](../templates/AGENTS.md:1)
- Beads rule in [`templates/.kilocode/rules/beads.md`](../templates/.kilocode/rules/beads.md:1)

### 3) Determinism and evidence discipline

For systems that generate artifacts (or rely on structured outputs), correctness depends on being able to:

- reproduce outputs
- verify them
- detect drift

KFK bakes in:

- explicit quality gates
- “no unbounded waits” discipline
- a separate maintenance station (Fitter) for runner/workflow failures

See:
- fitter config surface in [`templates/.kilocode/fitter.toml`](../templates/.kilocode/fitter.toml:1)
- line health routing in [`templates/.kilocode/workflows/orchestrate-execute-task.md`](../templates/.kilocode/workflows/orchestrate-execute-task.md:408)

### 4) Bounded failure handling (line health)

Stalls and timeouts are normal in real pipelines.

KFK makes failure handling explicit and bounded:

- Orchestrator emits a **Line Fault Contract**
- Fitter returns a **Restoration Contract**
- Orchestrator retries at most 1–2 times, then stops

See:
- fault template: [`templates/.kilocode/contracts/line_health/line_fault_contract.md`](../templates/.kilocode/contracts/line_health/line_fault_contract.md:1)
- restoration template: [`templates/.kilocode/contracts/line_health/restoration_contract.md`](../templates/.kilocode/contracts/line_health/restoration_contract.md:1)

### 5) Supervised execution (STOP gates)

The biggest risk in agentic coding is uncontrolled implementation.

KFK makes supervision a first-class workflow feature:

- prepare → STOP → execute
- plan refactor → STOP → implement refactor

See:
- start-task STOP gate in [`templates/.kilocode/workflows/orchestrate-start-task.md`](../templates/.kilocode/workflows/orchestrate-start-task.md:390)
- refactor STOP gate in [`templates/.kilocode/workflows/orchestrate-refactor.md`](../templates/.kilocode/workflows/orchestrate-refactor.md:349)

### 6) Closed-loop PR review response

KFK treats PR review feedback as something you must close the loop on:

- build a ledger
- cluster responses
- implement
- run gates
- acknowledge every comment

See:
- PR ledger schema in [`docs/SCHEMAS.md`](SCHEMAS.md:87)
- PR response workflow in [`templates/.kilocode/workflows/orchestrate-respond-to-pr-review.md`](../templates/.kilocode/workflows/orchestrate-respond-to-pr-review.md:14)
- ledger template in [`templates/.kilocode/contracts/pr_review/comment_ledger.md`](../templates/.kilocode/contracts/pr_review/comment_ledger.md:1)

## Where this onramp is used

KFK is meant to be dogfooded against real projects.

- **repomap (MIT)**: deterministic repository analysis artifacts + verification.
  - Public repo: https://github.com/galeavenworth-personal/repomap
- **Mimir (PolyForm Noncommercial)**: persistent executive agent with externalized state.
  - License: https://polyformproject.org/licenses/noncommercial/1.0.0/

KFK is the stable workflow reference. repomap is the deterministic “measurement jig.” Mimir is the persistent executive system.

## Reviewer path (recommended)

1) What KFK depends on and why: [`docs/WHY_KILO_CODE.md`](WHY_KILO_CODE.md:1)
2) How to pick models per station safely: [`docs/MODEL_STRATEGY.md`](MODEL_STRATEGY.md:1)
3) The end-to-end toy run: [`docs/DEMO_WALKTHROUGH.md`](DEMO_WALKTHROUGH.md:1)
4) The schema contracts: [`docs/SCHEMAS.md`](SCHEMAS.md:1)
5) The positioning matrix: [`docs/COMPARISON_MATRIX.md`](COMPARISON_MATRIX.md:1)

