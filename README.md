# Station Kit

## Overview
Station Kit (SK) is an opinionated, copy/paste-ready set of **Kilo Code** orchestration templates for running a factory-line workflow (start → execute → refactor → PR review response → line health).

It installs **templates only** under [`templates/`](templates/:1) so you can drop them into any repo without adding runtime installers or CLIs.

### What “provider-neutral” means (and what it does not mean)

SK is **Kilo Code-specific**, but **model-provider flexible**: you can run different model providers/models per role/station (e.g., Architect vs Code Fabricator vs Fitter) and A/B test them while keeping workflow contracts constant.

See:
- [`docs/WHY_KILO_CODE.md`](docs/WHY_KILO_CODE.md:1)
- [`docs/MODEL_STRATEGY.md`](docs/MODEL_STRATEGY.md:1)

SK does **not** claim to be a general-purpose agent runtime for every environment. It is a workflow + contract kit designed around Kilo Code’s Orchestrator + custom modes.

## Reference factory stack (required to run the workflows as-written)

Station Kit is a **reference factory design**. The factory relies on best-in-class stations that are required for the workflows to work as designed:

- **Beads (`bd`)** — work-order system and task-state source of truth. The factory’s throughline depends on it. See [`templates/AGENTS.md`](templates/AGENTS.md:1).
- **Sequential Thinking MCP (specific fork)** — reasoning audit trail with mandatory import/export and stamped summaries. See [`templates/.kilocode/workflows/orchestrate-start-task.md`](templates/.kilocode/workflows/orchestrate-start-task.md:215).
- **Augment Code MCP** — codebase retrieval station optimized for speed and quality. See [`docs/INSTALL.md`](docs/INSTALL.md:3).

These dependencies are **required** for the reference factory to function correctly. They are intentionally opinionated so the kit can demonstrate consistent, auditable execution.

## What it installs
Copy these template directories into your target repo:
- [`.kilocode/`](templates/.kilocode/:1) — workflows, contracts, rules, skills, and fitter config.
- [`.kilocodemodes`](templates/.kilocodemodes:1) — mode definitions aligned with the workflows.
- [`.beads/`](templates/.beads/:1) — minimal Beads scaffolding (Beads is required; the kit does not install `bd`).
- [`AGENTS.md`](templates/AGENTS.md:1) — required operator workflow contract (Beads).

## Quickstart
Copy templates into your repo’s root (example commands):

```bash
cp -R templates/.kilocode ./.kilocode
cp templates/.kilocodemodes ./.kilocodemodes
cp -R templates/.beads ./.beads
cp templates/AGENTS.md ./AGENTS.md
```

Then replace `{{SK_*}}` placeholders using the guidance in [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:1).

## Next steps
- Install instructions: [`docs/INSTALL.md`](docs/INSTALL.md:1)
- Mental onramp: [`docs/MENTAL_ONRAMP.md`](docs/MENTAL_ONRAMP.md:1)
- Why Kilo Code: [`docs/WHY_KILO_CODE.md`](docs/WHY_KILO_CODE.md:1)
- Model strategy: [`docs/MODEL_STRATEGY.md`](docs/MODEL_STRATEGY.md:1)
- Ecosystem + staged public exposure: [`docs/ECOSYSTEM_STAGING.md`](docs/ECOSYSTEM_STAGING.md:1)
- 10-minute walkthrough: [`docs/DEMO_WALKTHROUGH.md`](docs/DEMO_WALKTHROUGH.md:1)
- Comparison matrix: [`docs/COMPARISON_MATRIX.md`](docs/COMPARISON_MATRIX.md:1)
- Token reference: [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:1)
- Workflow reference: [`docs/WORKFLOW_REFERENCE.md`](docs/WORKFLOW_REFERENCE.md:1)
- Schemas: [`docs/SCHEMAS.md`](docs/SCHEMAS.md:1)

## Credits and attribution
This kit is designed to be executed inside Kilo Code and assumes the following external components.

See also: [`docs/CREDITS.md`](docs/CREDITS.md)

- **Kilo Code** — https://kilo.ai/
- **Beads** by Steve Yegge — https://github.com/steveyegge/beads
- **MCP Sequential Thinking (fork)** by Arben Adm — https://github.com/arben-adm/mcp-sequential-thinking
- **Augment Code MCP** — https://docs.augmentcode.com/context-services/mcp/overview
