# Contributing

Station Kit (SK) is a workflow + contract template kit.

## Scope Boundary (what this repo is and is not)

Station Kit defines reference workflows, schemas, and integration patterns for external “stations” (e.g., Beads, MCP servers).

This repository does **not** ship or vendor runtime tool implementations (no embedded services, installers, CLIs, or bundled copies of external tools). Contributions that add new embedded runtime components to this repo will be declined.

Contributions that improve templates, contracts, documentation, and integrations with external tools are welcome.

## Scope

Contributions are most valuable when they improve:

- correctness (links, references, missing docs)
- clarity (docs, examples, onboarding)
- contract discipline (schemas + templates)
- workflow ergonomics (resumability, bounded retries)

## How to contribute

### Before you start

Please open an issue before investing significant effort in a pull request, especially for:

* workflow changes
* schema/contract changes
* new “station” dependencies
* structural reorganizations

Large or architectural changes may be declined if they do not align with the reference factory model.

1) Open an issue describing the change and the motivation.
2) If the change affects workflow behavior or schemas, propose:
   - what contract changes (if any) are required
   - how the change avoids breaking existing workflows
3) Submit a PR.

## Contribution guidelines

- Keep changes small and reviewable.
- Prefer updates that are **tool-agnostic** unless the dependency is a deliberate station in the reference stack.
- Avoid adding runtime code to this repo; the kit should remain templates-only.

## PR acceptance criteria

Pull requests are most likely to be accepted when they:

* improve clarity, correctness, or onboarding
* strengthen contract discipline (schemas, templates, invariants)
* improve workflow ergonomics (resumability, bounded retries, drift detection)
* preserve the “templates-only” nature of the kit (no runtime implementations added)

## Style

- Documentation: Markdown.
- Keep repo-relative links correct.
- Prefer explicit references to canonical schemas in [`docs/SCHEMAS.md`](docs/SCHEMAS.md).
- Link style (GitHub-compatible):
  - Use repo-relative paths without `:line` suffixes (GitHub does not resolve `path:line` links).
  - Prefer section anchors (e.g., [`docs/SCHEMAS.md`](docs/SCHEMAS.md#handoff-packet-minimal-skeleton)).
  - Use `#L<line>` only when a stable heading anchor is not available.
