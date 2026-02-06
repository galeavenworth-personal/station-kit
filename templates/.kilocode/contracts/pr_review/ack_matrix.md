# PR Review Ack Matrix (Template)

## Purpose

The **Ack Matrix** maps every review thread to its action and acknowledgement reference.

Canonical schema reference: [`docs/SCHEMAS.md`](../../../../docs/SCHEMAS.md)

## Ack matrix file shape (recommended)

Store the matrix as JSON (array of rows) plus optional metadata.

```json
{
  "pr_number": 123,
  "repo": "<owner>/<repo>",
  "rows": [
    {
      "thread_id": "<gh_review_thread_id>",
      "action": "fix",
      "ack_reference": "<reply_url_or_comment_id>",
      "ledger_row_ids": ["PRR-001"]
    }
  ]
}
```

## Ack matrix rules (non-negotiable)

- Every thread in the inventory must appear exactly once.
- `ack_reference` must point to a posted reply or PR comment.
- `ledger_row_ids` must reconcile to the ledger rows for the thread.
