# Yardkit Parallel Line Run — MVP Spec

## Purpose

Define the canonical MVP contract for Yardkit parallel line runs: the phase lifecycle, lock/workspace models, Kilo phase contracts, quality gate contract, and the artifacts/retention expectations that tie the system together.

## Non-goals

- **CURRENT:** Runtime CLI invocation of Kilo phases (prep/execute) is stubbed.
- **CURRENT:** Workspace isolation, lock acquisition, and multi-line parallelism are not implemented.
- **CURRENT:** Crash recovery and bounded retries are out of scope for MVP.
- **CONTRACT (MVP):** This spec documents the target behavior; implementation will follow in later tasks.

## Definitions

- **Line:** A single task execution lifecycle (claim → prep → execute → gates → close).
- **Workspace:** An isolated directory where a line executes; abstraction over worktrees/clones/containers.
- **Worktree:** Git worktree-based workspace isolation used by the MVP contract.
- **Lock:** A file-based ownership record enforcing one active runner per task.
- **Run:** A single line execution instance identified by `runId`.
- **Phase:** One of `claim`, `prep`, `execute`, `gates`, `close`.

## Lifecycle (Line Run)

### Contract (MVP)

1. **Claim** — Sync Beads, move task to `in_progress`.
2. **Prep** — Run Kilo prep workflow, export prep session.
3. **Execute** — Run Kilo execute workflow, import prep session, export execute session.
4. **Gates** — Run repo quality gates (at minimum `npm run ci`).
5. **Close** — Close task in Beads, sync state.

### CURRENT vs CONTRACT

- **CURRENT:** `runKiloPrepPhase()` and `runKiloExecutePhase()` are stubs (no Kilo CLI invocation).
- **CURRENT:** `runQualityGates()` runs `npm run ci` in repo root, not inside an isolated workspace.
- **CONTRACT (MVP):** Kilo phases execute with session export/import in the line’s workspace.
- **CONTRACT (MVP):** Quality gates run inside the line’s workspace.

## Lock Model

### Contract (MVP)

- **Lock file path:** `artifacts/supervisor/locks/<task-id>.lock`
- **Lock content:** see `LockInfo` schema in `docs/SCHEMAS.md`.
- **Ownership:** One active runner per task ID.
- **Heartbeat:** `timestamp` updated periodically during execution.

### CURRENT vs CONTRACT

- **CURRENT:** Lock creation/heartbeat not implemented.
- **CONTRACT (MVP):** Lock file is created atomically before `claim` completes and updated on phase transitions.

## Workspace / Worktree Model

### Contract (MVP)

- **Workspace types:** `worktree` (MVP), `clone`, `container`.
- **Worktree path:** under a configured workspace pool directory.
- **Workspace record:** see `WorkspaceInfo` schema in `docs/SCHEMAS.md`.

### CURRENT vs CONTRACT

- **CURRENT:** No workspace allocation exists; phases run in repo root.
- **CONTRACT (MVP):** A worktree is allocated per `runId` and all phases (prep/execute/gates) run inside it.

## Kilo Phase Contracts

### Prep Phase (Kilo)

- **Input:** `taskId`, empty workspace.
- **Actions:** Run `orchestrate-start-task` workflow.
- **Output:** Prep session export stored in `.kilocode/thinking/<task-id>-prep.json` (or `prep-session.json` within run artifacts).

### Execute Phase (Kilo)

- **Input:** `taskId`, prep session export.
- **Actions:** Run `orchestrate-execute-task` workflow.
- **Output:** Execute session export stored in `.kilocode/thinking/<task-id>-execute.json` (or `execute-session.json` within run artifacts).

### CURRENT vs CONTRACT

- **CURRENT:** Phases log warnings and do not execute Kilo CLI.
- **CONTRACT (MVP):** Kilo CLI is invoked with `--import/--export` paths stored in run artifacts.

## Quality Gates Contract

- **Gate entrypoint:** `npm run ci` (repo root gate).
- **Failure behavior:** Non-zero exit code fails the run.
- **Artifacts:** Gate output is captured in `stdout.log`/`stderr.log` (future).

### CURRENT vs CONTRACT

- **CURRENT:** Gate runs in repo root with no workspace isolation.
- **CONTRACT (MVP):** Gate runs inside the line’s workspace; logs are captured as artifacts.

## Artifacts & Retention

### CURRENT (documented structure)

See `tools/yardkit/ARTIFACTS.md` for the current expected structure:

- `artifacts/supervisor/<run-id>/events.jsonl`
- `artifacts/supervisor/<run-id>/run-summary.json`
- `artifacts/supervisor/locks/<task-id>.lock`
- `.kilocode/thinking/<task-id>-prep.json`
- `.kilocode/thinking/<task-id>-execute.json`

### CONTRACT (MVP)

- **Run summary:** Serialized `RunResult` with RFC3339 timestamps.
- **Event stream:** JSONL of `RunEvent` records with RFC3339 timestamps.
- **Retention:** locks cleaned up after completion; run artifacts retained per policy.

## Acceptance Criteria Traceability

This section links MVP requirements to concrete code touchpoints.

- **Prep phase contract** → `runKiloPrepPhase()` in `tools/yardkit/src/commands/run.ts`.
- **Execute phase contract** → `runKiloExecutePhase()` in `tools/yardkit/src/commands/run.ts`.
- **Quality gates contract** → `runQualityGates()` in `tools/yardkit/src/commands/run.ts`.
- **Run summary/event stream** → `saveRunResult()` in `tools/yardkit/src/commands/run.ts`.
- **Artifact layout reference** → `tools/yardkit/ARTIFACTS.md`.
- **Workspace/Lock schema alignment** → `WorkspaceInfo` and `LockInfo` in `tools/yardkit/src/types.ts`.

## CURRENT vs CONTRACT Summary

- **CURRENT:** Kilo phases stubbed; no workspace/lock implementation; gates run in repo root.
- **CONTRACT (MVP):** Worktree-per-run, file lock per task, Kilo phase execution with session export/import, gates in workspace, artifact logs persisted.
