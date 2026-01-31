# Publish checklist (local git repo → public)

## Repo metadata
- [ ] Confirm default branch name (recommended: `main`).
- [ ] Confirm hosting target (GitHub/GitLab/etc.).
- [ ] Decide whether to keep the full local history or squash to a fresh initial commit.

## Local repo sanity
- [ ] Ensure `.gitignore` covers editor files, env files, build outputs.
- [ ] Verify working tree is clean: `git status`.
- [ ] Optional: add `.gitattributes` if you need line-ending normalization.

## Content audit (pre-public)
- [ ] Scan for credentials/tokens: `rg -n "(AKIA|BEGIN .*PRIVATE KEY|ghp_|github_pat_|xox[baprs]-|sk-|api[_-]?key|secret|password|token)" .`
- [ ] Check for private paths/org names (e.g., personal home directories or internal repo names).

## Initial commit (if not already done)
- [ ] `git init -b main`
- [ ] `git add .`
- [ ] `git commit -m "Initial commit"`

## Publish
- [ ] Create remote repo on host.
- [ ] Add remote: `git remote add origin <remote-url>`.
- [ ] Push: `git push -u origin main`.

## After publish: branch protection + iteration workflow (GitHub)
- [ ] Enable branch protection on `main` (Settings → Branches):
  - Require a pull request before merging.
  - Require approvals (1 minimum).
  - Require status checks to pass (enable CI when ready).
  - Require conversation resolution.
  - Restrict force-pushes and deletions.
- [ ] Prefer PRs even for solo work (creates reviewable history and safer rollbacks).
- [ ] Tag releases (e.g., `v0.1.0`) after stable milestones.
- [ ] Use `CHANGELOG.md` for user-visible changes.
- [ ] Keep `SECURITY.md` current and use GitHub Security Advisories if needed.

## Optional open-source hardening
- [ ] Add `CODE_OF_CONDUCT.md`.
- [ ] Add `CHANGELOG.md` or release notes guidance.
- [ ] Add issue/PR templates under `.github/`.
