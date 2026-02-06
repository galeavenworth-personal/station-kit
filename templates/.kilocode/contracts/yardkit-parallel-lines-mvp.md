# Yardkit Parallel Lines MVP — Contract Checklist

## References

- Canonical spec: `docs/YARDKIT_PARALLEL_LINES_MVP.md`
- Schemas: `docs/SCHEMAS.md`
- Artifacts layout: `tools/yardkit/ARTIFACTS.md`

## Contract Checklist

- [ ] Lock record matches Yardkit lock schema (RFC3339 timestamp strings).
- [ ] Workspace record matches Yardkit workspace schema.
- [ ] Prep phase uses Kilo prep workflow and exports prep session.
- [ ] Execute phase imports prep session and exports execute session.
- [ ] Quality gates run via `npm run ci` and fail the run on non-zero exit.
- [ ] Run summary serialized with RFC3339 timestamps.
- [ ] Event stream serialized as JSONL with RFC3339 timestamps.
- [ ] Artifact paths follow `tools/yardkit/ARTIFACTS.md`.
- [ ] CURRENT vs CONTRACT differences documented in the canonical spec.
