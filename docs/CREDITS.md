# Credits and attribution

Station Kit (SK) is a templates-only repository. It does not ship or install the runtime tools it depends on.

This document records upstream components referenced by the kit, plus canonical links for maintainers and reviewers.

## Kilo Code (runtime)

- SK is designed to run inside **Kilo Code**.
- Site: https://kilo.ai/

Kilo Code provides the runtime features that these templates assume (for example: Orchestrator-mode parent tasks, custom modes, and MCP tool connections).

## Beads (`bd`) (task tracking)

- **Beads** (`bd`) by Steve Yegge
- Source: https://github.com/steveyegge/beads

SK assumes Beads is the work-order system and task-state source of truth.

Where it’s referenced:
- Install prerequisites: [`docs/INSTALL.md`](INSTALL.md)
- Beads operator contract template: [`templates/AGENTS.md`](../templates/AGENTS.md)

## Sequential Thinking MCP (arben-adm fork)

- **mcp-sequential-thinking** (specific fork) by Arben Adm
- Source: https://github.com/arben-adm/mcp-sequential-thinking

SK uses this MCP server as a reasoning continuity/audit station: templates require session import/export and stamped summaries.

Where it’s referenced:
- Install prerequisites: [`docs/INSTALL.md`](INSTALL.md)
- Workflow docs: [`docs/WORKFLOW_REFERENCE.md`](WORKFLOW_REFERENCE.md)
- Templates: [`templates/.kilocode/workflows/orchestrate-start-task.md`](../templates/.kilocode/workflows/orchestrate-start-task.md)

## Augment Code MCP

- **Augment Code MCP** (context services)
- Docs: https://docs.augmentcode.com/context-services/mcp/overview

SK assumes this MCP service is available for fast codebase retrieval.

Where it’s referenced:
- Install prerequisites: [`docs/INSTALL.md`](INSTALL.md)
- Workflow docs: [`docs/WORKFLOW_REFERENCE.md`](WORKFLOW_REFERENCE.md)

## Notes

- Product and project names are used for identification only and may be trademarks of their respective owners.
