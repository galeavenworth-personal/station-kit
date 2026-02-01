# Handoff Packet (Template)

## Purpose

The **Handoff Packet** is the execution-ready work order emitted by `/orchestrate-start-task` and consumed by `/orchestrate-execute-task`.

It is intentionally small and explicit: the goal is to transfer *decisions + scope + risks* without transferring unbounded chat logs.

Canonical schema reference: [`docs/SCHEMAS.md`](../../../../docs/SCHEMAS.md)

## JSON Template (minimal skeleton)

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
      "runtime_mode_reported": "orchestrator"
    }
  ]
}
```

## Notes

- Always include `runtime_attestations` for the parent and each subtask that produced a handoff.
- Keep this payload small; link out to files on disk rather than pasting logs.
