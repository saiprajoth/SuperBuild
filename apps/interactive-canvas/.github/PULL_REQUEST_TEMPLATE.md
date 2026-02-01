## Summary
What does this PR change?

## Checklist (must)
- [ ] A001 smoke passes (pan/zoom/select/box-select/drag/resize/delete/undo-redo)
- [ ] Unit tests pass (`npm run test:unit`)
- [ ] E2E tests pass (`npm run test:e2e`) or justified skip with reason
- [ ] Export smoke: generated ZIP builds & runs (`npm run dev` in exported output)
- [ ] No regressions to existing canvas interactions

## SCALED v2
- [ ] S: single source & history/coalescing intact
- [ ] C: contracts/schemas updated where needed
- [ ] A: clean separation of layers maintained
- [ ] L: world-space math preserved
- [ ] E: no new perf regressions; rAF/coalescing used for pointer interactions
- [ ] D: ADR/README updated if behavior changed

## Notes / Screenshots
Attach short gif/video if UI changed.
