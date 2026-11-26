# Tasks: Stack Mode Z-Axis Depth Effect

## 1. CSS Animation Updates

- [ ] 1.1 Update `@keyframes stack-pin` in `src/style.css` to animate `translateX(-100vw) perspective(1200px) translateZ(-120px)` (`0%, 48%`) to `translateX(0) perspective(1200px) translateZ(0)` (`50%, 100%`), keeping `translateX` before `perspective`/`translateZ` and verifying `npm run build` succeeds with zero TypeScript errors
- [ ] 1.2 Update `@keyframes stack-reveal` in `src/style.css` to fade `opacity` from `0` (`0%, 48%`) through `0.55` (`48.001%`) to `1` (`50%, 100%`) and verify zero JS listeners or `--progress` mutations exist in `src/*.ts` (`grep -rnE "addEventListener|on(touch|wheel|pointer|mouse|scroll|change)|--progress|getComputedStyle|computedStyleMap" src/*.ts` returns zero matches)

## 2. Verification in Chrome

- [ ] 2.1 Verify in Chrome (`stack` mode) that during forward (`i -> i + 1`) and backward (`i + 1 -> i`) swipes, the underneath page remains horizontally centered (`centerX === W / 2`), rises forward on forward swipes (`width` growing and `opacity` `0.55 -> 1`) and recedes backward on backward swipes (`width` shrinking and `opacity` `1 -> 0.55`), and hides (`opacity: 0`) once covered
- [ ] 2.2 Verify in Chrome (`stack` mode) that `book.scrollWidth === 18 * W`, all 17 animated pages remain `playState: "running"`, `--progress` values remain unchanged, and `±0.51` scroll-snap symmetry holds across start, middle, and end pages

## Workflow follow-up

- Sync delta specs and archive `stack-z-depth` via `openspec-archive-change` after implementation and verification are complete.
