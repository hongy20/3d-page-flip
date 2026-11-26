# Tasks: Phase 2, CSS State Engine

## 1. Open Questions & CSS Custom Property Registration

- [ ] 1.1 Confirm updated Phase 2 spec with the user (with `OQ-02` resolved to CSS `--progress` as single source of truth and `OQ-12` confirmed as `scroll-snap-align: center`) before implementing
- [ ] 1.2 Register `@property --progress` (`syntax: '<number>'`, `inherits: true`, `initial-value: 0`) and integer helper `@property --progress-pct` (`syntax: '<integer>'`, `inherits: true`, `initial-value: 0`) in `src/style.css`, and verify in Chrome DevTools Computed styles that `.page` and its children inherit `--progress`

## 2. Scroll-Driven Timeline, Transition Modes & JS-Free Controls

- [ ] 2.1 Add the linear `@keyframes` (`--progress: -1` to `1`), `animation-timeline: view(inline)`, and `animation-fill-mode: both` rules on `.page`, tune `animation-range` so `--progress` is `-1` one page-width right, `0` when snapped, and `1` one page-width left, and document the sign convention (including first-page, last-page, and single-page behavior) in `src/style.css`
- [ ] 2.2 Add JS-free `<input type="radio" name="mode">` (`slide` checked by default, `stack`) and `<input type="checkbox" name="debug">` controls in `index.html`, and style the control bar in `src/style.css` without obscuring page scrolling
- [ ] 2.3 Implement the pure-CSS `stack` transition mode (`body:has(input[name="mode"][value="stack"]:checked)`) using `--progress` for stationary-underneath `translateX` and smaller-page-on-top `z-index` (with `isolation: isolate` on `.book`)
- [ ] 2.4 Implement the pure-CSS on-screen `--progress` debug readout (`body:has(input[name="debug"]:checked)`) using `--progress-pct` and CSS `counter()`, verifying the readout displays `0` on the snapped page, `-100` (`-1.00`) on its right neighbor, and `100` (`1.00`) on its left neighbor

## 3. Phase 2 Acceptance Verification

- [ ] 3.1 Verify in Chrome DevTools > Animations panel that scroll-driven animations are attached to each `.page`, mid-drag values change continuously and linearly with adjacent pages differing by `1`
- [ ] 3.2 Verify boundary and single-page cases in Chrome: first page starts at `0` (`[0, 1]`, never `-1`), last page ends at `0` (`[-1, 0]`, never `1`), and temporarily testing a 1-page `.book` (`N = 1`) resolves `--progress` to `0`
- [ ] 3.3 Verify `slide` and `stack` modes and debug toggle in Chrome: in `stack` mode, forward swipe slides the smaller-numbered top page out left while the next page stays stationary underneath, and backward swipe slides the smaller-numbered page in from the left over the stationary current page
- [ ] 3.4 Verify `grep -rnE "addEventListener|on(touch|wheel|pointer|mouse|scroll|change)|--progress|getComputedStyle|computedStyleMap" src/*.ts` returns zero matches and `npm run build` succeeds
