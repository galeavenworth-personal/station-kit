# Project Review: Kilo Factory Kit (pre-share checklist)

Scope reviewed: public-facing docs + template assets under [`templates/`](templates/:1).

## Executive summary

This repo is already coherent as a **template-only kit**: it has clear workflow intent, consistent “factory line” metaphors, and solid schema discipline via [`docs/SCHEMAS.md`](docs/SCHEMAS.md:1).

The main risks before sharing are **broken links**, **references to missing internal files**, and **project-specific/proprietary-sounding language** that may confuse a reader who only has this repo.

## Strengths (what will land well with an employer)

- Clear statement of purpose and what is shipped (templates only) in [`README.md`](README.md:3).
- Good separation between:
  - docs: [`docs/`](docs/:1)
  - templates: [`templates/.kilocode/`](templates/.kilocode/:1) and [`templates/.kilocodemodes`](templates/.kilocodemodes:1)
- Schema-first approach for orchestration artifacts in [`docs/SCHEMAS.md`](docs/SCHEMAS.md:1) (runtime attestations + PR ledger are especially compelling).
- The “line health” concept (fault → fitter → restoration) is concrete and operationally-minded.

## Must-fix before a sneak peek (high confidence)

### 1) Broken repo-relative links (currently assume an extra `kilo-factory-kit/` directory)

Examples:

- [`README.md`](README.md:4) links to `kilo-factory-kit/templates/...` and `kilo-factory-kit/docs/...`.
- [`docs/INSTALL.md`](docs/INSTALL.md:13) includes copy commands that assume a nested `kilo-factory-kit/` folder.
- [`docs/WORKFLOW_REFERENCE.md`](docs/WORKFLOW_REFERENCE.md:3) links to `kilo-factory-kit/templates/...` and `kilo-factory-kit/docs/...`.

Recommendation: update these to be correct when this repository is the root (so links work on GitHub without special structure).

### 2) References to files that do not exist in this repo

These read as “internal dependencies” and will reduce trust if a reviewer clicks and hits 404.

- [`templates/.kilocode/workflows/orchestrate-start-task.md`](templates/.kilocode/workflows/orchestrate-start-task.md:58)
  - references [`docs/SCHEMAS.md`](docs/SCHEMAS.md:1) correctly, but also references a missing `model-plan-free-tier-lane.md`.
  - later references missing workflow docs: `start-task.md` and `prep-task.md` in the same directory (see “Related Workflows” section in [`templates/.kilocode/workflows/orchestrate-start-task.md`](templates/.kilocode/workflows/orchestrate-start-task.md:510)).
  - references a missing [`docs/reference/MODEL_PLAN_SCHEMA.md`](docs/reference/MODEL_PLAN_SCHEMA.md:1).

- [`templates/.kilocode/workflows/fitter-line-health.md`](templates/.kilocode/workflows/fitter-line-health.md:16) references a `.beads` implementation plan that is not present in this repo.

- [`templates/.kilocode/rules/beads.md`](templates/.kilocode/rules/beads.md:32) references a missing [`AGENTS.md`](AGENTS.md:1).

Recommendation: either add the referenced docs into this repo, or remove/replace those references with content that exists here.

### 3) Environment- and org-specific content in templates

- Two-clone employee paths in [`templates/.kilocode/skills/beads-local-db-ops/SKILL.md`](templates/.kilocode/skills/beads-local-db-ops/SKILL.md:16) include `~/Projects/...` examples. This is not “secret,” but it reads as personal/internal ops, and it will distract reviewers.

Recommendation: generalize the examples (e.g., “Clone A / Clone B”) and remove personal directory paths.

## Should-fix before making public (medium/high leverage)

### 4) Reduce “project-specific / proprietary sounding” phrasing

- [`templates/.kilocodemodes`](templates/.kilocodemodes:1) uses “repomap project” language in `whenToUse` and the `code` mode role definition, and includes optional references like `OPENROUTER_API_KEY`.

Recommendation: keep the integrations but phrase them as:

- “Optional integrations”
- “Optional architecture verification tool”
- “Optional task tracker”

…and avoid framing that implies the kit is only for one internal codebase.

### 5) Placeholder token hygiene (prevent config drift)

Observed tokens in templates include (non-exhaustive):

- `{{KFK_PYTHON_RUNNER}}`
- `{{KFK_MYPY_TARGET}}`
- `{{KFK_PYTEST_ARGS}}`
- `{{KFK_ARCH_VERIFY_CMD}}`
- `{{KFK_BOUNDED_GATE_RUNNER_CMD}}`
- `{{KFK_ARCH_CONFIG_PATH}}`
- `{{KFK_ARTIFACTS_DIR}}`
- `{{KFK_CLAIMS_MODULE}}`
- `{{KFK_FITTER_VERSION}}`
- `{{KFK_FITTER_DESCRIPTION}}`

These are documented in [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:5), which is good. The gap is ensuring we can automatically *prove* there are no extra/undocumented tokens in templates.

Recommendation: add a short “Token audit” section to [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:1) explaining how to grep for `{{KFK_` across copied templates.

### 6) Repo hygiene docs expected by employers/public repos

Recommendation: add at least:

- LICENSE
- SECURITY.md (even if minimal)
- CONTRIBUTING.md

Optional but nice:

- CHANGELOG.md (or releases guidance)
- CODE_OF_CONDUCT.md

## Concrete next edits (minimal set)

1) Fix link paths in:
   - [`README.md`](README.md:1)
   - [`docs/INSTALL.md`](docs/INSTALL.md:1)
   - [`docs/WORKFLOW_REFERENCE.md`](docs/WORKFLOW_REFERENCE.md:1)

2) Remove/replace missing-file references in:
   - [`templates/.kilocode/workflows/orchestrate-start-task.md`](templates/.kilocode/workflows/orchestrate-start-task.md:1)
   - [`templates/.kilocode/workflows/orchestrate-execute-task.md`](templates/.kilocode/workflows/orchestrate-execute-task.md:1) (references other monolithic workflows)
   - [`templates/.kilocode/workflows/fitter-line-health.md`](templates/.kilocode/workflows/fitter-line-health.md:1)
   - [`templates/.kilocode/rules/beads.md`](templates/.kilocode/rules/beads.md:1)

3) Generalize org-specific content:
   - [`templates/.kilocode/skills/beads-local-db-ops/SKILL.md`](templates/.kilocode/skills/beads-local-db-ops/SKILL.md:1)
   - [`templates/.kilocodemodes`](templates/.kilocodemodes:1)
