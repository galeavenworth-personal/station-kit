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

## Optional open-source hardening
- [ ] Add `CODE_OF_CONDUCT.md`.
- [ ] Add `CHANGELOG.md` or release notes guidance.
- [ ] Add issue/PR templates under `.github/`.
