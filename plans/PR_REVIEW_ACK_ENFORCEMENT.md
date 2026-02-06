# PR Review Acknowledgement Enforcement Plan

## Background / Problem

The current PR review response workflow requires a comment ledger and acknowledgements, but it does not enforce a full reconciliation between review threads, ledger rows, and acknowledgements. This allows missed threads or incomplete acknowledgements to slip through. The gap was observed while responding to PR #7 and is reflected in the workflow and ledger contracts.

References:
- Workflow: [`orchestrate-respond-to-pr-review.md`](../.kilocode/workflows/orchestrate-respond-to-pr-review.md)
- Template mirror: [`orchestrate-respond-to-pr-review.md`](../templates/.kilocode/workflows/orchestrate-respond-to-pr-review.md)
- Ledger contract: [`comment_ledger.md`](../.kilocode/contracts/pr_review/comment_ledger.md)
- Schema reference: [`docs/SCHEMAS.md`](../docs/SCHEMAS.md)

## Goals

- Require a thread inventory step that enumerates **every PR review thread** (with a fallback if `gh pr view --json reviewThreads` is unavailable).
- Require a `thread_inventory` artifact (stable, exportable, auditable).
- Extend ledger rows to include `thread_id` and `comment_url` and enforce reconciliation against thread inventory.
- Add a mandatory **Ack Matrix** artifact that maps every thread to its action and acknowledgement reference.
- Add reconciliation gates that hard-stop when inventory ↔ ledger or inventory ↔ ack matrix are incomplete.

## Non-Goals

- Rewriting GH API tooling or adding new CLI tools.
- Changing the meaning of existing ledger statuses beyond adding fields.
- Auto-posting acknowledgements (still a human/agent action).

## Acceptance Criteria

- **Coverage gates:**
  - Inventory ↔ ledger parity gate: every `thread_id` in inventory appears in ledger rows (1+ rows per thread).
  - Inventory ↔ ack matrix parity gate: every `thread_id` appears in ack matrix exactly once.
- **Stable identifiers:** thread inventory uses `thread_id` from GH (GraphQL ID) as the stable key.
- **GraphQL fallback:** when `gh pr view --json reviewThreads` is unsupported or incomplete, workflow uses `gh api graphql` to fetch review threads.
- **Required artifacts:** `thread_inventory` and `ack_matrix` are mandatory outputs before completion.

## Proposed Workflow Edits (section-by-section)

> Target docs: [`orchestrate-respond-to-pr-review.md`](../.kilocode/workflows/orchestrate-respond-to-pr-review.md) and template mirror [`orchestrate-respond-to-pr-review.md`](../templates/.kilocode/workflows/orchestrate-respond-to-pr-review.md).

### Overview / Key Invariant

- Add explicit invariant: **no completion until thread inventory, ledger, and ack matrix reconcile**.

### Subtask A — Intake + Ledger

- Add **Thread Inventory** step **before** ledger creation.
- Include commands:
  - Primary: `gh pr view <PR> --json reviewThreads` (if supported).
  - Fallback: `gh api graphql` query for `pullRequest { reviewThreads { nodes { id isResolved comments { nodes { id url body author { login } path line side createdAt } } } } }`.
- Require output artifact `thread_inventory` stored alongside ledger.
- Update output requirements to include `thread_inventory` and reconciliation summary.

### Subtask E — Acknowledge All Comments

- Require **Ack Matrix** artifact mapping each thread to action + ack reference.
- Add reconciliation check: ack matrix coverage must equal thread inventory coverage.
- Require that every ack reference is traceable to a GH URL or comment id.

### Complete Step

- Final report must include:
  - Inventory count vs ledger count (threads covered).
  - Ack matrix coverage (100%).

## Proposed Schema / Contract Edits

> Target docs: [`comment_ledger.md`](../.kilocode/contracts/pr_review/comment_ledger.md) and [`docs/SCHEMAS.md`](../docs/SCHEMAS.md).

### Ledger Row Additions

Add fields to PR review ledger row:

- `thread_id` (string, required for review threads)
- `comment_url` (string, required for review comments; nullable for conversation-only rows)

### Ack Matrix Contract

Define a new artifact schema in [`docs/SCHEMAS.md`](../docs/SCHEMAS.md):

```json
{
  "pr_number": 123,
  "repo": "<owner>/<repo>",
  "threads": [
    {
      "thread_id": "<gh_thread_id>",
      "comment_ids": ["<gh_comment_id>", "<gh_comment_id>"] ,
      "action": "fix|clarify|decline|defer|multi",
      "ack_reference": "<reply_url_or_comment_id>",
      "ledger_row_ids": ["PRR-001", "PRR-002"]
    }
  ]
}
```

## Data Structures

### `thread_inventory`

```json
{
  "pr_number": 123,
  "repo": "<owner>/<repo>",
  "threads": [
    {
      "thread_id": "<gh_thread_id>",
      "is_resolved": false,
      "comments": [
        {
          "comment_id": "<gh_comment_id>",
          "comment_url": "<url>",
          "author": "<login>",
          "path": "<file-path>",
          "line": 123,
          "side": "RIGHT|LEFT|UNKNOWN",
          "created_at": "<iso-8601>",
          "body": "<comment body>"
        }
      ]
    }
  ]
}
```

### `ack_matrix`

```json
{
  "pr_number": 123,
  "repo": "<owner>/<repo>",
  "threads": [
    {
      "thread_id": "<gh_thread_id>",
      "action": "fix|clarify|decline|defer|multi",
      "ack_reference": "<reply_url_or_comment_id>",
      "ledger_row_ids": ["PRR-001", "PRR-002"],
      "notes": "<optional>"
    }
  ]
}
```

## Implementation Steps Checklist

1. Update workflow docs to require thread inventory and artifacts (installed + template).
2. Add reconciliation gates to workflow text (inventory ↔ ledger, inventory ↔ ack matrix).
3. Update ledger contract template with `thread_id` + `comment_url` fields.
4. Update `docs/SCHEMAS.md` with ledger row fields and new ack matrix schema.
5. Add examples in workflow or ledger docs showing required artifacts.
6. Validate internal references and line links.

## Test Plan

- **Positive case:** Run workflow against a PR with multiple review threads; verify:
  - Thread inventory count matches ledger coverage.
  - Ack matrix includes every thread_id.
  - Completion blocked until 100% coverage.
- **Negative case:** Intentionally omit a thread from ledger or ack matrix; workflow must hard-stop with a reconciliation error.

## Rollout Notes

- Update **both** installed workflow and template mirror to maintain parity.
- Communicate that acknowledgements now require explicit per-thread mapping and reconciliation artifacts.
- Existing users must regenerate or update their workflows/ledger templates to include `thread_id`, `comment_url`, and ack matrix artifacts.
