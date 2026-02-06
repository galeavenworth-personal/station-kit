---
description: Orchestrator-based workflow for responding to PR review feedback. Uses subtasks for intake, planning, implementation, quality gates, and acknowledging every comment.
auto_execution_mode: 3
---

# Orchestrate Respond to PR Review Workflow

**Purpose:** Factory-line PR review response using Orchestrator Mode. Parent coordinates; subtasks do intake, planning, implementation, verification, and **comment acknowledgement**.

**Trigger:** User invokes `/orchestrate-respond-to-pr-review <pr-number>`

---

## Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  PARENT (Orchestrator Mode)                                          │
│  ├── Subtask A (Architect): Review Intake + Comment Ledger           │
│  ├── Subtask B (Architect): Response Planning (sequential thinking)  │
│  ├── Subtask C..N (Code): Implement comment clusters                 │
│  ├── Subtask X (Code): Quality gates (format/lint/typecheck/test)    │
│  ├── Subtask Y (Code): Acknowledge every ledger row via gh replies   │
│  └── Complete: summary + next steps                                  │
└──────────────────────────────────────────────────────────────────────┘
```

**Key invariant:** no completion until **every review thread** appears in the inventory, **every comment** appears in the ledger, and **every thread** is acknowledged.

Schemas and templates:
- Ledger row schema: [`docs/SCHEMAS.md`](../../../docs/SCHEMAS.md#pr-review-ledger-row-object)
- Thread inventory schema: [`docs/SCHEMAS.md`](../../../docs/SCHEMAS.md#pr-review-thread-inventory-object)
- Ack matrix schema: [`docs/SCHEMAS.md`](../../../docs/SCHEMAS.md#pr-review-ack-matrix-object)
- Ledger template: [`.kilocode/contracts/pr_review/comment_ledger.md`](../contracts/pr_review/comment_ledger.md)
- Inventory template: [`.kilocode/contracts/pr_review/thread_inventory.md`](../contracts/pr_review/thread_inventory.md)
- Ack matrix template: [`.kilocode/contracts/pr_review/ack_matrix.md`](../contracts/pr_review/ack_matrix.md)

---

## Prerequisites

- `gh auth status` succeeds
- PR number known
- Local branch checked out
- Sequential thinking MCP connected

---

## Parent Task: Orchestration

### Step 1: Initialize Todo List

```python
update_todo_list(
    todos="""
[ ] Subtask A: Intake (fetch review feedback + build comment ledger)
[ ] Subtask B: Plan responses (sequential thinking + export session)
[ ] Subtask C: Implement clusters (1..N)
[ ] Subtask D: Quality gates (format/lint/typecheck/test)
[ ] Subtask E: Acknowledge every ledger row (gh replies + PR comment summary)
[ ] Complete: Present results + reminders
"""
)
```

### Step 2: Spawn Subtask A — Intake + Ledger + Thread Inventory

```python
new_task(
    mode="architect",
    message="""
# Review Intake Subtask

**Objective:** Fetch all review feedback, build the authoritative Comment Ledger, and build the GraphQL Thread Inventory.

**PR Number:** <pr-number>

## Steps

1) Collect repo + PR metadata:
```bash
gh repo view --json nameWithOwner
gh pr view <PR_NUMBER> --json number,title,state,reviewDecision,headRefName,baseRefName
```

2) Fetch conversation comments:
```bash
gh pr view <PR_NUMBER> --comments
```

3) Fetch line-specific review comments with IDs:
```bash
gh api repos/<OWNER>/<REPO>/pulls/<PR_NUMBER>/comments \
  --jq '.[] | {id, path, line, side, user: .user.login, body, created_at}'
```

4) Fetch thread inventory (GraphQL). Prefer `reviewThreads` in `gh pr view --json`, otherwise use GraphQL fallback:
```bash
gh pr view <PR_NUMBER> --json reviewThreads
```

If `reviewThreads` is unsupported, use the GraphQL fallback:
```bash
gh api graphql -F owner='<OWNER>' -F name='<REPO>' -F number=<PR_NUMBER> -f query='
  query($owner:String!, $name:String!, $number:Int!) {
    repository(owner:$owner, name:$name) {
      pullRequest(number:$number) {
        reviewThreads(first: 100) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            isResolved
            comments(first: 100) {
              pageInfo { hasNextPage endCursor }
              nodes {
                id
                databaseId
                url
                path
                line
                author { login }
              }
            }
          }
        }
      }
    }
  }
'
```

If `reviewThreads.pageInfo.hasNextPage` or any `comments.pageInfo.hasNextPage` is true, **fail closed**: stop and use cursor pagination to fetch all pages before producing the inventory/ledger.

5) Categorize into: blocking / suggestion / question / nit / praise.

6) Produce the **Thread Inventory** (MANDATORY):
- One row per review thread
- Include `thread_id`, `comment_url`, `comment_ids`
- Schema must match [`docs/SCHEMAS.md`](../../../docs/SCHEMAS.md)

7) Produce the **Comment Ledger** (MANDATORY):
- One row per comment
- Use stable row IDs `PRR-001`, `PRR-002`, ... (never renumber)
- Include `thread_id` + `comment_url` for every review comment
- Schema must match [`docs/SCHEMAS.md`](../../../docs/SCHEMAS.md)

## Output Requirements
- runtime_model_reported (from environment_details)
- runtime_mode_reported (mode slug)
- PR metadata: owner/repo, pr_number, headRefName
- Thread Inventory (JSON matching [`docs/SCHEMAS.md`](../../../docs/SCHEMAS.md))
- Comment Ledger (table or JSON matching [`docs/SCHEMAS.md`](../../../docs/SCHEMAS.md))
- Summary counts by category

**Completion:** use attempt_completion with the ledger.
""",
    todos=None
)
```

### Step 3: Spawn Subtask B — Planning (Sequential Thinking)

```python
new_task(
    mode="architect",
    message="""
# Response Planning Subtask

**Objective:** Turn the Comment Ledger into an actionable plan (clusters + approach decisions) using sequential thinking.

**Inputs:**
- Comment Ledger from Subtask A

## Mandatory Sequential Thinking

1) Problem Definition: at least 2 framings (e.g., 'fix correctness' vs 'improve maintainability')
2) Analysis: at least 2 approaches for any non-trivial cluster
3) generate_summary before deciding
4) Conclusion: commit to plan and success criteria
5) export_session (MANDATORY):

```python
mcp--sequentialthinking--export_session(
  file_path=".kilocode/thinking/pr-<PR_NUMBER>-review-response-plan-<YYYY-MM-DD>.json"
)
```

## Output Requirements
- Implementation clusters (ordered)
- For each cluster: files, risks, tests, expected reply bodies
- Exported session path

**Completion:** attempt_completion with plan + session path.
""",
    todos=None
)
```

### Step 4: Spawn Subtask C..N — Implementation Clusters

For each cluster from planning:

```python
new_task(
    mode="code",
    message="""
# Implementation Subtask: <cluster-name>

**Objective:** Implement fixes for a cluster of ledger rows.

**Inputs:**
- Comment Ledger rows: <ledger_id list>
- Planning session: `.kilocode/thinking/pr-<PR_NUMBER>-review-response-plan-<YYYY-MM-DD>.json`

**Mandatory:** import the planning session; do pre-edit reasoning if blast radius > 1 file.

**Output Requirements:**
- Files changed
- Tests run
- Updated ledger statuses to `ready_to_ack` with commit SHA
- Export progress session path (optional but recommended)

**Completion:** attempt_completion with what changed.
""",
    todos=None
)
```

### Step 5: Spawn Subtask D — Quality Gates

```python
new_task(
    mode="code",
    message="""
# Quality Gate Subtask

**Objective:** Run and pass all quality gates.

```bash
{{SK_GATE_CI_CMD}}
```

**Completion:** attempt_completion with PASS/FAIL for each gate and any fixes applied.
""",
    todos=None
)
```

### Step 6: Spawn Subtask E — Acknowledge All Comments + Ack Matrix

```python
new_task(
    mode="code",
    message="""
# Comment Acknowledgement Subtask

**Objective:** Ensure every ledger row is acknowledged publicly on the PR and produce the Ack Matrix.

## Invariant
- For each `type=review` ledger row: reply to the specific review comment by `comment_id`.
- For `type=conversation` ledger rows: post a PR-level comment mapping feedback → disposition.

## Commands

Reply to review comment:
```bash
gh api repos/<OWNER>/<REPO>/pulls/<PR_NUMBER>/comments/<COMMENT_ID>/replies \
  -f body="<reply_body>"
```

PR-level summary (can cover multiple conversation items):
```bash
gh pr comment <PR_NUMBER> --body "<ack summary referencing ledger rows>"
```

**Completion:** attempt_completion with:
- counts acknowledged vs total
- links/identifiers of posted replies
- final ledger marked `acknowledged`
- Ack Matrix (JSON matching [`docs/SCHEMAS.md`](../../../docs/SCHEMAS.md))

### Ledger Statuses (explicit)

Allowed status values (per [`docs/SCHEMAS.md`](../../../docs/SCHEMAS.md)):
- `open`
- `in_progress`
- `ready_to_ack`
- `acknowledged`
- `wontfix`
""",
    todos=None
)
```

### Step 7: Complete

Parent compiles final report:
- what was fixed
- what was deferred/declined and why
- quality gate results
- acknowledgement status (must be 100%)
- next steps: push, request re-review
