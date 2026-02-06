# Yardkit — Hybrid Supervisor

**Deterministic control plane for multi-line agentic workflows**

Yardkit is the orchestration layer that coordinates Beads task execution using Kilo CLI as the agentic data plane.

## Architecture

- **Supervisor (Yardkit)** = deterministic control plane
  - Scheduling and task ownership locks
  - Workspace isolation (worktrees/clones/containers)
  - Beads state transitions (`bd` CLI integration)
  - Quality gate execution (`npm run ci`)
  - Artifact collection and run summaries

- **Kilo CLI** = agentic data plane
  - Executes Station Kit workflows autonomously
  - Produces sequential thinking session exports
  - Implements prep and execute phases

## Installation

From the repository root:

```bash
cd tools/yardkit
npm install
npm run build
```

## Usage

### Single line run

Execute one Beads task end-to-end:

```bash
yardkit run --task <beads-task-id>
```

Options:
- `--timeout <seconds>` — Override default timeout
- `--workspace <path>` — Use specific workspace path

### Shift (multi-line parallel)

Pull tasks from Beads queue and process in parallel:

```bash
yardkit shift --max-parallel 4 --queue ready --limit 10
```

Options:
- `-n, --max-parallel <n>` — Maximum concurrent lines (default: 1)
- `-q, --queue <name>` — Beads queue filter (default: "ready")
- `-l, --limit <n>` — Maximum total tasks to process

## Configuration

Configure via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPERVISOR_MAX_PARALLEL` | Max concurrent lines | `1` |
| `SUPERVISOR_TIMEOUT_PREP` | Prep phase timeout (seconds) | `900` |
| `SUPERVISOR_TIMEOUT_EXECUTE` | Execute phase timeout (seconds) | `1800` |
| `SUPERVISOR_TIMEOUT_GATES` | Gates phase timeout (seconds) | `600` |
| `SUPERVISOR_ARTIFACTS_DIR` | Artifact output directory | `artifacts/supervisor/` |
| `SUPERVISOR_WORKSPACE_POOL_DIR` | Workspace pool location | `~/.yardkit/workspaces` |
| `SUPERVISOR_LOCKS_DIR` | Lock file directory | `artifacts/supervisor/locks/` |
| `SUPERVISOR_THINKING_DIR` | Thinking session exports | `.kilocode/thinking/` |
| `SUPERVISOR_REPO_ROOT` | Repository root path | `$PWD` |

## Line State Machine

Each "line" (task execution) follows this state machine:

```
[*] → Ready → Claimed → Prep → Execute → Gates → Done
                ↓        ↓       ↓         ↓
              Failed   Failed  Failed   Failed
```

### Phases

1. **Claim** — `bd sync --no-push` + `bd update <id> --status in_progress`
2. **Prep** — Kilo autonomous run: `/orchestrate-start-task`
3. **Execute** — Kilo autonomous run: `/orchestrate-execute-task`
4. **Gates** — Run `npm run ci` quality checks
5. **Close** — `bd close <id>` + `bd sync`

## Artifacts

Each run produces:

```
artifacts/supervisor/<run-id>/
  ├── events.jsonl           # Normalized event stream
  ├── run-summary.json       # Final status and metadata
  ├── stdout.log             # Standard output
  └── stderr.log             # Standard error
```

See also: `docs/YARDKIT_PARALLEL_LINES_MVP.md`

Sequential thinking sessions are exported to:

```
.kilocode/thinking/<chain>.json
```

## Dependencies

### External prerequisites

Must be available on the runner system:

- `bd` CLI (Beads)
- `git`
- Node.js (use pinned version from `.nvmrc`)
- `npm`

### Node packages

- `commander` — CLI framework
- `execa` — Subprocess execution
- `p-limit` — Concurrency control
- `pino` / `pino-pretty` — Structured logging
- `zod` — Schema validation

## Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build
npm run build

# Watch mode
npm run dev

# Run locally
npm start -- run --task example-task-id
```

## Implementation Status

### ✅ Phase 0 — Bootstrap (MVP)

- [x] Package structure
- [x] CLI command parsing (`run`, `shift`)
- [x] Configuration system with Zod validation
- [x] Structured logging
- [x] Artifact directory conventions

### 🚧 Phase 1 — Single-line run

- [x] State machine implementation
- [x] Beads integration stubs (`bd sync`, `bd update`, `bd close`)
- [ ] **TODO:** Kilo CLI invocation (autonomous mode)
- [ ] **TODO:** Quality gates execution in workspace
- [ ] **TODO:** Session export/import chain
- [ ] **TODO:** Lock management

### 📋 Phase 2 — Multi-line parallel

- [ ] Workspace pool allocation
- [ ] Git worktree isolation
- [ ] Task locks (file-based)
- [ ] Concurrency control
- [ ] Shift report generation

### 📋 Phase 3 — Determinism hardening

- [ ] Bounded retries
- [ ] Restoration contracts
- [ ] Health checks
- [ ] Crash recovery

## Architecture Decisions

### Workspace Isolation

**MVP:** Git worktrees
- Fast, disk-efficient
- One base clone + worktree per line

**V1:** Multiple clones
- Simplest isolation
- Higher disk usage

**V2:** Containers
- Strongest isolation
- Secret injection support

### Locking Strategy

**MVP:** File locks
- Atomic file creation at `artifacts/supervisor/locks/<task-id>.lock`
- Enforces "one active runner per task"

**V1:** SQLite locks
- Multi-process coordination
- Durable crash recovery

## References

- **Beads contract:** [AGENTS.md](../../AGENTS.md)
- **Beads rules:** [.kilocode/rules/beads.md](../../.kilocode/rules/beads.md)
- **Prep workflow:** [.kilocode/workflows/orchestrate-start-task.md](../../.kilocode/workflows/orchestrate-start-task.md)
- **Execute workflow:** [.kilocode/workflows/orchestrate-execute-task.md](../../.kilocode/workflows/orchestrate-execute-task.md)
- **Session chain:** [.kilocode/workflows/orchestrate-execute-task.md § Session continuity](../../.kilocode/workflows/orchestrate-execute-task.md#649)
- **Virtual environment mandate:** [.kilocode/rules/virtual-environment-mandate.md](../../.kilocode/rules/virtual-environment-mandate.md)

## License

MIT
