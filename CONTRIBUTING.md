# Contributing

## Scope

Kilo Factory Kit (KFK) is a **workflow + contract** template kit.

Contributions are most valuable when they improve:

- correctness (links, references, missing docs)
- clarity (docs, examples, onboarding)
- contract discipline (schemas + templates)
- workflow ergonomics (resumability, bounded retries)

## How to contribute

1) Open an issue describing the change and the motivation.
2) If the change affects workflow behavior or schemas, propose:
   - what contract changes (if any) are required
   - how the change avoids breaking existing workflows
3) Submit a PR.

## Contribution guidelines

- Keep changes small and reviewable.
- Prefer updates that are **tool-agnostic** unless the dependency is a deliberate station in the reference stack.
- Avoid adding runtime code to this repo; the kit should remain templates-only.

## Style

- Documentation: Markdown.
- Keep repo-relative links correct.
- Prefer explicit references to canonical schemas in [`docs/SCHEMAS.md`](docs/SCHEMAS.md:1).

