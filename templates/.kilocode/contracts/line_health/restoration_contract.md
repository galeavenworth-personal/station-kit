# Restoration Contract (Template)

## Purpose

A **Restoration Contract** is the minimal payload returned by Fitter → Orchestrator describing what mitigation was applied in the workflow/runner layer, how it was verified, and what Fit Profile adjustments are now recommended.

Orchestrator uses this contract to decide whether to retry the blocked station (bounded).

## Minimum MVP Fields

- `gate_id` (string): stable identifier for the gate.
- `mitigation_applied` (array[string]): what changed (budgets/invocation/env alignment), phrased concretely.
- `verification_run` (object): evidence that the mitigation was exercised.
- `updated_fit_profile` (object): updated budgets/notes for future runs.

## JSON Example (MVP)

```json
{
  "gate_id": "pytest-not-live",
  "mitigation_applied": [
    "Increase no-output (stall) budget from 60s → 180s for pytest gates",
    "Adjust invocation to show progress: add '-vv' to reduce false stall classification"
  ],
  "verification_run": {
    "invocation": "{{KFK_PYTHON_RUNNER}} -m pytest -m 'not live' -vv",
    "status": "PASS",
    "elapsed_seconds": 410
  },
  "updated_fit_profile": {
    "timeout_seconds": 900,
    "stall_seconds": 180,
    "notes": "Gate produces sparse output at ~6% while collecting; higher verbosity makes progress visible. Budgets updated accordingly.",
    "confidence": "medium"
  }
}
```
