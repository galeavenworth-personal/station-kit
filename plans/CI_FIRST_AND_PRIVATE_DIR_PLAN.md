# CI-first plan + private planning directory (pre-go-live)

This plan front-loads two enabling moves before any broad rename / polish work:

1) Replace the CI stub with minimal publish-readiness gates.
2) Add a gitignored private directory for internal planning and scratch artifacts.

This aligns with the go-live posture in [`PRE_FLIGHT.md`](../PRE_FLIGHT.md:1), especially the recommendation to stage in a private repo and validate CI in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml:1).

## Goals

### CI goals (templates/docs repo)

- Prevent “first impression” failures (broken links, obvious placeholders, token drift).
- Keep CI lightweight and deterministic (no heavy build/test matrix).
- Prefer Python-only checks (CI-friendly; no `rg` dependency), consistent with the tooling mismatch called out in [`PRE_FLIGHT.md`](../PRE_FLIGHT.md:75).

### Private directory goals

- Create a durable place to capture internal planning, rough notes, and procedural artifacts.
- Keep those artifacts out of the public repository by default via [`.gitignore`](../.gitignore:1).

## CI design (minimal publish-readiness gates)

### Gate 1: placeholder scan

Fail if any publish-blocker placeholder strings exist anywhere they should not.

Baseline patterns (expand as needed):

- OWNER/REPO
- INSERT CONTACT METHOD
- INSERT CONTACT
- YOUR_ORG
- YOUR_EMAIL

Implementation idea:

- Add [`scripts/scan_placeholders.py`](../scripts/scan_placeholders.py:1)
- Scan tracked text-like files (or scan the working tree while excluding:
  - `.git/`
  - `private/` (new gitignored dir)
  - typical binary extensions)
- Emit file path + line number + matched placeholder.

### Gate 2: token audit parity (templates vs docs)

Fail if any `{{SK_*}}` tokens used under [`templates/`](../templates/:1) are not documented in [`docs/CONFIG_REFERENCE.md`](../docs/CONFIG_REFERENCE.md:1).

Implementation options (choose one):

Option A (docs as canonical, machine-parse a list)

- Ensure [`docs/CONFIG_REFERENCE.md`](../docs/CONFIG_REFERENCE.md:1) contains a single machine-readable allowlist section, e.g. a fenced code block:
  - ```text
    SK_ARCH_CONFIG_PATH
    SK_ARCH_VERIFY_CMD
    ...
    ```
- Add [`scripts/token_audit.py`](../scripts/token_audit.py:1)
  - Extract tokens from templates via regex `\{\{(SK_[A-Z0-9_]+)\}\}`
  - Extract allowlist from the docs code block
  - Fail if templates contain tokens not in allowlist

Option B (separate allowlist file, docs generated)

- Keep a canonical allowlist file (e.g. [`tools/kfk_tokens_allowlist.txt`](../tools/kfk_tokens_allowlist.txt:1))
- CI compares templates to allowlist
- Docs link to the file and/or include it verbatim

Preferred for this repo: Option A, because the repo already claims docs are the single source of truth.

### Gate 3: markdown link validation (repo-relative)

Fail if repo-relative markdown links don’t resolve.

Scope:

- [`README.md`](../README.md:1)
- markdown under [`docs/`](../docs/:1)
- optionally markdown under [`templates/`](../templates/:1)

Implementation idea:

- Add [`scripts/check_md_links.py`](../scripts/check_md_links.py:1)
- Parse markdown links naïvely (regex is acceptable for repo-relative paths):
  - accept `http://` and `https://`
  - accept anchors `#...`
  - for `./`, `../`, and bare repo-relative paths: check `Path.exists()`
  - ignore mailto links
- Output broken links as file + line + link.

Note: this gate directly protects against the broken-prefix risk highlighted in [`plans/PROJECT_REVIEW_V2.md`](PROJECT_REVIEW_V2.md:33).

## CI workflow integration

Update [`.github/workflows/ci.yml`](../.github/workflows/ci.yml:1) to:

- Run on `pull_request` and `push` to `main`
- Use `actions/checkout`
- Use `actions/setup-python` (pin a minor version)
- Run the three scripts:
  - `python scripts/scan_placeholders.py`
  - `python scripts/token_audit.py`
  - `python scripts/check_md_links.py`

Avoid external dependencies unless absolutely necessary. If a dependency is needed, prefer a pinned `requirements-dev.txt` and `pip install -r`.

## Private planning directory (gitignored)

Create a new directory at [`private/`](../private/:1) intended for:

- internal planning drafts
- scratch capture (go-live checklists, owner/repo decisions, contact decisions)
- local notes, screenshots, or “behind-the-curtains” artifacts

Add `private/` to [`.gitignore`](../.gitignore:1) so it is not committed.

Suggested structure:

- [`private/README.md`](../private/README.md:1) (local-only note describing the intent)
- [`private/plans/`](../private/plans/:1)
- [`private/scratch/`](../private/scratch/:1)

## Sequencing (what happens before rename)

1) Implement CI gates and verify they pass in the current repo state.
2) Add `private/` + ignore rule.
3) Only then do naming work (Station Kit rename, disclaimers, link normalization) with CI protecting against regressions.

## Decisions needed from you (to avoid rework)

- Canonical placeholder patterns to fail on (list can start small and expand).
- Whether token allowlist should live in [`docs/CONFIG_REFERENCE.md`](../docs/CONFIG_REFERENCE.md:1) (recommended) vs a separate allowlist file.
- Whether markdown link checking should include [`templates/`](../templates/:1) or only `README` + `docs`.

