# Schemas

This document is the single authoritative schema reference for the Station Kit. All workflows and handoff packets MUST reference these definitions to avoid drift.

---

## runtime_attestation (object)

**Purpose:** Record the runtime model/mode observed in a task or subtask.

```json
{
  "subtask": "Parent (Orchestrator)",
  "runtime_model_reported": "<from environment_details>",
  "runtime_mode_reported": "<mode slug>"
}
```

### Fields
- `subtask` (string, required): Human-readable label for the subtask or parent.
- `runtime_model_reported` (string, required): Exact model string reported by the runtime.
- `runtime_mode_reported` (string, required): Mode slug (e.g., `architect`, `code`, `orchestrator`).

---

## runtime_attestations (array)

**Purpose:** Capture a runtime attestation per subtask plus a parent rollup entry.

```json
[
  {
    "subtask": "Parent (Orchestrator)",
    "runtime_model_reported": "<from environment_details>",
    "runtime_mode_reported": "orchestrator"
  },
  {
    "subtask": "Discovery",
    "runtime_model_reported": "<from environment_details>",
    "runtime_mode_reported": "architect"
  }
]
```

---

## Handoff packet (minimal skeleton)

**Purpose:** Provide an execution-ready work order from preparation workflows.

```json
{
  "task_id": "<task-id>",
  "session_export": ".kilocode/thinking/task-<task-id>-prep-<YYYY-MM-DD>.json",
  "decision": {
    "approach": "<approach-name>",
    "rationale": "<why>"
  },
  "success_criteria": [
    "<criterion-1>",
    "<criterion-2>"
  ],
  "subtasks": [
    {"id": 1, "description": "<subtask-1>", "status": "pending"}
  ],
  "files_touched": [
    {"path": "<file-1>", "purpose": "<purpose>"}
  ],
  "risks": [
    {"risk": "<risk-1>", "mitigation": "<mitigation-1>"}
  ],
  "tests": [
    "<test-1>"
  ],
  "runtime_attestations": [
    {
      "subtask": "Parent (Orchestrator)",
      "runtime_model_reported": "<from environment_details>",
      "runtime_mode_reported": "<mode slug>"
    }
  ]
}
```

---

## PR review ledger row (object)

**Purpose:** Track every review/comment item with stable identifiers and explicit status.

```json
{
  "row_id": "PRR-001",
  "type": "review|conversation",
  "comment_id": "<gh_comment_id_or_null>",
  "thread_id": "<gh_review_thread_id_or_null>",
  "comment_url": "<comment_url_or_null>",
  "path": "<file-path-or-null>",
  "line": 123,
  "side": "RIGHT|LEFT|UNKNOWN",
  "author": "<login>",
  "category": "blocking|suggestion|question|nit|praise",
  "summary": "<short description>",
  "proposed_disposition": "fix|clarify|decline|defer",
  "status": "open|in_progress|ready_to_ack|acknowledged|wontfix",
  "commit": "<sha-or-null>",
  "ack_reference": "<reply_url_or_comment_id_or_null>"
}
```

### Field requirements
- `row_id` (string, required): Stable ID `PRR-001`, `PRR-002`, ...; **never renumber** between updates.
- `type` (string, required): `review` (line-specific) or `conversation` (PR-level comment).
- `comment_id` (string|null): Required for `type=review` (GitHub review comment ID).
- `thread_id` (string|null): Required for `type=review` (GitHub review thread ID).
- `comment_url` (string|null): Required for `type=review` (URL of the specific comment).
- `path` (string|null): Required for `type=review`.
- `line` (number|null): Required for `type=review`.
- `side` (string): `RIGHT`, `LEFT`, or `UNKNOWN`.
- `author` (string, required): GitHub login.
- `category` (string, required): `blocking|suggestion|question|nit|praise`.
- `summary` (string, required): Human-readable summary of the feedback.
- `proposed_disposition` (string, required): `fix|clarify|decline|defer`.
- `status` (string, required): `open|in_progress|ready_to_ack|acknowledged|wontfix`.
- `commit` (string|null): Commit SHA where the fix landed (if applicable).
- `ack_reference` (string|null): Reply URL or comment ID used for acknowledgement.

### Status lifecycle
1. `open` → intake
2. `in_progress` → actively being addressed
3. `ready_to_ack` → fix/decision complete, awaiting public acknowledgement
4. `acknowledged` → reply posted
5. `wontfix` → explicitly declined with rationale

---

## PR review thread inventory (object)

**Purpose:** Enumerate every review thread so ledger and acknowledgements can be reconciled.

```json
{
  "pr_number": 123,
  "repo": "<owner>/<repo>",
  "threads": [
    {
      "thread_id": "<gh_review_thread_id>",
      "comment_url": "<thread_or_comment_url>",
      "is_resolved": false,
      "path": "<file-path-or-null>",
      "line": 123,
      "side": "RIGHT|LEFT|UNKNOWN",
      "author": "<login>",
      "comment_ids": ["<comment_id>"]
    }
  ]
}
```

### Field requirements
- `pr_number` (number, required): Pull request number.
- `repo` (string, required): `owner/repo`.
- `threads` (array, required): Collection of thread records.
- `thread_id` (string, required): GitHub review thread ID (GraphQL).
- `comment_url` (string, required): URL to a comment in the thread.
- `is_resolved` (boolean, required): Thread resolved state.
- `path` (string|null): File path for line-specific threads.
- `line` (number|null): Line number for line-specific threads.
- `side` (string): `RIGHT`, `LEFT`, or `UNKNOWN`.
- `author` (string, required): GitHub login for the thread author.
- `comment_ids` (array, required): Review comment IDs in the thread.

---

## PR review ack matrix (object)

**Purpose:** Map every review thread to an action and acknowledgement reference.

```json
{
  "pr_number": 123,
  "repo": "<owner>/<repo>",
  "rows": [
    {
      "thread_id": "<gh_review_thread_id>",
      "action": "fix|clarify|decline|defer",
      "ack_reference": "<reply_url_or_comment_id>",
      "ledger_row_ids": ["PRR-001"]
    }
  ]
}
```

### Field requirements
- `pr_number` (number, required): Pull request number.
- `repo` (string, required): `owner/repo`.
- `rows` (array, required): Collection of ack rows.
- `thread_id` (string, required): GitHub review thread ID.
- `action` (string, required): `fix|clarify|decline|defer`.
- `ack_reference` (string, required): Reply URL or PR comment ID used for acknowledgement.
- `ledger_row_ids` (array, required): Ledger row IDs covered by this thread.

---

## Yardkit lock record (object)

**Purpose:** Record ownership for a task line run. Aligned with `LockInfo`.

```json
{
  "taskId": "TASK-123",
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "pid": 12345,
  "hostname": "worker-01",
  "timestamp": "2026-02-04T10:30:00.000Z"
}
```

### Fields
- `taskId` (string, required): Beads task identifier.
- `runId` (string, required): UUID for the line run.
- `pid` (number, required): Process ID of the runner.
- `hostname` (string, required): Hostname of the runner.
- `timestamp` (string, required): RFC3339 timestamp string.

---

## Yardkit workspace record (object)

**Purpose:** Describe the workspace assigned to a line run. Aligned with `WorkspaceInfo`.

```json
{
  "path": "/workspaces/yardkit/run-550e8400-e29b-41d4-a716-446655440000",
  "type": "worktree",
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "taskId": "TASK-123"
}
```

### Fields
- `path` (string, required): Filesystem path to the workspace root.
- `type` (string, required): `worktree` | `clone` | `container`.
- `runId` (string, required): UUID for the line run.
- `taskId` (string, required): Beads task identifier.

---

## Yardkit run summary (object)

**Purpose:** Final result for a line run. Serialized from `RunResult` with RFC3339 timestamps.

```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "taskId": "TASK-123",
  "status": "success",
  "phase": "close",
  "startTime": "2026-02-04T10:30:00.000Z",
  "endTime": "2026-02-04T11:20:18.901Z",
  "exitCode": 0,
  "events": [
    {
      "timestamp": "2026-02-04T10:30:00.000Z",
      "phase": "claim",
      "event": "phase_start"
    }
  ]
}
```

### Fields
- `runId` (string, required): UUID for the line run.
- `taskId` (string, required): Beads task identifier.
- `status` (string, required): `success` | `failed`.
- `phase` (string, required): `claim` | `prep` | `execute` | `gates` | `close`.
- `startTime` (string, required): RFC3339 timestamp string.
- `endTime` (string, required): RFC3339 timestamp string.
- `exitCode` (number, required): Exit code from the line run.
- `events` (array, required): Array of `Yardkit run event` objects.
- `error` (string, optional): Error message if status is `failed`.

---

## Yardkit run event (object)

**Purpose:** One event in the line run stream. Serialized from `RunEvent` with RFC3339 timestamps.

```json
{
  "timestamp": "2026-02-04T10:30:00.000Z",
  "phase": "claim",
  "event": "phase_start",
  "data": {
    "duration": 5123
  }
}
```

### Fields
- `timestamp` (string, required): RFC3339 timestamp string.
- `phase` (string, required): `claim` | `prep` | `execute` | `gates` | `close`.
- `event` (string, required): Event name (`phase_start`, `phase_complete`, `phase_failed`, etc.).
- `data` (object, optional): Event-specific payload.
