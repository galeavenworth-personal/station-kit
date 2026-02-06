# PR Review Thread Inventory (Template)

## Purpose

The **Thread Inventory** enumerates every review thread so ledger and acknowledgements can be reconciled.

Canonical schema reference: [`docs/SCHEMAS.md`](../../../../docs/SCHEMAS.md)

## Inventory file shape (recommended)

Store the inventory as JSON (array of thread records) plus optional metadata.

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
      "side": "RIGHT",
      "author": "<login>",
      "comment_ids": ["<comment_id>"]
    }
  ]
}
```

## Thread inventory rules (non-negotiable)

- Every review thread must appear exactly once.
- `thread_id` and `comment_url` are required for every thread.
- `comment_ids` must include every comment in the thread.
