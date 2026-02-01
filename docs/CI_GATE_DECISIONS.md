# CI gate decisions (required inputs)

This file captures the decisions needed before finalizing the CI gates implemented in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml:1) and the scripts under [`scripts/`](../scripts/:1).

## 1) Placeholder patterns to fail on

Current defaults in [`scripts/scan_placeholders.py`](../scripts/scan_placeholders.py:1):

- OWNER/REPO
- INSERT CONTACT METHOD
- INSERT CONTACT
- YOUR_ORG
- YOUR_EMAIL

### Decision

- Confirmed defaults (no additions yet).

Notes from owner:

- Owner: Gary Leavenworth
- Repo: station-kit
- Contact: galeavenworth+personal@gmail.com

## 2) Token allowlist source

Current implementation reads a fenced code block in [`docs/CONFIG_REFERENCE.md`](CONFIG_REFERENCE.md:1) with this header line:

```text
# SK_TOKEN_ALLOWLIST
```

### Decision

- Confirmed: allowlist lives in [`docs/CONFIG_REFERENCE.md`](CONFIG_REFERENCE.md:1).

Why the allowlist exists:

- It is the authoritative list of `{{SK_*}}` tokens that templates are allowed to use.
- CI compares tokens found under [`templates/`](../templates/:1) against this list so any undocumented token fails the build (prevents config drift).

## 3) Markdown link validation scope

Current script defaults to:

- [`README.md`](../README.md:1)
- [`docs/`](../docs/:1)

Optional (flagged):

- [`templates/`](../templates/:1)

### Decision

- Confirmed: include [`templates/`](../templates/:1) by default (factory kit lives there).
