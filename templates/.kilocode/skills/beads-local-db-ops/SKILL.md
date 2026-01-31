---
name: beads-local-db-ops
description: Use Beads (bd) with sync-branch workflow for task tracking across two-clone setup.
---

# Beads Sync-Branch Ops

## Goal

Use Beads with sync-branch model where:

- Local SQLite (`.beads/beads.db`) is a fast cache
- Remote `beads-sync` branch is the shared truth
- Two clones sync via remote rendezvous

## Two-Clone Model (recommended)

- **Clone A:** `/path/to/clone-a/` (secondary working copy)
- **Clone B:** `/path/to/clone-b/` (primary working copy)
- Each clone has its own `.git/`, virtual environment, and `.beads/beads.db`
- Remote repo is the rendezvous point
- **Never assign the same task to both clones concurrently**

## When to use this skill

Use this skill for:

- Session start: sync state from remote
- During work: update issue status locally
- Session end: push state to remote

## Critical Workflow

### Session Start

```bash
# Pull latest state from remote (no push)
bd sync --no-push

# Find available work
bd ready

# Claim an issue
bd update <id> --status in_progress
```

### During Work

```bash
# View issue details
bd show <id>

# Update status
bd update <id> --status in_progress

# Add notes as you learn
bd update <id> --notes "..."
```

### Session End

```bash
# Close completed issues
bd close <id>

# Push state to remote
bd sync
```

## Operational Contract

- Always run `bd sync --no-push` at session start
- Only one clone runs daemon at a time (optional but clean)
- When switching employees, run `bd sync --no-push` before starting new work
- Never work on same issue in both clones concurrently

## Troubleshooting

- If Beads feels slow, ensure you are not in `no-db` mode
- If sync conflicts occur, remote `beads-sync` branch is authoritative
- Local DB is cache; sync operations reconcile with remote truth
