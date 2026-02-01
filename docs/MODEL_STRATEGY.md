# Model strategy and cognitive framing

Station Kit (SK) is designed around a simple idea:

> Treat software work as a factory line of stations. Each station gets a role name, constraints, and a model choice that make it excellent at its one job.

SK is “provider-neutral” in the narrow sense that you can **swap models per station** without changing the workflow contracts.

## Terms

- **Station**: a role in the line (Architect, Code Fabricator, PR Reviewer, Fitter).
- **Contract**: an explicit artifact passed between stations (handoff packet, comment ledger, line fault/restoration).
- **Cognitive frame**: the combination of role name + constraints + tool boundaries that steers model behavior.

## Why the role names matter

SK intentionally renames generic roles (for example, “Code” → “Code Fabricator”) to:

- reduce conversational drift
- focus the model on production changes + gates
- create consistent expectations across subtasks

See the mode definitions in [`templates/.kilocodemodes`](../templates/.kilocodemodes:1).

## Recommended model traits per station

SK does not require specific model vendors. The goal is to match *station demands*.

| Station | Mode slug | What you want from the model | Failure mode to watch |
| --- | --- | --- | --- |
| Architect | `architect` | planning clarity, tradeoff analysis, crisp specs | over-specifying without grounding in repo reality |
| Code Fabricator | `code` | high-precision edits, low hallucination, strong test discipline | fast but sloppy changes, missing call sites |
| PR Reviewer | `pr-review` | diff comprehension, structured feedback, ledger discipline | bikeshedding or missing blockers |
| Fitter | `fitter` | cautious diagnosis, bounded retries, runner-level mitigation | “fixing” product code instead of restoring line health |
| Claims Ops | `claims-ops` | pipeline ops + debugging, evidence discipline | inventing results without artifacts |

## A/B testing protocol (safe, contract-preserving)

When you change models, do it like an experiment.

1) **Change one station at a time**
- Keep workflows constant.
- Keep contracts constant.

2) **Do not switch models mid-run**
- A single run should have stable station/model assignments.

3) **Record runtime attestations**
- Each workflow already requires `runtime_model_reported` and `runtime_mode_reported`.
- Use the schema in [`docs/SCHEMAS.md`](SCHEMAS.md:1).

4) **Compare outcomes using operational metrics**
- Gates pass rate and rework rate.
- Timeout/stall incidence and frequency of Fitter escalations.
- PR ledger closure completeness.
- Average “handoff packet” quality (clarity + executable subtasks).

### Suggested scorecard template

```text
Run ID:
Stations:
- architect: <model>
- code: <model>
- fitter: <model>

Outcomes:
- gates_passed_first_try: yes|no
- line_faults: <count>
- retries_used: <count>
- pr_ledger_rows_total: <count>
- pr_ledger_rows_acknowledged: <count>
- notes: <freeform>
```

## Guardrails

- If a model is strong at code but weak at human conversation, that can be a feature: keep it in `code` station and keep it away from planning.
- Keep “pre-release surfaces” (like claims) explicitly optional unless you ship a real implementation.

