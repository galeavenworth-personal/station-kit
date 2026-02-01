# Project Review V2: Station Kit (updated repo)

Scope reviewed: public-facing docs + template assets under [`templates/`](templates/:1).

## Executive summary

The repository now reads as a largely self-contained **template kit** with a coherent factory-line workflow story (prep → execute → refactor → respond-to-PR-review → line health) and a schema/contract-first posture.

The biggest remaining “public share” risks are:

1. **Broken repo-relative links** due to an extra `kilo-factory-kit/` prefix in docs.
2. **Config/documentation drift**: templates use `{{SK_*}}` placeholders that are not fully documented.
3. **Org-specific language/paths** leaking through in templates (e.g., “repomap project”, personal clone paths).

If those are addressed, the kit becomes very easy to evaluate and trust quickly.

## What improved since the prior review

### 1) Previously missing internal references are mostly resolved

- The Beads contract file exists as [`templates/AGENTS.md`](templates/AGENTS.md:1), and the Beads rule points to it via [`templates/.kilocode/rules/beads.md`](templates/.kilocode/rules/beads.md:36).

- The legacy workflow docs that were previously referenced but missing now exist under [`templates/.kilocode/workflows/legacy/`](templates/.kilocode/workflows/legacy/:1) and are linked from the “Related Workflows” section in [`templates/.kilocode/workflows/orchestrate-start-task.md`](templates/.kilocode/workflows/orchestrate-start-task.md:481).

- The fitter implementation plan exists under [`templates/.beads/implementation-guides/fitter-line-health-implementation-plan.md`](templates/.beads/implementation-guides/fitter-line-health-implementation-plan.md:1) and is referenced from [`templates/.kilocode/workflows/fitter-line-health.md`](templates/.kilocode/workflows/fitter-line-health.md:16).

### 2) Model-plan/schema missing-doc issue appears resolved

The older “model plan schema” / “model plan lane” missing-document references appear to have been removed (no remaining `MODEL_PLAN` hits in the repo except the historical note in [`plans/PROJECT_REVIEW.md`](plans/PROJECT_REVIEW.md:36)).

## What still blocks a clean public share

### 1) Broken repo-relative links (still assume an extra `kilo-factory-kit/` directory)

This is the highest-confidence, highest-impact issue because it breaks “first click” trust.

- Root narrative links in [`README.md`](README.md:4) point to `kilo-factory-kit/templates/...` and `kilo-factory-kit/docs/...`.
- Copy commands in [`README.md`](README.md:18) and [`docs/INSTALL.md`](docs/INSTALL.md:15) assume a nested `kilo-factory-kit/templates/...` path.
- The workflow index in [`docs/WORKFLOW_REFERENCE.md`](docs/WORKFLOW_REFERENCE.md:3) links to `kilo-factory-kit/templates/...` and `kilo-factory-kit/docs/...`.
- The template mapping link in [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:21) also uses the `kilo-factory-kit/` prefix.

Recommendation: normalize links and copy examples so they work when this repository is the root on GitHub.

### 2) Placeholder token documentation drift (`{{SK_*}}`)

The kit positions [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:1) as “single source of truth” for placeholders, but the templates currently require additional tokens that aren’t covered there.

Examples:

- `{{SK_ARCH_VERIFY_CMD}}` appears in [`templates/.kilocode/fitter.toml`](templates/.kilocode/fitter.toml:9) but is not documented in [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:7).
- `{{SK_ARCH_CONFIG_PATH}}` and `{{SK_ARTIFACTS_DIR}}` appear in [`templates/.kilocodemodes`](templates/.kilocodemodes:8) but are not documented in [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:7).
- `{{SK_CLAIMS_MODULE}}` appears in [`templates/.kilocodemodes`](templates/.kilocodemodes:91) but is not documented in [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:7).

Why this matters: because the repo emphasizes schema discipline in [`docs/SCHEMAS.md`](docs/SCHEMAS.md:1), reviewers will notice and interpret this as config drift.

Recommendation:

1. Inventory all placeholders used across [`templates/`](templates/:1).
2. Ensure every placeholder is documented in [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:1).
3. Add a short “Token audit” section explaining how to verify there are no undocumented tokens after copy/paste.

### 3) Org-specific language and paths leak through

This isn’t “secret”, but it harms template credibility.

- Two-clone personal paths in [`templates/.kilocode/skills/beads-local-db-ops/SKILL.md`](templates/.kilocode/skills/beads-local-db-ops/SKILL.md:18).
- “Repomap project” phrasing in [`templates/.kilocodemodes`](templates/.kilocodemodes:42).
- `OPENROUTER_API_KEY` is described in a way that reads like it’s required for “the” project rather than an optional integration in [`templates/.kilocodemodes`](templates/.kilocodemodes:23).

Recommendation: replace personal paths with neutral “Clone A / Clone B” examples, and adjust language to be explicitly project-agnostic + “optional integrations”.

## Overall take

The core idea is strong and differentiating:

- The “factory line” workflow suite is coherent and operationally grounded, especially the prep/execution separation in [`templates/.kilocode/workflows/orchestrate-start-task.md`](templates/.kilocode/workflows/orchestrate-start-task.md:16) and [`templates/.kilocode/workflows/orchestrate-execute-task.md`](templates/.kilocode/workflows/orchestrate-execute-task.md:16).

- The contract-first approach is a meaningful differentiator vs generic prompt packs; [`docs/SCHEMAS.md`](docs/SCHEMAS.md:1) is the right kind of “seriousness signal”.

- The line-health/Fitter concept is concrete and reviewable (good employer signal) via [`templates/.kilocode/workflows/fitter-line-health.md`](templates/.kilocode/workflows/fitter-line-health.md:6).

Most remaining issues are “pre-share polish” rather than fundamental architectural problems.

## Recommended next edits (checklist)

1. Fix the `kilo-factory-kit/` link prefix in:
   - [`README.md`](README.md:1)
   - [`docs/INSTALL.md`](docs/INSTALL.md:1)
   - [`docs/WORKFLOW_REFERENCE.md`](docs/WORKFLOW_REFERENCE.md:1)
   - [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:1)

2. Reconcile placeholder token documentation:
   - inventory all `{{SK_*}}` usage under [`templates/`](templates/:1)
   - document any missing tokens in [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:1)
   - add a short “Token audit” section

3. Remove org-specific language:
   - [`templates/.kilocode/skills/beads-local-db-ops/SKILL.md`](templates/.kilocode/skills/beads-local-db-ops/SKILL.md:1)
   - [`templates/.kilocodemodes`](templates/.kilocodemodes:1)

4. Add standard public repo hygiene docs:
   - `LICENSE`
   - `SECURITY.md`
   - `CONTRIBUTING.md`
   - optional: `CODE_OF_CONDUCT.md`, `CHANGELOG.md`

5. Run a final link/reference sweep across markdown under [`docs/`](docs/:1) and [`templates/`](templates/:1).

