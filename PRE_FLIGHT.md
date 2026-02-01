# Pre-flight context capture (go-live)

This document captures the critical context from the "we are close to publishing" review, so the conversation can be resumed in a new session without losing the go-live decisions, risks, and next steps.

## Current go-live posture

- The repo is close to publish-ready, but there are still a few **publish blockers** that should be resolved before a public launch.
- A consolidated review/checklist was created in [`plans/GO_LIVE_REVIEW.md`](plans/GO_LIVE_REVIEW.md:1).

## Key questions that came up (and the answers)

### 1) Should we create a private GitHub repo first to run CI?

Yes. Private-first staging is generally the best path for a templates/docs kit:

- You can enable GitHub Actions and validate the workflow in [`.github/workflows/ci.yml`](.github/workflows/ci.yml:1) on real runners.
- You can validate GitHub-only surfaces (issue templates, PR templates, branch protection, rendered markdown links).

### 2) Are CI checks required for a templates/docs repository?

Not strictly required, but strongly recommended.

The most valuable CI checks for a repo like this are lightweight and protect against "first impression" failures:

- Broken repo-relative links in [`README.md`](README.md:1) and under [`docs/`](docs/:1)
- Leftover publish placeholders (e.g., `INSERT CONTACT METHOD`, `OWNER/REPO`)
- Drift between template placeholders in [`templates/`](templates/:1) and the single source of truth in [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:1)

### 3) Is it safe to include “kilo” in the repo name if you are not affiliated?

This is a real branding/trademark-risk area.

- Open-source licensing generally grants copyright permissions for code, but does **not** automatically grant permission to use a project/company name as branding.
- The primary practical risk is user confusion / implied affiliation.

Risk-reducing strategies discussed:

1) Prefer a compatibility-style name rather than an “official-sounding” brand-first name.
2) If using “kilo”, make it explicit that it is "for Kilo Code" rather than implying ownership.
3) Add a strong non-affiliation disclaimer near the top of [`README.md`](README.md:1) and in [`docs/INSTALL.md`](docs/INSTALL.md:1).
4) Do not ship contact info that routes to a third party you are not affiliated with.

## Repo findings (what we verified)

### Public-facing baseline exists

- License present: [`LICENSE.md`](LICENSE.md:1)
- Security policy present: [`SECURITY.md`](SECURITY.md:1)
- Contribution guidelines present: [`CONTRIBUTING.md`](CONTRIBUTING.md:1)
- Changelog scaffold present: [`CHANGELOG.md`](CHANGELOG.md:1)
- Core docs present: [`docs/`](docs/:1)
- Templates present: [`templates/`](templates/:1)

### CI is currently a stub

- Current CI prints placeholder output and does not enforce checks: [`.github/workflows/ci.yml`](.github/workflows/ci.yml:1)

### Token audit (templates) was executed

We extracted the set of `{{SK_*}}` tokens used under [`templates/`](templates/:1). The token list is:

- `SK_ARCH_CONFIG_PATH`
- `SK_ARCH_VERIFY_CMD`
- `SK_ARTIFACTS_DIR`
- `SK_BOUNDED_GATE_RUNNER_CMD`
- `SK_CLAIMS_MODULE`
- `SK_FITTER_DESCRIPTION`
- `SK_FITTER_VERSION`
- `SK_MYPY_TARGET`
- `SK_PYTEST_ARGS`
- `SK_PYTHON_RUNNER`

The documentation already includes a token audit recipe in [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:193).

### Tooling mismatch discovered

The publish checklist recommends `rg`, but `rg` is not installed in the current environment.

- `rg` usage in [`plans/PUBLISH_CHECKLIST.md`](plans/PUBLISH_CHECKLIST.md:13)

This should be replaced with a Python-based scan command (CI-friendly).

## Changes applied during this session (provisional)

These edits were made to remove obvious placeholders and improve readiness, but some are **provisional** until final owner/repo and contact details are decided.

### 1) Fixed local mode file parsing

- Fixed malformed YAML so Kilo Code can load the local docs-only mode: [`.kilocodemodes`](.kilocodemodes:1)

### 2) Code of Conduct enforcement contact placeholder removed (provisional)

- Replaced the placeholder in [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md:33)

Important note: the inserted contact should be changed to **your** final public contact channel before going public.

### 3) Issue template security advisory URL placeholder removed (provisional)

- Updated [`.github/ISSUE_TEMPLATE/config.yml`](.github/ISSUE_TEMPLATE/config.yml:1)

Important note: the owner/repo must be set to your final GitHub repo.

### 4) Added go-live summary doc

- Created [`plans/GO_LIVE_REVIEW.md`](plans/GO_LIVE_REVIEW.md:1)

## Remaining publish blockers (high priority)

1) Decide final GitHub owner/repo slug (this drives multiple URLs)
2) Decide final public security/contact posture and update:
   - [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md:33)
   - [`.github/ISSUE_TEMPLATE/config.yml`](.github/ISSUE_TEMPLATE/config.yml:1)
3) Replace CI stub with minimal publish-readiness gates in [`.github/workflows/ci.yml`](.github/workflows/ci.yml:1)
4) Replace the `rg` guidance in [`plans/PUBLISH_CHECKLIST.md`](plans/PUBLISH_CHECKLIST.md:13) with a Python-based scan

## Minimal CI gates recommended (for a templates/docs repo)

If you decide to run CI at all, keep it lightweight:

1) Placeholder scan gate
- Fail CI if placeholders like `INSERT CONTACT METHOD` or `OWNER/REPO` appear.

2) Token audit gate
- Extract `{{SK_*}}` tokens under [`templates/`](templates/:1) and ensure they are all documented in [`docs/CONFIG_REFERENCE.md`](docs/CONFIG_REFERENCE.md:1).

3) Markdown link validation
- At minimum validate repo-relative links in [`README.md`](README.md:1), [`docs/`](docs/:1), and [`templates/`](templates/:1).

## Recommended go-live flow

1) Create a **private** GitHub repo, push `main`, enable GitHub Actions.
2) Implement minimal CI gates.
3) Run pre-public scans.
4) Decide final naming + disclaimers.
5) Make the repo public.
6) Tag first release and update [`CHANGELOG.md`](CHANGELOG.md:8).

