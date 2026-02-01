# Go-live review (public release readiness)

Status: close, but a few publish-blockers remain.

## What is already strong

- Clear positioning and scope: templates-only kit in [`README.md`](../README.md:1) and install posture in [`docs/INSTALL.md`](../docs/INSTALL.md:1)
- License + hygiene docs exist: [`LICENSE.md`](../LICENSE.md:1), [`SECURITY.md`](../SECURITY.md:1), [`CONTRIBUTING.md`](../CONTRIBUTING.md:1), [`CHANGELOG.md`](../CHANGELOG.md:1)
- Templates + workflows are coherent and cross-referenced: [`docs/WORKFLOW_REFERENCE.md`](../docs/WORKFLOW_REFERENCE.md:1), [`templates/.kilocode/workflows/`](../templates/.kilocode/workflows/:1)
- Token documentation is now actually complete and includes a token audit recipe: [`docs/CONFIG_REFERENCE.md`](../docs/CONFIG_REFERENCE.md:1)

## Publish blockers discovered (must fix)

### 1) Hardcoded placeholders / repo metadata

- CoC enforcement contact was a placeholder and has been replaced; confirm it is correct for the public repo:
  - [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md:33)
- GitHub issue template had `OWNER/REPO` placeholder and has been replaced; confirm final owner/repo is correct:
  - [`.github/ISSUE_TEMPLATE/config.yml`](../.github/ISSUE_TEMPLATE/config.yml:1)

### 2) CI is currently a stub

CI currently prints a placeholder message and does not validate links/tokens/placeholders:
- [`.github/workflows/ci.yml`](../.github/workflows/ci.yml:1)

For a public repo, CI should at least enforce:
- no publish placeholders (e.g., `INSERT CONTACT METHOD`, `OWNER/REPO`)
- token audit parity with [`docs/CONFIG_REFERENCE.md`](../docs/CONFIG_REFERENCE.md:193)
- basic markdown link validation

### 3) Publish checklist uses tooling not present

The publish checklist recommends `rg` for credential scanning:
- [`plans/PUBLISH_CHECKLIST.md`](PUBLISH_CHECKLIST.md:13)

In this environment, `rg` is not installed. Replace with a Python-based scan command (CI-friendly).

## Credibility leaks (recommended before publish)

### A) Cross-project narrative references

The docs reference other repos and licensing postures:
- [`docs/MENTAL_ONRAMP.md`](../docs/MENTAL_ONRAMP.md:103)
- [`docs/ECOSYSTEM_STAGING.md`](../docs/ECOSYSTEM_STAGING.md:33)

This is not “secret,” but it is a deliberate public-positioning choice.

### B) Ensure templates stay project-agnostic

The template modes include optional integrations and language that can read as “this repo assumes claims tooling”:
- [`templates/.kilocodemodes`](../templates/.kilocodemodes:1)

Goal: keep optional integrations explicitly optional, and avoid any wording that sounds like internal tooling is required.

## Actions checklist (sequenced)

- [ ] Confirm final publish target and canonical repo URL (owner/repo)
- [ ] Normalize/confirm the two hardcoded metadata entries:
  - [ ] [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md:33)
  - [ ] [`.github/ISSUE_TEMPLATE/config.yml`](../.github/ISSUE_TEMPLATE/config.yml:1)
- [ ] Upgrade CI from stub to publish-readiness checks:
  - [ ] placeholder scan (fail build if found)
  - [ ] `{{SK_*}}` token audit check (fail if any token not in allowlist)
  - [ ] markdown link validation (at least repo-relative links)
- [ ] Update [`plans/PUBLISH_CHECKLIST.md`](PUBLISH_CHECKLIST.md:13) to use Python scanning instead of `rg`
- [ ] Run local pre-public scans:
  - [ ] credential/token scan
  - [ ] private paths/org names scan
  - [ ] link resolution scan
- [ ] Update review docs so they match reality (avoid shipping stale warnings):
  - [ ] [`plans/PROJECT_REVIEW.md`](PROJECT_REVIEW.md:1)
  - [ ] [`plans/PROJECT_REVIEW_V2.md`](PROJECT_REVIEW_V2.md:1)
- [ ] Prep first public release metadata:
  - [ ] finalize first version section in [`CHANGELOG.md`](../CHANGELOG.md:8)
  - [ ] tag + release notes

## Notes from the latest audit

- Template token inventory (from a recursive scan under [`templates/`](../templates/:1)):
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
