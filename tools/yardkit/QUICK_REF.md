# Yardkit Quick Reference

## Installation & Build

```bash
cd tools/yardkit
npm install
npm run build
```

## CLI Commands

### Single line run
```bash
yardkit run --task <beads-id> [--timeout <sec>] [--workspace <path>]
```

### Multi-line shift
```bash
yardkit shift --max-parallel <n> [--queue ready] [--limit <n>]
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SUPERVISOR_MAX_PARALLEL` | `1` | Max concurrent lines |
| `SUPERVISOR_TIMEOUT_PREP` | `900` | Prep timeout (sec) |
| `SUPERVISOR_TIMEOUT_EXECUTE` | `1800` | Execute timeout (sec) |
| `SUPERVISOR_TIMEOUT_GATES` | `600` | Gates timeout (sec) |
| `SUPERVISOR_ARTIFACTS_DIR` | `artifacts/supervisor/` | Artifact output |
| `SUPERVISOR_WORKSPACE_POOL_DIR` | `~/.yardkit/workspaces` | Workspace pool |
| `SUPERVISOR_LOCKS_DIR` | `artifacts/supervisor/locks/` | Lock files |
| `SUPERVISOR_THINKING_DIR` | `.kilocode/thinking/` | Session exports |
| `SUPERVISOR_REPO_ROOT` | `$PWD` | Repo root path |

## Phase Flow

```
Claim → Prep → Execute → Gates → Close
  ↓       ↓       ↓        ↓
Failed  Failed  Failed  Failed
```

| Phase | Action | Timeout |
|-------|--------|---------|
| **Claim** | `bd sync --no-push` + `bd update <id> --status in_progress` | — |
| **Prep** | Kilo CLI: `/orchestrate-start-task` | 15 min |
| **Execute** | Kilo CLI: `/orchestrate-execute-task` | 30 min |
| **Gates** | `npm run ci` | 10 min |
| **Close** | `bd close <id>` + `bd sync` | — |

## Artifacts Output

```
artifacts/supervisor/
├── locks/<task-id>.lock       # Active task locks
└── <run-id>/                  # Run artifacts (UUID)
    ├── events.jsonl           # Event stream
    ├── run-summary.json       # Final status
    ├── stdout.log             # Stdout capture
    └── stderr.log             # Stderr capture

.kilocode/thinking/
├── <task-id>-prep.json        # Prep session
└── <task-id>-execute.json     # Execute session
```

## Troubleshooting

### Check build
```bash
npm run typecheck
npm run build
```

### Test CLI
```bash
node dist/cli.js --help
node dist/cli.js run --help
```

### Verify config
```bash
node -e "console.log(require('./dist/config.js').loadConfig())"
```

### Check locks
```bash
ls -lh artifacts/supervisor/locks/
```

### View recent runs
```bash
ls -lt artifacts/supervisor/*/run-summary.json | head -5
```

## Development

### Watch mode
```bash
npm run dev
```

### Run locally
```bash
npm start -- run --task test-id
```

### Link globally
```bash
npm link
yardkit --help
```

### Unlink
```bash
npm unlink -g @station-kit/yardkit
```

## Next Steps (TODOs)

- [ ] Implement Kilo CLI invocation (prep/execute phases)
- [ ] Implement Beads task fetching (`bd list --json`)
- [ ] Implement file-based lock manager
- [ ] Implement workspace pool (git worktrees)
- [ ] Add session export/import chain
- [ ] Run quality gates in isolated workspace
- [ ] Add bounded retries
- [ ] Add restoration contract support

## References

- [README.md](./README.md) — Full documentation
- [BOOTSTRAP_COMPLETE.md](./BOOTSTRAP_COMPLETE.md) — Setup status
- [ARTIFACTS.md](./ARTIFACTS.md) — Artifact structure examples
- [dev-setup.sh](./dev-setup.sh) — Development setup script
