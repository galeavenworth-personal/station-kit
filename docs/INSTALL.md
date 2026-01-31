# Install

## Scope

Kilo Factory Kit (KFK) ships **templates only**: you copy files into a target repository. It does not install CLIs, MCP servers, or runtime tooling.

KFK is **Kilo Code-specific**. “Provider-neutral” means you can swap model providers/models per role (per mode) inside Kilo Code while keeping the workflow contracts constant.

See:
- [`WHY_KILO_CODE.md`](WHY_KILO_CODE.md:1)
- [`MODEL_STRATEGY.md`](MODEL_STRATEGY.md:1)

## Prerequisites (reference factory stack)
These are **required** for the reference factory design to function as intended:

- Kilo Code with Orchestrator mode available.
- **Sequential Thinking MCP (specific fork)** connected.
  - Source: https://github.com/arben-adm/mcp-sequential-thinking
- **Beads** installed and configured (**required**).
  - Source: https://github.com/steveyegge/beads
  - The kit does **not** install Beads for you. You must install the `bd` CLI and initialize it for your repository.
  - Verify with: `bd --version` (or `bd help`).
- **Augment Code MCP** configured for codebase retrieval (**required**).
  - Docs: https://docs.augmentcode.com/context-services/mcp/overview
- Optional: `gh` (GitHub CLI) for `/orchestrate-respond-to-pr-review`.

## Step-by-step
1) Copy templates into your repo root:

```bash
cp -R templates/.kilocode ./.kilocode
cp templates/.kilocodemodes ./.kilocodemodes
cp -R templates/.beads ./.beads
cp templates/AGENTS.md ./AGENTS.md
```

2) Replace placeholders (`{{KFK_*}}`) in the copied templates.
    - See [`CONFIG_REFERENCE.md`](CONFIG_REFERENCE.md:1) for required tokens, defaults, and examples.

3) Confirm the canonical Fit Profiles location:
   - Installed at `./.kilocode/fitter.toml`
   - Profiles are represented with `[[profiles]]` tables (see [`CONFIG_REFERENCE.md`](CONFIG_REFERENCE.md:1)).

4) Enable additional tooling as needed:
    - **GitHub CLI** (`gh`) — required for PR review intake and acknowledgement workflow.

## Why these are required
The factory line is intentionally opinionated. These components are the “stations” that make the work-order + reasoning audit trail + codebase retrieval pipeline reliable:

- **Beads** provides the throughline (task identity + state) the workflows depend on.
- **Sequential Thinking MCP** provides the stamped reasoning chain and enforced import/export.
- **Augment Code MCP** provides the fastest, highest-quality codebase context retrieval the workflows assume.

## Safety notes
- Keep TOML/YAML files parseable; placeholders belong **inside quotes**.
- Use consistent quoting (`"{{KFK_*}}"`) when substituting values that contain spaces.
