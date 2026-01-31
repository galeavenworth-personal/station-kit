# Workflow Reference

This kit ships the following Orchestrator workflows under [`templates/.kilocode/workflows/`](../templates/.kilocode/workflows/:1). Each workflow is copy/paste-ready and can be invoked once installed.

Contract templates live under [`templates/.kilocode/contracts/`](../templates/.kilocode/contracts/:1). Canonical schemas live in [`docs/SCHEMAS.md`](SCHEMAS.md:1).

## [`orchestrate-start-task.md`](../templates/.kilocode/workflows/orchestrate-start-task.md:1)
**What it does:** Factory-line task preparation. Spawns discovery, exploration, and preparation subtasks with sequential thinking handoffs.

**Prerequisites (reference factory stack):**
- Orchestrator mode available.
- Sequential Thinking MCP (specific fork) connected.
  - Source: https://github.com/arben-adm/mcp-sequential-thinking
- Beads (`bd`) available (task discovery + state updates).
  - Source: https://github.com/steveyegge/beads
- Augment Code MCP configured for codebase retrieval.
  - Docs: https://docs.augmentcode.com/context-services/mcp/overview

**When to use:** Starting any non-trivial task where you want structured prep and handoff packet generation.

**Tooling:** Beads (`bd`) for task context and task state; Sequential Thinking MCP for stamped reasoning handoffs; Augment Code MCP for fast codebase retrieval.

## [`orchestrate-execute-task.md`](../templates/.kilocode/workflows/orchestrate-execute-task.md:1)
**What it does:** Factory-line execution. Loads a prep session, spawns implementation subtasks, runs tests, and completes quality gates with a final report.

**Prerequisites (reference factory stack):**
- Prep session file and handoff packet from `/orchestrate-start-task`.
- Orchestrator mode available.
- Sequential Thinking MCP (specific fork) connected.
  - Source: https://github.com/arben-adm/mcp-sequential-thinking
- Beads (`bd`) available (closing/syncing task status).
  - Source: https://github.com/steveyegge/beads
- Augment Code MCP configured for codebase retrieval.
  - Docs: https://docs.augmentcode.com/context-services/mcp/overview

**When to use:** After prep approval to execute scoped implementation work in isolated subtasks.

**Tooling:** Beads (`bd`) for closing/syncing task status; Sequential Thinking MCP for session continuity; Augment Code MCP for retrieval; bounded gate runner placeholder via `{{KFK_BOUNDED_GATE_RUNNER_CMD}}`.

## [`orchestrate-refactor.md`](../templates/.kilocode/workflows/orchestrate-refactor.md:1)
**What it does:** Multi-phase refactor workflow with analysis, planning (alternatives), implementation, test update, and optional architecture verification.

**Prerequisites (reference factory stack):**
- Orchestrator mode available.
- Sequential Thinking MCP (specific fork) connected.
  - Source: https://github.com/arben-adm/mcp-sequential-thinking
- Augment Code MCP configured for codebase retrieval.
  - Docs: https://docs.augmentcode.com/context-services/mcp/overview

**When to use:** Significant refactors where alternatives must be explored and approved before implementation.

**Optional tooling:** None required.

## [`orchestrate-respond-to-pr-review.md`](../templates/.kilocode/workflows/orchestrate-respond-to-pr-review.md:1)
**What it does:** PR review response pipeline. Builds a comment ledger, plans clusters, implements fixes, runs gates, and acknowledges every comment via `gh`.

**Prerequisites (reference factory stack):**
- `gh auth status` succeeds.
- PR number and local branch available.
- Sequential Thinking MCP (specific fork) connected.
  - Source: https://github.com/arben-adm/mcp-sequential-thinking
- Augment Code MCP configured for codebase retrieval.
  - Docs: https://docs.augmentcode.com/context-services/mcp/overview

**When to use:** Responding to PR review feedback with strict ledger tracking and acknowledgement.

**Optional tooling:** GitHub CLI (`gh`) required for intake and acknowledgements.

## [`fitter-line-health.md`](../templates/.kilocode/workflows/fitter-line-health.md:1)
**What it does:** Fitter runbook for restoring deterministic, bounded gate execution. Receives a Line Fault Contract, applies workflow-layer mitigation, and returns a Restoration Contract.

**Prerequisites (reference factory stack):**
- Line Fault Contract input.
- Fit Profile budgets (or equivalent).
- Augment Code MCP configured for codebase retrieval.
  - Docs: https://docs.augmentcode.com/context-services/mcp/overview

**When to use:** Gates time out or stall and need workflow/runner-level adjustments (no product-code changes).

**Optional tooling:** None required; uses contract templates and bounded evidence.
