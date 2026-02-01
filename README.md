# Station Kit

## Overview
Station Kit (SK) is an opinionated, copy/paste-ready set of **Kilo Code** orchestration templates for running a factory-line workflow (start → execute → refactor → PR review response → line health).

It installs **templates only** under [`templates/`](templates/) so you can drop them into any repo without adding runtime installers or CLIs.

## Why this kit exists
Building software with AI assistance changes the failure modes:

- work spans multiple sessions and multiple agents
- “correctness” is dominated by repeatability, verification, and supervision discipline
- the easiest way to get burned is to let state live only in chat history

SK is a **workflow + contract reference implementation**: readable, reviewable templates that make execution auditable and bounded.

### Operational problems SK standardizes

1) **Multi-session continuity (handoffs)**
- Each phase exports a session; the next phase imports it.
- Handoff schema: [`docs/SCHEMAS.md`](docs/SCHEMAS.md#handoff-packet-minimal-skeleton)
- Handoff template: [`templates/.kilocode/contracts/handoff/handoff_packet.md`](templates/.kilocode/contracts/handoff/handoff_packet.md)

2) **Explicit task state (work orders)**
- Task identity/state lives outside chat history via Beads.
- Operator contract: [`templates/AGENTS.md`](templates/AGENTS.md)

3) **Determinism and evidence discipline**
- Outputs should be reproducible, verifiable, and drift-detectable.
- Gates + bounded waiting are first-class.

4) **Bounded failure handling (line health)**
- Stalls/timeouts route to a maintenance role (Fitter) with explicit contracts, not endless retries.
- Fault contract: [`templates/.kilocode/contracts/line_health/line_fault_contract.md`](templates/.kilocode/contracts/line_health/line_fault_contract.md)
- Restoration contract: [`templates/.kilocode/contracts/line_health/restoration_contract.md`](templates/.kilocode/contracts/line_health/restoration_contract.md)

5) **Supervised execution (STOP gates)**
- Prepare → STOP → execute to prevent uncontrolled implementation.

6) **Closed-loop PR review response**
- Review feedback is tracked, clustered, implemented, gated, and acknowledged.
- Ledger schema: [`docs/SCHEMAS.md`](docs/SCHEMAS.md#pr-review-ledger-row-object)
- Workflow: [`templates/.kilocode/workflows/orchestrate-respond-to-pr-review.md`](templates/.kilocode/workflows/orchestrate-respond-to-pr-review.md)

## Reviewer path (recommended)
1) What SK depends on and why: [`docs/WHY_KILO_CODE.md`](docs/WHY_KILO_CODE.md)
2) How to pick models per station safely: [`docs/MODEL_STRATEGY.md`](docs/MODEL_STRATEGY.md)
3) The end-to-end toy run: [`docs/DEMO_WALKTHROUGH.md`](docs/DEMO_WALKTHROUGH.md)
4) Workflow inventory: [`docs/WORKFLOW_REFERENCE.md`](docs/WORKFLOW_REFERENCE.md)
5) The schema contracts: [`docs/SCHEMAS.md`](docs/SCHEMAS.md)
6) Positioning matrix: [`docs/COMPARISON_MATRIX.md`](docs/COMPARISON_MATRIX.md)

### What “provider-neutral” means (and what it does not mean)

SK is **Kilo Code-specific**, but **model-provider flexible**: you can run different model providers/models per role/station (e.g., Architect vs Code Fabricator vs Fitter) and A/B test them while keeping workflow contracts constant.

See:
- [`docs/WHY_KILO_CODE.md`](docs/WHY_KILO_CODE.md)
- [`docs/MODEL_STRATEGY.md`](docs/MODEL_STRATEGY.md)

SK does **not** claim to be a general-purpose agent runtime for every environment. It is a workflow + contract kit designed around Kilo Code’s Orchestrator + custom modes.

## Reference factory stack (required to run the workflows as-written)

Station Kit is a **reference factory design**. The factory relies on best-in-class stations that are required for the workflows to work as designed:

- **Beads (`bd`)** — work-order system and task-state source of truth. The factory’s throughline depends on it. See [`templates/AGENTS.md`](templates/AGENTS.md).
- **Sequential Thinking MCP (specific fork)** — reasoning audit trail with mandatory import/export and stamped summaries. See [`templates/.kilocode/workflows/orchestrate-start-task.md`](templates/.kilocode/workflows/orchestrate-start-task.md#phase-4-synthesis--conclusion).
- **Augment Code MCP** — codebase retrieval station optimized for speed and quality. See [`docs/INSTALL.md`](docs/INSTALL.md).

These dependencies are **required** for the reference factory to function correctly. They are intentionally opinionated so the kit can demonstrate consistent, auditable execution.

## What it installs
Copy these template directories into your target repo:
- [`.kilocode/`](templates/.kilocode/) — workflows, contracts, rules, skills, and fitter config.
- [`.kilocodemodes`](templates/.kilocodemodes) — mode definitions aligned with the workflows.
- [`.beads/`](templates/.beads/) — minimal Beads scaffolding (Beads is required; the kit does not install `bd`).
- [`AGENTS.md`](templates/AGENTS.md) — required operator workflow contract (Beads).

## Quickstart
Copy templates into your repo’s root (example commands):

```bash
cp -R templates/.kilocode ./.kilocode
cp templates/.kilocodemodes ./.kilocodemodes
cp -R templates/.beads ./.beads
cp templates/AGENTS.md ./AGENTS.md
```

Then replace `{{SK_*}}` placeholders using the guidance in [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md).

## Next steps
- Install instructions: [`docs/INSTALL.md`](docs/INSTALL.md)
- Why Kilo Code: [`docs/WHY_KILO_CODE.md`](docs/WHY_KILO_CODE.md)
- Model strategy: [`docs/MODEL_STRATEGY.md`](docs/MODEL_STRATEGY.md)
- Ecosystem + staged public exposure: [`docs/ECOSYSTEM_STAGING.md`](docs/ECOSYSTEM_STAGING.md)
- 10-minute walkthrough: [`docs/DEMO_WALKTHROUGH.md`](docs/DEMO_WALKTHROUGH.md)
- Comparison matrix: [`docs/COMPARISON_MATRIX.md`](docs/COMPARISON_MATRIX.md)
- Token reference: [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md)
- Workflow reference: [`docs/WORKFLOW_REFERENCE.md`](docs/WORKFLOW_REFERENCE.md)
- Schemas: [`docs/SCHEMAS.md`](docs/SCHEMAS.md)

## Community & contributions

Station Kit is maintained as a reference implementation of a disciplined, auditable factory-line workflow for AI-assisted development. Contributions are welcome, but changes must align with the project’s goals:

* explicit contracts and schemas
* deterministic handoffs
* bounded execution and failure handling
* template-first, provider-flexible integrations

Please review [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening pull requests. Bugs and improvements are best filed as GitHub Issues. Security concerns should follow [`SECURITY.md`](SECURITY.md).

## Credits and attribution
This kit is designed to be executed inside Kilo Code and assumes the following external components.

See also: [`docs/CREDITS.md`](docs/CREDITS.md)

- **Kilo Code** — https://kilo.ai/
- **Beads** by Steve Yegge — https://github.com/steveyegge/beads
- **MCP Sequential Thinking (fork)** by Arben Adm — https://github.com/arben-adm/mcp-sequential-thinking
- **Augment Code MCP** — https://docs.augmentcode.com/context-services/mcp/overview
