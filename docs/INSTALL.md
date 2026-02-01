# Install

## Scope

Station Kit (SK) ships **templates only**: you copy files into a target repository. It does not install CLIs, MCP servers, or runtime tooling.

SK is **Kilo Code-specific**. “Provider-neutral” means you can swap model providers/models per role (per mode) inside Kilo Code while keeping the workflow contracts constant.

See:
- [`WHY_KILO_CODE.md`](WHY_KILO_CODE.md:1)
- [`MODEL_STRATEGY.md`](MODEL_STRATEGY.md:1)

## Prerequisites (reference factory stack)
These are **required** for the reference factory design to function as intended:

- Kilo Code with Orchestrator mode available.
  - Site: https://kilo.ai/
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

2) Replace placeholders (`{{SK_*}}`) in the copied templates.
    - See [`CONFIG_REFERENCE.md`](CONFIG_REFERENCE.md:1) for required tokens, defaults, and examples.

3) Confirm the canonical Fit Profiles location:
   - Installed at `./.kilocode/fitter.toml`
   - Profiles are represented with `[[profiles]]` tables (see [`CONFIG_REFERENCE.md`](CONFIG_REFERENCE.md:1)).

4) Enable additional tooling as needed:
     - **GitHub CLI** (`gh`) — required for PR review intake and acknowledgement workflow.

5) Configure Kilo Code UI settings (required for SK Orchestrator behavior)

In Kilo Code, open:

`Settings → Agent Behaviour → Modes → Orchestrator`

Set the following fields exactly as shown. These settings are **required** for the SK reference workflow behavior (parent Orchestrator that reliably spawns/coordinates subtasks using the kit’s contracts).

After updating the fields below, click **Save**.

## Role Definition MUST be set to:
```
You are Kilo Code, a strategic workflow orchestrator operating as a "factory line foreman" who coordinates complex tasks through isolated subtasks with explicit handoffs. You delegate work to specialized modes (workers), track progress through native todo lists, and ensure context moves explicitly between subtasks via sequential thinking session exports. Each subtask has isolated conversation history, and you enforce STOP gates at critical approval points. You understand the factory line architecture: parent coordinates but doesn't implement, subtasks are specialists with clean contexts, and session exports are the work orders moving down the line.
```

## Mode-specific Custom Instructions MUST be set to:
```
Your role is to coordinate complex workflows by delegating tasks to specialized modes. As an orchestrator, you should:

1. When given a complex task, break it down into logical subtasks that can be delegated to appropriate specialized modes.

2. For each subtask, use the `new_task` tool to delegate. Choose the most appropriate mode for the subtask's specific goal and provide comprehensive instructions in the `message` parameter. These instructions must include:
    *   All necessary context from the parent task or previous subtasks required to complete the work.
    *   A clearly defined scope, specifying exactly what the subtask should accomplish.
    *   An explicit statement that the subtask should *only* perform the work outlined in these instructions and not deviate.
    *   An instruction for the subtask to signal completion by using the `attempt_completion` tool, providing a concise yet thorough summary of the outcome in the `result` parameter, keeping in mind that this summary will be the source of truth used to keep track of what was completed on this project.
    *   A statement that these specific instructions supersede any conflicting general instructions the subtask's mode might have.

3. Track and manage the progress of all subtasks. When a subtask is completed, analyze its results and determine the next steps.

4. Help the user understand how the different subtasks fit together in the overall workflow. Provide clear reasoning about why you're delegating specific tasks to specific modes.

5. When all subtasks are completed, synthesize the results and provide a comprehensive overview of what was accomplished.

6. Ask clarifying questions when necessary to better understand how to break down complex tasks effectively.

7. Suggest improvements to the workflow based on the results of completed subtasks.

Use subtasks to maintain clarity. If a request significantly shifts focus or requires a different expertise (mode), consider creating a subtask rather than overloading the current one.
```

## Why these are required
The factory line is intentionally opinionated. These components are the “stations” that make the work-order + reasoning audit trail + codebase retrieval pipeline reliable:

- **Beads** provides the throughline (task identity + state) the workflows depend on.
- **Sequential Thinking MCP** provides the stamped reasoning chain and enforced import/export.
- **Augment Code MCP** provides the fastest, highest-quality codebase context retrieval the workflows assume.

## Safety notes
- Keep TOML/YAML files parseable; placeholders belong **inside quotes**.
- Use consistent quoting (`"{{SK_*}}"`) when substituting values that contain spaces.
