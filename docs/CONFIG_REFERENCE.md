# Configuration Reference

This document is the single source of truth for every `{{KFK_*}}` placeholder used in the kit templates. Replace these tokens after copying the templates into your repo.

## Placeholder reference

| Token | Purpose | Recommended default | Example |
| --- | --- | --- | --- |
| `{{KFK_PYTHON_RUNNER}}` | Python invocation used for gates. Required convention across all kit docs/examples. | `python` | `python` |
| `{{KFK_MYPY_TARGET}}` | Target passed to `mypy`. | `.` or `your_package` | `your_package` |
| `{{KFK_PYTEST_ARGS}}` | Extra args passed to `pytest`. | `-m "not live"` or `tests/` | `-m "not live"` |
| `{{KFK_BOUNDED_GATE_RUNNER_CMD}}` | Placeholder command representing a bounded gate runner (timeouts/stalls). | `./scripts/run-gates-bounded.sh` | `./scripts/run-gates-bounded.sh` |
| `{{KFK_FITTER_VERSION}}` | Version label for the fitter config template. | `0.1.0` | `0.1.0` |
| `{{KFK_FITTER_DESCRIPTION}}` | Description for the fitter config template. | `Kilo Factory Kit fitter gate profile` | `Kilo Factory Kit fitter gate profile` |
| `{{KFK_ARCH_CONFIG_PATH}}` | Path to your architecture/layering config file (referenced by mode instructions). | `./architecture.toml` | `./architecture.toml` |
| `{{KFK_ARTIFACTS_DIR}}` | Directory where analysis artifacts (and/or generated outputs) are stored. | `./.artifacts` | `./.artifacts` |
| `{{KFK_CLAIMS_MODULE}}` | Python module invoked for optional “claims” operations (if your project has them). | `your_project.claims` | `your_project.claims` |
| `{{KFK_ARCH_VERIFY_CMD}}` | Command used to verify architecture constraints (stored in fitter config). | `{{KFK_PYTHON_RUNNER}} -m your_arch_tool verify` | `{{KFK_PYTHON_RUNNER}} -m your_arch_tool verify` |

### Optional tokens
These tokens are used only in optional sections or optional integrations:
- `{{KFK_BOUNDED_GATE_RUNNER_CMD}}` — bounded gate execution placeholder in the execute workflow.
- `{{KFK_CLAIMS_MODULE}}` — optional “claims” module entrypoint (only if your project has a claims pipeline).
- `{{KFK_ARCH_VERIFY_CMD}}` — optional architecture verification command; if you have no architecture gate, set it to a safe no-op (e.g., `true`).

## Template mapping: `.kilocodemodes`
Template path: [`templates/.kilocodemodes`](../templates/.kilocodemodes:1)

Tokens referenced by this template:
- `{{KFK_ARCH_CONFIG_PATH}}` — architecture/layering config reference used in mode instructions
- `{{KFK_ARTIFACTS_DIR}}` — artifacts directory referenced in mode instructions
- `{{KFK_CLAIMS_MODULE}}` — optional claims module entrypoint for claims-ops mode

## Template mapping: `fitter.toml`
Template path: [`templates/.kilocode/fitter.toml`](../templates/.kilocode/fitter.toml:1)

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
version = "{{KFK_FITTER_VERSION}}"
description = "{{KFK_FITTER_DESCRIPTION}}"

[defaults]
python_runner = "{{KFK_PYTHON_RUNNER}}"
mypy_target = "{{KFK_MYPY_TARGET}}"
pytest_args = "{{KFK_PYTEST_ARGS}}"
arch_verify_cmd = "{{KFK_ARCH_VERIFY_CMD}}"

[[gates]]
id = "ruff_format_check"
label = "Ruff format check"
invocation = "{{KFK_PYTHON_RUNNER}} -m ruff format --check ."

[[gates]]
id = "ruff_check"
label = "Ruff check"
invocation = "{{KFK_PYTHON_RUNNER}} -m ruff check ."

[[gates]]
id = "mypy"
label = "Mypy type check"
invocation = "{{KFK_PYTHON_RUNNER}} -m mypy {{KFK_MYPY_TARGET}}"

[[gates]]
id = "pytest"
label = "Pytest"
invocation = "{{KFK_PYTHON_RUNNER}} -m pytest {{KFK_PYTEST_ARGS}}"
```

### Token → field mapping
- `{{KFK_FITTER_VERSION}}` → `[meta].version`
- `{{KFK_FITTER_DESCRIPTION}}` → `[meta].description`
- `{{KFK_PYTHON_RUNNER}}` → `[defaults].python_runner` and each gate `invocation`
- `{{KFK_MYPY_TARGET}}` → `[defaults].mypy_target` and the `mypy` gate invocation
- `{{KFK_PYTEST_ARGS}}` → `[defaults].pytest_args` and the `pytest` gate invocation
- `{{KFK_ARCH_VERIFY_CMD}}` → `[defaults].arch_verify_cmd`

## Notes
- Keep tokens inside quotes to preserve TOML parsing.
- Defaults above assume a Python repo using virtualenv; adjust for your runtime.

## Optional integrations: architecture verification and claims

This kit does not ship runtime logic for architecture verification or a claims pipeline. Instead, it provides **integration surfaces** (placeholders + workflow hooks) that you wire into your repository.

### Architecture verification (optional)

**Important:** `{{KFK_ARCH_VERIFY_CMD}}` is *your* project’s architecture check.
This kit does not assume any specific tool, and it is deliberately separate from determinism checks (e.g., artifact byte-for-byte verification).

#### Example: layered architecture check via generated artifacts (generic)

If your architecture rules are expressed via an artifacts file (e.g., a `layer_violations` array in an artifact summary), then your `{{KFK_ARCH_VERIFY_CMD}}` can be a small script that fails CI when violations exist.

One example architecture tool computes **layer rule enforcement** during artifact generation and records results in `deps_summary.json` / `seams_static.md` (via a `layers` config).
In that design, *architecture verification* looks like: regenerate artifacts → fail if `layer_violations` is non-empty.

Example (adapt to your artifacts dir and filenames):

```bash
# 1) Generate/update artifacts
{{KFK_PYTHON_RUNNER}} -m your_arch_tool generate .

# 2) Fail if layer violations exist
{{KFK_PYTHON_RUNNER}} - <<'PY'
import json, sys
from pathlib import Path
p = Path("{{KFK_ARTIFACTS_DIR}}") / "deps_summary.json"
d = json.loads(p.read_text())
violations = d.get("layer_violations", [])
print(f"layer_violations={len(violations)}")
sys.exit(1 if violations else 0)
PY
```

If you don’t have an architecture verifier yet, set `{{KFK_ARCH_VERIFY_CMD}}` to a safe no-op (`true`) so the workflow is explicit about skipping the step.


**Goal:** have a single command that returns exit code 0 when architecture constraints pass, and non-zero when they fail.

**You provide:** `{{KFK_ARCH_VERIFY_CMD}}` (stored in the fitter config) and a real config file path for `{{KFK_ARCH_CONFIG_PATH}}`.

Recommended patterns:
- **Project has an architecture tool** (import-linter / custom checker / etc.): set `{{KFK_ARCH_VERIFY_CMD}}` to invoke it.
- **Project does not (yet) have an architecture tool:** set `{{KFK_ARCH_VERIFY_CMD}}` to a safe no-op (e.g., `true`) until you adopt one.

Practical guidance:
- Prefer a dedicated script committed in your repo (e.g., `./scripts/verify_architecture.sh`) so CI and developers run the same thing.
- Ensure the command is deterministic and fast; if it is slow or flaky, route issues to the line-health workflow.

### Claims pipeline (optional)

#### Public-kit safety note (pre-release surfaces, default OFF)

This kit includes **hooks** for a claims pipeline, but it does **not** include a working claims implementation.
Treat these sections as **pre-release surfaces** and keep them **disabled by default** in your public template until your claims system is ready.

Recommended public-facing posture:
- Default to **no claims**: remove/omit `claims-ops` mode from `.kilocodemodes`.
- Only enable claims steps when `{{KFK_CLAIMS_MODULE}}` points to a real module in your repo and the project documents its prerequisites.

#### Example command surface (when you *do* have a claims module)

Your project can make claims feel real by providing a stable CLI contract such as:

```bash
{{KFK_PYTHON_RUNNER}} -m {{KFK_CLAIMS_MODULE}} generate --artifacts-dir {{KFK_ARTIFACTS_DIR}}
{{KFK_PYTHON_RUNNER}} -m {{KFK_CLAIMS_MODULE}} verify --artifacts-dir {{KFK_ARTIFACTS_DIR}}
```


**Meaning of “claims” in this kit:** a project-specific pipeline that produces and/or verifies structured assertions about your repo (design constraints, invariants, architectural facts, etc.).

The kit provides a **Claims Pipeline Operator** mode that assumes you have a CLI-like entrypoint exposed as a Python module.

**You provide:** `{{KFK_CLAIMS_MODULE}}` (a Python module path) and any required configuration the module expects.

Recommended patterns:
- **If your project has no claims pipeline:** remove/omit the `claims-ops` mode from your copied `.kilocodemodes` file.
- **If your project has a claims pipeline:** implement a small `python -m <module> ...` command surface (e.g., `generate`, `verify`, `pipeline`) and set `{{KFK_CLAIMS_MODULE}}` accordingly.

Notes on secrets/LLM keys:
- Some claims pipelines use an LLM and require an API key (e.g., `OPENROUTER_API_KEY`). If your pipeline does not use an LLM, delete that requirement from your local `.kilocodemodes` after copying.

### Integration decision matrix

| Capability | If you have it | If you don’t have it yet |
| --- | --- | --- |
| Architecture verification | Set `{{KFK_ARCH_VERIFY_CMD}}` to your verifier command and point `{{KFK_ARCH_CONFIG_PATH}}` at its config | Set `{{KFK_ARCH_VERIFY_CMD}}` to `true` and treat verification steps as “skipped” |
| Claims pipeline | Set `{{KFK_CLAIMS_MODULE}}` to your module and ensure it supports a stable CLI surface | Remove/omit the `claims-ops` mode from `.kilocodemodes` |

## Token audit
Run this audit from the kit repo root after copy/paste to confirm there are no undocumented tokens:

```bash
python - <<'PY'
import os, re
root = "templates"
tokens=set()
for dirpath, dirnames, filenames in os.walk(root):
    for name in filenames:
        path=os.path.join(dirpath,name)
        try:
            s=open(path,"r",encoding="utf-8",errors="ignore").read()
        except Exception:
            continue
        for m in re.findall(r"\{\{\s*(KFK_[A-Z0-9_]+)\s*\}\}", s):
            tokens.add(m)
print("\n".join(sorted(tokens)))
PY
```

Verify that every token in the output appears in the table above. If not, update this document before sharing the kit.
