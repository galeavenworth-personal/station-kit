# Yardkit Run Artifacts — Expected Structure

This document shows the expected artifact output structure for a Yardkit run.

## Directory layout

```
artifacts/supervisor/
├── locks/
│   └── <task-id>.lock              # Lock file (atomic, with heartbeat)
└── <run-id>/                        # UUID for this run
    ├── events.jsonl                 # Event stream (one JSON object per line)
    ├── run-summary.json             # Final run result
    ├── stdout.log                   # Captured stdout (future)
    └── stderr.log                   # Captured stderr (future)

.kilocode/thinking/
├── <task-id>-prep.json              # Prep phase session export
└── <task-id>-execute.json           # Execute phase session export
```

## Example: events.jsonl

```jsonl
{"timestamp":"2026-02-04T10:30:00.000Z","phase":"claim","event":"phase_start"}
{"timestamp":"2026-02-04T10:30:05.123Z","phase":"claim","event":"phase_complete","data":{"duration":5123}}
{"timestamp":"2026-02-04T10:30:05.124Z","phase":"prep","event":"phase_start"}
{"timestamp":"2026-02-04T10:45:32.456Z","phase":"prep","event":"phase_complete","data":{"duration":927332}}
{"timestamp":"2026-02-04T10:45:32.457Z","phase":"execute","event":"phase_start"}
{"timestamp":"2026-02-04T11:15:48.789Z","phase":"execute","event":"phase_complete","data":{"duration":1816332}}
{"timestamp":"2026-02-04T11:15:48.790Z","phase":"gates","event":"phase_start"}
{"timestamp":"2026-02-04T11:20:12.345Z","phase":"gates","event":"phase_complete","data":{"duration":263555}}
{"timestamp":"2026-02-04T11:20:12.346Z","phase":"close","event":"phase_start"}
{"timestamp":"2026-02-04T11:20:18.901Z","phase":"close","event":"phase_complete","data":{"duration":6555}}
```

## Example: run-summary.json

### Successful run

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
    },
    {
      "timestamp": "2026-02-04T10:30:05.123Z",
      "phase": "claim",
      "event": "phase_complete",
      "data": {
        "duration": 5123
      }
    }
  ]
}
```

### Failed run

```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440001",
  "taskId": "TASK-124",
  "status": "failed",
  "phase": "execute",
  "startTime": "2026-02-04T12:00:00.000Z",
  "endTime": "2026-02-04T12:15:30.456Z",
  "exitCode": 1,
  "error": "Quality gates failed with exit code 1",
  "events": [
    {
      "timestamp": "2026-02-04T12:00:00.000Z",
      "phase": "claim",
      "event": "phase_start"
    },
    {
      "timestamp": "2026-02-04T12:15:25.123Z",
      "phase": "gates",
      "event": "phase_start"
    },
    {
      "timestamp": "2026-02-04T12:15:30.456Z",
      "phase": "gates",
      "event": "phase_failed",
      "data": {
        "error": "Quality gates failed with exit code 1"
      }
    }
  ]
}
```

## Example: Lock file

**File:** `artifacts/supervisor/locks/TASK-123.lock`

```json
{
  "taskId": "TASK-123",
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "pid": 12345,
  "hostname": "worker-01",
  "timestamp": "2026-02-04T10:30:00.000Z"
}
```

## Example: Session export

**File:** `.kilocode/thinking/TASK-123-prep.json`

```json
{
  "sessionId": "prep-TASK-123",
  "taskId": "TASK-123",
  "phase": "prep",
  "timestamp": "2026-02-04T10:45:32.456Z",
  "thinking": [
    {
      "step": 1,
      "thought": "Analyzing task requirements...",
      "decision": "Will use orchestrate-start-task workflow"
    }
  ],
  "artifacts": {
    "taskAnalysis": "...",
    "prepPlan": "..."
  }
}
```

## Querying artifacts

### Find all runs for a task

```bash
# Find by task ID in run summaries
find artifacts/supervisor -name "run-summary.json" -exec grep -l "TASK-123" {} \;
```

### Get recent run status

```bash
# Most recent run
ls -t artifacts/supervisor/*/run-summary.json | head -1 | xargs cat | jq .status
```

### Check active locks

```bash
# List all active locks
ls artifacts/supervisor/locks/*.lock 2>/dev/null || echo "No active locks"
```

### Tail event stream

```bash
# Watch events in real-time
tail -f artifacts/supervisor/<run-id>/events.jsonl | jq .
```

## Retention policy (future)

Recommended artifact retention:

- **Locks:** Clean up after task completion (max 24 hours)
- **Run artifacts:** Keep for 30 days
- **Session exports:** Keep permanently (version controlled)
- **Logs:** Keep for 7 days, compress after 1 day

## Restoration (future)

From the run-summary.json and session exports, a failed run can be:
1. Analyzed for root cause
2. Resumed from last successful phase
3. Replayed with same parameters
