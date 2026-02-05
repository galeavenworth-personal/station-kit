# Yardkit Bootstrap — Setup Complete ✓

## What was created

### Package structure
- ✅ `tools/yardkit/` — New TypeScript package
- ✅ `package.json` — Dependencies configured (commander, execa, p-limit, pino, zod)
- ✅ `tsconfig.json` — Strict TypeScript configuration
- ✅ `.gitignore` — Build artifacts and dependencies excluded

### Source files
- ✅ `src/cli.ts` — Main CLI entry point with Commander
- ✅ `src/config.ts` — Configuration module with Zod validation
- ✅ `src/logger.ts` — Pino structured logging
- ✅ `src/types.ts` — TypeScript type definitions
- ✅ `src/commands/run.ts` — Single-line run command (MVP implementation)
- ✅ `src/commands/shift.ts` — Multi-line shift command (stub)
- ✅ `src/index.ts` — Public API exports

### Artifact directories
- ✅ `artifacts/supervisor/` — Run artifacts output location
- ✅ `artifacts/supervisor/locks/` — Task lock files

### Documentation
- ✅ `README.md` — Complete usage guide and architecture documentation

## Verification

Build successful:
```bash
npm run build  # ✓ Compiles without errors
```

CLI functional:
```bash
node dist/cli.js --help  # ✓ Displays help
node dist/cli.js run --help  # ✓ Run command available
node dist/cli.js shift --help  # ✓ Shift command available
```

## Acceptance criteria status

- ✅ **`tools/yardkit/` exists and can run `yardkit --help`**
- ✅ **Configuration is documented and validated** (Zod schemas + README)
- 🚧 **Single-line run implementation** (state machine complete, integration stubs in place)

## Next steps (Phase 1 completion)

### Critical integrations needed

1. **Kilo CLI invocation** (currently stubbed)
   - Location: [src/commands/run.ts:172-189](../src/commands/run.ts#L172-L189)
   - Needs: Actual `kilocode --auto --json` command invocation
   - References:
     - `/orchestrate-start-task` workflow
     - `/orchestrate-execute-task` workflow
     - Session export/import chains

2. **Beads task fetching** (currently stubbed)
   - Location: [src/commands/shift.ts:65-81](../src/commands/shift.ts#L65-L81)
   - Needs: `bd list --status ready --json` integration
   - Parse JSON output to get task IDs

3. **Lock management** (not yet implemented)
   - Create file-based locks at: `artifacts/supervisor/locks/<task-id>.lock`
   - Atomic lock acquisition with heartbeat timestamps
   - Enforce "one active runner per task" invariant

4. **Workspace isolation** (not yet implemented)
   - MVP: Git worktree allocation
   - Create worktree per run-id
   - Run quality gates (`npm run ci`) inside isolated workspace

5. **Session continuity** (not yet implemented)
   - Export prep session: `.kilocode/thinking/<task-id>-prep.json`
   - Import prep session for execute phase
   - Export execute session: `.kilocode/thinking/<task-id>-execute.json`

### Testing checklist

- [ ] Run against a real Beads task
- [ ] Verify artifacts output structure
- [ ] Confirm `bd` CLI integration works
- [ ] Test quality gates execution
- [ ] Validate session export/import chain
- [ ] Test lock acquisition/release
- [ ] Verify workspace cleanup

## Configuration reference

All configuration via environment variables:

```bash
# Core settings
export SUPERVISOR_MAX_PARALLEL=1
export SUPERVISOR_REPO_ROOT=/path/to/station-kit

# Timeouts (seconds)
export SUPERVISOR_TIMEOUT_PREP=900      # 15 min
export SUPERVISOR_TIMEOUT_EXECUTE=1800  # 30 min
export SUPERVISOR_TIMEOUT_GATES=600     # 10 min

# Paths
export SUPERVISOR_ARTIFACTS_DIR=artifacts/supervisor
export SUPERVISOR_WORKSPACE_POOL_DIR=~/.yardkit/workspaces
export SUPERVISOR_LOCKS_DIR=artifacts/supervisor/locks
export SUPERVISOR_THINKING_DIR=.kilocode/thinking
```

## Architecture overview

```
Yardkit (control plane)
  ├── Task claim (bd sync/update)
  ├── Workspace allocation
  ├── Phase execution
  │   ├── Prep → Kilo CLI (orchestrate-start-task)
  │   ├── Execute → Kilo CLI (orchestrate-execute-task)
  │   └── Gates → npm run ci
  ├── Result reconciliation
  └── Task close (bd close/sync)
```

## Development workflow

```bash
# Install
cd tools/yardkit
npm install

# Development (watch mode)
npm run dev

# Build
npm run build

# Run locally
npm start -- run --task <id>
npm start -- shift --max-parallel 4

# Type check only
npm run typecheck
```

## Troubleshooting

### "bd: command not found"
- Ensure Beads CLI is installed and in PATH
- Set `SUPERVISOR_REPO_ROOT` to station-kit directory

### "ENOENT: no such file or directory"
- Run from repository root or set `SUPERVISOR_REPO_ROOT`
- Ensure artifact directories exist: `mkdir -p artifacts/supervisor/locks`

### TypeScript errors
- Run `npm run typecheck` to see full error list
- Check Node version matches `.nvmrc`

## References

- **Beads integration:** [AGENTS.md](../../../AGENTS.md)
- **Workflow procedures:** [.kilocode/workflows/](../../../.kilocode/workflows/)
- **Bootstrap spec:** (the original spec that generated this workspace)
