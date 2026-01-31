# Schemas

This document is the single authoritative schema reference for the Kilo Factory Kit. All workflows and handoff packets MUST reference these definitions to avoid drift.

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
