# 10-minute walkthrough (toy run)

This walkthrough is meant to let a reviewer understand the factory-line flow quickly without needing access to your private projects.

## Setup (one-time)

1) Copy templates into a target repo:
- Follow [`docs/INSTALL.md`](INSTALL.md)

2) Replace all `{{SK_*}}` tokens:
- Use [`docs/CONFIG_REFERENCE.md`](CONFIG_REFERENCE.md)

## Demo scenario

Assume you have a task ID in Beads: `demo-001`.

### Step 1: Start task (prep)

Run:

```text
/orchestrate-start-task demo-001
```

Expected outputs:

- A preparation plan and a handoff packet
- A sequential thinking export in `.kilocode/thinking/`

Template reference:
- Handoff packet: [`templates/.kilocode/contracts/handoff/handoff_packet.md`](../templates/.kilocode/contracts/handoff/handoff_packet.md)

### Step 2: Execute task

After you approve the prep plan:

```text
/orchestrate-execute-task demo-001
```

Expected behavior:

- Implementation happens in isolated subtasks.
- Quality gates are run.

If a gate stalls/timeouts, execution routes to Fitter using a Line Fault Contract:

- Fault contract: [`templates/.kilocode/contracts/line_health/line_fault_contract.md`](../templates/.kilocode/contracts/line_health/line_fault_contract.md)
- Restoration contract: [`templates/.kilocode/contracts/line_health/restoration_contract.md`](../templates/.kilocode/contracts/line_health/restoration_contract.md)

### Step 3: Respond to PR review

Assume a PR number `123`.

```text
/orchestrate-respond-to-pr-review 123
```

Expected outputs:

- A Comment Ledger containing every review item
- A response plan and implementation clusters
- Explicit acknowledgements posted via `gh`

Template reference:
- Comment ledger template: [`templates/.kilocode/contracts/pr_review/comment_ledger.md`](../templates/.kilocode/contracts/pr_review/comment_ledger.md)

## What to look for (as a reviewer)

1) **Contracts are explicit**
- The work order is not implicit chat memory.

2) **Execution is supervised**
- No code changes happen until prep is approved.

3) **Failure handling is bounded**
- Stalls and timeouts do not lead to infinite retries.

4) **Work is closed-loop**
- Beads state is updated.
- PR review feedback is acknowledged.
