# Station Kit: CI hygiene + token prefix rename plan

This plan addresses two strategic questions:

1) Should CI and repository-polish tooling live in the public repo?
2) Should the token allowlist live in markdown, and should `{{SK_*}}` become `{{SK_*}}`?

## 1) Should CI and polish tooling be public?

Yes, but keep it minimal and non-opinionated.

Public CI for a templates/docs repo is a credibility multiplier because it prevents:

- broken links in [`README.md`](../README.md:1), [`docs/`](../docs/:1), and [`templates/`](../templates/:1)
- accidental placeholder leakage (`OWNER/REPO`, contact placeholders)
- token/documentation drift (templates reference tokens that docs do not explain)

Constraints:

- CI must not require secrets.
- CI should be deterministic and fast.
- CI should validate what users will experience (markdown + templates), not run heavyweight builds.

Keeping this in the public repo is normal: it communicates maintainership discipline and protects every future rename and documentation sweep.

## 2) Allowlist-in-markdown vs config file

Concern: parsing config data from markdown is brittle.

Assessment:

- It is not a security risk by itself (the data is still committed, not user-supplied).
- It is a maintenance risk (formatting changes can break the parser).

Recommendation: move the canonical token allowlist to a machine-readable file, and let docs link to it.

Suggested options (pick one):

- Preferred (simple): `tools/tokens_allowlist.txt` (one token name per line, `#` comments allowed)
- Alternative: `tools/tokens_allowlist.toml` (structured, more verbose)
- Alternative: `tools/tokens_allowlist.json` (structured, easy to parse)

Then update [`scripts/token_audit.py`](../scripts/token_audit.py:1) to read the allowlist file instead of scraping [`docs/CONFIG_REFERENCE.md`](../docs/CONFIG_REFERENCE.md:1).

Docs posture:

- Keep [`docs/CONFIG_REFERENCE.md`](../docs/CONFIG_REFERENCE.md:1) as the narrative single source of truth.
- Make the allowlist file the machine source of truth.

That is a clean separation: humans read docs; CI reads config.

## 3) Token prefix rename: `{{SK_*}}` → `{{SK_*}}`

You are right that if the product name is Station Kit, the token namespace should match.

### Decision point: support both prefixes or do a clean break

Option A (recommended before public release): hard cut

- Rename every `{{SK_*}}` to `{{SK_*}}` across:
  - [`templates/`](../templates/:1)
  - [`docs/`](../docs/:1)
  - CI scripts under [`scripts/`](../scripts/:1)
  - planning docs under [`plans/`](../plans/:1)
- This is a breaking change, but it is the lowest complexity and best if done before the repo is public.

Option B (compatibility window): dual support

- Templates ship with `{{SK_*}}`.
- CI token-audit accepts both `SK_` and `SK_` temporarily.
- Docs explain the deprecation path.

Given this repo is not yet publicly established, Option A is the cleanest.

### What must change mechanically

- Token regex in [`scripts/token_audit.py`](../scripts/token_audit.py:1)
  - from `SK_...` to `SK_...` (or both if doing Option B)
- Token audit snippet in [`docs/CONFIG_REFERENCE.md`](../docs/CONFIG_REFERENCE.md:193)
  - from `SK_...` to `SK_...`
- Any references in docs/plans to SK token names
- Any sample commands that embed tokens (workflows under [`templates/.kilocode/workflows/`](../templates/.kilocode/workflows/:1))

## 4) Sequencing (why CI first still holds)

CI should land first because the rename is a broad change that will otherwise be hard to validate. After CI is stable:

1) Move token allowlist to `tools/` and update the audit script.
2) Rename tokens to `SK_` everywhere.
3) Rename branding strings (Station Kit → Station Kit) in the public narrative.
4) Run CI to catch missed links/tokens/placeholders.

## 5) Follow-on decisions

- Repo slug is set to `station-kit` (owner is personal). That should drive any remaining hardcoded URLs.
- Decide whether you want any compatibility language around Kilo Code naming (non-affiliation disclaimer) in [`README.md`](../README.md:1).

