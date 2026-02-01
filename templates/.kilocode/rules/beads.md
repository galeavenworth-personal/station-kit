# Beads Task Tracking

Use 'bd' for task tracking throughout the project.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
```

## Session Start

Sync Beads state from remote before starting work:

```bash
bd sync --no-push
```

## Session End

When you intend to publish Beads state updates to the shared sync branch:

```bash
bd sync
```

## Integration

Beads is the authoritative source for task state.

**Required:** You must install and configure the `bd` CLI for your repository. The kit does not install Beads.

See [`AGENTS.md`](../../AGENTS.md) for the repository's required Beads workflow contract.
