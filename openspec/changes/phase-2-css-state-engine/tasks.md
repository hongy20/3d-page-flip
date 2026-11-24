# Tasks: Phase 2, CSS State Engine

## 1. Open Questions & CSS Custom Property Registration

- [ ] 1.1 Resolve `OQ-02` (what DOM-side visuals `--progress` drives) and confirm `OQ-12` snap alignment consistency with the user, verifying the recorded decisions in `design.md` and `proposal.md`
- [ ] 1.2 Register `@property --progress` (`syntax: '<number>'`, `inherits: true`, `initial-value: 0`) in `src/style.css` and verify in Chrome DevTools Computed styles that `.page` and its children inherit `--progress`

## 2. Scroll-Driven Timeline & Pure-CSS Debug Readout

- [ ] 2.1 Add the linear `@keyframes` (`--progress: -1` to `1`), `animation-timeline: view(inline)`, and `animation-fill-mode: both` rules on `.page`, tune `animation-range` so `--progress` is `-1` one page-width right, `0` when snapped, and `1` one page-width left, and document the sign convention in `src/style.css`
- [ ] 2.2 Implement the pure-CSS on-screen `--progress` debug readout (toggled by markup class or URL parameter without JS listeners) and any DOM-side visual rules decided in `OQ-02`, and verify the readout displays `0` on the snapped page, `-1` on its right neighbor, and `1` on its left neighbor

## 3. Phase 2 Acceptance Verification

- [ ] 3.1 Verify in Chrome DevTools > Animations panel that scroll-driven animations are attached to each `.page`, mid-drag values change continuously and linearly with adjacent pages differing by `1`, and `grep -rE "addEventListener|on(touch|wheel|pointer|mouse)|--progress" src/*.ts` returns zero matches
