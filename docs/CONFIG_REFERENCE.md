# Configuration Reference

This document is the single source of truth for every `{{SK_*}}` placeholder used in the kit templates. Replace these tokens after copying the templates into your repo.

## Placeholder reference

```text
# SK_TOKEN_ALLOWLIST
SK_GATE_CI_CMD
SK_GATE_FMT_CHECK_CMD
SK_GATE_FMT_CMD
SK_GATE_LINT_CMD
SK_GATE_TYPECHECK_CMD
SK_GATE_TEST_CMD
SK_BOUNDED_GATE_RUNNER_CMD
SK_FITTER_VERSION
SK_FITTER_DESCRIPTION
SK_ARCH_CONFIG_PATH
SK_ARTIFACTS_DIR
SK_CLAIMS_MODULE
SK_ARCH_VERIFY_CMD
```

| Token | Purpose | Recommended default | Example |
| --- | --- | --- | --- |
| `{{SK_GATE_CI_CMD}}` | Canonical gate entrypoint (format/lint/typecheck/test) for local + CI. | `npm run ci` | `npm run ci` |
| `{{SK_GATE_FMT_CHECK_CMD}}` | Format check command. | `npm run format:check` | `npm run format:check` |
| `{{SK_GATE_FMT_CMD}}` | Format fix command. | `npm run format` | `npm run format` |
| `{{SK_GATE_LINT_CMD}}` | Lint command. | `npm run lint` | `npm run lint` |
| `{{SK_GATE_TYPECHECK_CMD}}` | Type check command. | `npm run typecheck` | `npm run typecheck` |
| `{{SK_GATE_TEST_CMD}}` | Test command. | `npm run test` | `npm run test` |
| `{{SK_BOUNDED_GATE_RUNNER_CMD}}` | Placeholder command representing a bounded gate runner (timeouts/stalls). | `./scripts/run-gates-bounded.sh` | `./scripts/run-gates-bounded.sh` |
| `{{SK_FITTER_VERSION}}` | Version label for the fitter config template. | `0.1.0` | `0.1.0` |
| `{{SK_FITTER_DESCRIPTION}}` | Description for the fitter config template. | `Station Kit fitter gate profile` | `Station Kit fitter gate profile` |
| `{{SK_ARCH_CONFIG_PATH}}` | Path to your architecture/layering config file (referenced by mode instructions). | `./architecture.toml` | `./architecture.toml` |
| `{{SK_ARTIFACTS_DIR}}` | Directory where analysis artifacts (and/or generated outputs) are stored. | `./.artifacts` | `./.artifacts` |
| `{{SK_CLAIMS_MODULE}}` | Command surface invoked for optional claims operations (if your project has them). | `your_project.claims` | `your_project.claims` |
| `{{SK_ARCH_VERIFY_CMD}}` | Command used to verify architecture constraints (stored in fitter config). | `./scripts/verify_architecture.sh` | `./scripts/verify_architecture.sh` |

### Optional tokens
These tokens are used only in optional sections or optional integrations:
- `{{SK_BOUNDED_GATE_RUNNER_CMD}}` — bounded gate execution placeholder in the execute workflow.
- `{{SK_CLAIMS_MODULE}}` — optional claims command surface (only if your project has a claims pipeline).
- `{{SK_ARCH_VERIFY_CMD}}` — optional architecture verification command; if you have no architecture gate, set it to a safe no-op (e.g., `true`).

## Template mapping: `.kilocodemodes`
Template path: [`templates/.kilocodemodes`](../templates/.kilocodemodes)

Tokens referenced by this template:
- `{{SK_ARCH_CONFIG_PATH}}` — architecture/layering config reference used in mode instructions
- `{{SK_ARTIFACTS_DIR}}` — artifacts directory referenced in mode instructions
- `{{SK_CLAIMS_MODULE}}` — optional claims module entrypoint for claims-ops mode

## Template mapping: `fitter.toml`
Template path: [`templates/.kilocode/fitter.toml`](../templates/.kilocode/fitter.toml)

### Fit Profiles (canonical location)
Fit Profiles live in `.kilocode/fitter.toml` after installation. Represent profiles as parseable TOML tables under a dedicated `profiles` array to keep them stable and machine-readable:

```toml
[[profiles]]
name = "baseline"
description = "Default bounded gate budgets"
timeout_seconds = 900
stall_seconds = 120
max_retries = 1

[[profiles]]
name = "ci"
description = "CI-friendly budgets"
timeout_seconds = 1200
stall_seconds = 180
max_retries = 2
```

Profile selection is a workflow-layer concern; the kit does not ship runtime logic, only the canonical location and format.

### Schema
```toml
[meta]
version = "{{SK_FITTER_VERSION}}"
description = "{{SK_FITTER_DESCRIPTION}}"

[defaults]
gate_fmt_check_cmd = "{{SK_GATE_FMT_CHECK_CMD}}"
gate_fmt_cmd = "{{SK_GATE_FMT_CMD}}"
gate_lint_cmd = "{{SK_GATE_LINT_CMD}}"
gate_typecheck_cmd = "{{SK_GATE_TYPECHECK_CMD}}"
gate_test_cmd = "{{SK_GATE_TEST_CMD}}"
arch_verify_cmd = "{{SK_ARCH_VERIFY_CMD}}"

[[gates]]
id = "format_check"
label = "Format check"
invocation = "{{SK_GATE_FMT_CHECK_CMD}}"

[[gates]]
id = "lint"
label = "Lint"
invocation = "{{SK_GATE_LINT_CMD}}"

[[gates]]
id = "typecheck"
label = "Type check"
invocation = "{{SK_GATE_TYPECHECK_CMD}}"

[[gates]]
id = "test"
label = "Test"
invocation = "{{SK_GATE_TEST_CMD}}"
```

### Token → field mapping
- `{{SK_FITTER_VERSION}}` → `[meta].version`
- `{{SK_FITTER_DESCRIPTION}}` → `[meta].description`
- `{{SK_GATE_FMT_CHECK_CMD}}` → `[defaults].gate_fmt_check_cmd` and `format_check` invocation
- `{{SK_GATE_FMT_CMD}}` → `[defaults].gate_fmt_cmd`
- `{{SK_GATE_LINT_CMD}}` → `[defaults].gate_lint_cmd` and `lint` invocation
- `{{SK_GATE_TYPECHECK_CMD}}` → `[defaults].gate_typecheck_cmd` and `typecheck` invocation
- `{{SK_GATE_TEST_CMD}}` → `[defaults].gate_test_cmd` and `test` invocation
- `{{SK_ARCH_VERIFY_CMD}}` → `[defaults].arch_verify_cmd`

## Notes
- Keep tokens inside quotes to preserve TOML parsing.
- Defaults above assume a Python repo using virtualenv; adjust for your runtime.

## Optional integrations: architecture verification and claims

This kit does not ship runtime logic for architecture verification or a claims pipeline. Instead, it provides **integration surfaces** (placeholders + workflow hooks) that you wire into your repository.

### Architecture verification (optional)

**Important:** `{{SK_ARCH_VERIFY_CMD}}` is *your* project’s architecture check.
This kit does not assume any specific tool, and it is deliberately separate from determinism checks (e.g., artifact byte-for-byte verification).

#### Example: layered architecture check via generated artifacts (generic)

If your architecture rules are expressed via an artifacts file (e.g., a `layer_violations` array in an artifact summary), then your `{{SK_ARCH_VERIFY_CMD}}` can be a small script that fails CI when violations exist.

One example architecture tool computes **layer rule enforcement** during artifact generation and records results in `deps_summary.json` / `seams_static.md` (via a `layers` config).
In that design, *architecture verification* looks like: regenerate artifacts → fail if `layer_violations` is non-empty.

Example (adapt to your artifacts dir and filenames):

```bash
# 1) Generate/update artifacts (tool-specific)
./scripts/generate_arch_artifacts.sh

# 2) Fail if layer violations exist (example)
node ./scripts/check_arch_violations.js
```

If you don’t have an architecture verifier yet, set `{{SK_ARCH_VERIFY_CMD}}` to a safe no-op (`true`) so the workflow is explicit about skipping the step.


**Goal:** have a single command that returns exit code 0 when architecture constraints pass, and non-zero when they fail.

**You provide:** `{{SK_ARCH_VERIFY_CMD}}` (stored in the fitter config) and a real config file path for `{{SK_ARCH_CONFIG_PATH}}`.

Recommended patterns:
- **Project has an architecture tool** (import-linter / custom checker / etc.): set `{{SK_ARCH_VERIFY_CMD}}` to invoke it.
- **Project does not (yet) have an architecture tool:** set `{{SK_ARCH_VERIFY_CMD}}` to a safe no-op (e.g., `true`) until you adopt one.

Practical guidance:
- Prefer a dedicated script committed in your repo (e.g., `./scripts/verify_architecture.sh`) so CI and developers run the same thing.
- Ensure the command is deterministic and fast; if it is slow or flaky, route issues to the line-health workflow.

### Claims pipeline (optional)

#### Public-kit safety note (pre-release surfaces, default OFF)

This kit includes **hooks** for a claims pipeline, but it does **not** include a working claims implementation.
Treat these sections as **pre-release surfaces** and keep them **disabled by default** in your public template until your claims system is ready.

Recommended public-facing posture:
- Default to **no claims**: remove/omit `claims-ops` mode from `.kilocodemodes`.
- Only enable claims steps when `{{SK_CLAIMS_MODULE}}` points to a real module in your repo and the project documents its prerequisites.

#### Example command surface (when you *do* have a claims module)

Your project can make claims feel real by providing a stable CLI contract such as:

```bash
{{SK_CLAIMS_MODULE}} generate --artifacts-dir {{SK_ARTIFACTS_DIR}}
{{SK_CLAIMS_MODULE}} verify --artifacts-dir {{SK_ARTIFACTS_DIR}}
```


**Meaning of “claims” in this kit:** a project-specific pipeline that produces and/or verifies structured assertions about your repo (design constraints, invariants, architectural facts, etc.).

The kit provides a **Claims Pipeline Operator** mode that assumes you have a CLI-like entrypoint exposed as a Python module.

**You provide:** `{{SK_CLAIMS_MODULE}}` (a Python module path) and any required configuration the module expects.

Recommended patterns:
- **If your project has no claims pipeline:** remove/omit the `claims-ops` mode from your copied `.kilocodemodes` file.
- **If your project has a claims pipeline:** implement a small `python -m <module> ...` command surface (e.g., `generate`, `verify`, `pipeline`) and set `{{SK_CLAIMS_MODULE}}` accordingly.

Notes on secrets/LLM keys:
- Some claims pipelines use an LLM and require an API key (e.g., `OPENROUTER_API_KEY`). If your pipeline does not use an LLM, delete that requirement from your local `.kilocodemodes` after copying.

### Integration decision matrix

| Capability | If you have it | If you don’t have it yet |
| --- | --- | --- |
| Architecture verification | Set `{{SK_ARCH_VERIFY_CMD}}` to your verifier command and point `{{SK_ARCH_CONFIG_PATH}}` at its config | Set `{{SK_ARCH_VERIFY_CMD}}` to `true` and treat verification steps as “skipped” |
| Claims pipeline | Set `{{SK_CLAIMS_MODULE}}` to your module and ensure it supports a stable CLI surface | Remove/omit the `claims-ops` mode from `.kilocodemodes` |

## Token audit
Run this audit from the kit repo root after copy/paste to confirm there are no undocumented tokens:

```bash
node scripts/token_audit.cjs --templates templates --allowlist docs/CONFIG_REFERENCE.md
```

Verify that every token in the output appears in the table above. If not, update this document before sharing the kit.
