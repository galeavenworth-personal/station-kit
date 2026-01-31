# Agent Instructions (Kilo Factory Kit)

This repository uses **Beads** (`bd`) for task tracking.

## Non-negotiable contract

- **Beads is required.** Factory workflows assume a Beads-backed task loop.
- The kit ships templates under `.kilocode/` and a minimal `.beads/` directory, but it does **not** install Beads.
  - You must install the `bd` CLI separately and initialize/configure it for your repository.

## Quick reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Start work
bd close <id>         # Complete work
```

## Session start (required)

Sync Beads state from remote before starting work:

```bash
bd sync --no-push
```

## Session end (required)

When you intend to publish Beads state updates to the shared sync branch:

```bash
bd sync
```

## Two-clone safety rule (if you use multiple working copies)

- Do not work the **same issue ID** concurrently in two clones.
- Always run `bd sync --no-push` before switching clones.
