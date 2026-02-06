# PR Review Comment Ledger (Template)

## Purpose

The **Comment Ledger** is the authoritative, stable record of every PR review item.

Invariant: **no completion until every ledger row is acknowledged**.

Canonical row schema reference: [`docs/SCHEMAS.md`](../../../../docs/SCHEMAS.md)

## Ledger file shape (recommended)

Store the ledger as JSON (array of rows) plus optional metadata.

```json
{
  "pr_number": 123,
  "repo": "<owner>/<repo>",
  "rows": [
    {
      "row_id": "PRR-001",
      "type": "review",
      "comment_id": "<gh_comment_id>",
      "thread_id": "<gh_review_thread_id>",
      "comment_url": "<comment_url>",
      "path": "<file-path>",
      "line": 123,
      "side": "RIGHT",
      "author": "<login>",
      "category": "blocking",
      "summary": "<short description>",
      "proposed_disposition": "fix",
      "status": "open",
      "commit": null,
      "ack_reference": null
    }
  ]
}
```

## Row ID rules (non-negotiable)

- Use stable IDs: `PRR-001`, `PRR-002`, ...
- **Never renumber**. If you delete a row, mark it `wontfix` with rationale instead.

## Status lifecycle (recommended)

1. `open` → intake
2. `in_progress` → actively being addressed
3. `ready_to_ack` → fix/decision complete, awaiting public acknowledgement
4. `acknowledged` → reply posted
5. `wontfix` → explicitly declined with rationale

## Suggested table view (human-friendly)

| row_id | category | summary | status | disposition | ack_reference |
| --- | --- | --- | --- | --- | --- |
| PRR-001 | blocking | <summary> | open | fix | <url or id> |
