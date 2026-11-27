# Design: Stack Mode Z-Axis Depth Effect

## Context

See `proposal.md` for motivation. In `src/style.css`, `stack` mode currently uses two single-property compositor animations (`stack-pin` for `transform` and `stack-reveal` for `opacity`) on `.page:not(:first-child) .page__content` bound to `--page-view` over `entry -2400% exit 2500%` (where `entry 0%` maps to `48%` and `entry 100%` maps to `50%`). This keeps all 17 animated pages in `playState: "running"` on the compositor and keeps `.page` snap geometry and `--progress` untouched.

## Goals / Non-Goals

**Goals:**

- Give the underneath page in `stack` mode a reversible z-axis rise/recede motion (`translateZ(-120px)` → `0`) and subtle depth dimming (`opacity: 0.55` → `1`) driven directly by `--page-view`.
- Keep the underneath page horizontally centered (`centerX === W / 2`) across the entire swipe without altering `.book.scrollWidth`, scroll-snap symmetry, or `--progress`.
- Preserve 100% compositor-accelerated `transform` + `opacity` animations.

**Non-Goals:**

- Modifying `slide` mode, `--progress`, `index.html`, or `src/main.ts`.
- Adding 3D perspective/curl to the top sliding page (handled in WebGL by `cone-vertex-shader`).

## Decisions

1. **Transform Function Ordering (`translateX` before `perspective` / `translateZ`)**
   - _Decision_: In `@keyframes stack-pin`, place `translateX(-100vw)` **before** `perspective(1200px) translateZ(-120px)` at `0%, 48%`, and `translateX(0) perspective(1200px) translateZ(0)` at `50%, 100%`.
   - _Rationale_: CSS transforms apply right-to-left in vector space. Applying `perspective(1200px) translateZ(-120px)` first scales the page cleanly about its own center (`scale ≈ 0.909`), and then `translateX(...)` shifts that centered result by the exact unscaled scroll cancellation distance so `centerX` remains locked at `W / 2`.
   - _Alternatives considered_: Putting `perspective(...)` on `.page` (would create a containing block / perspective plane across the scrolling `.page` element and shift the vanishing point off-center as `.page` scrolls) or putting `perspective(...)` before `translateX(-100vw)` (would foreshorten the `-100vw` cancellation and cause horizontal drift).

2. **Depth Dimming in `@keyframes stack-reveal`**
   - _Decision_: Fade `opacity` from `0.55` at `48.001%` (the instant the underneath page begins uncovering) to `1` at `50%, 100%`, keeping `0` on `0%, 48%` while covered.
   - _Rationale_: Splitting `opacity` from `transform` preserves single-property compositor keyframes while reinforcing the depth separation behind the top page and automatically reversing on backward swipes.

## Risks / Trade-offs

- **[Risk] Perspective vanishing point shifting if `perspective()` follows `translateX()` incorrectly or `.page` width changes during resize** → Mitigation: `translateX` is the outermost transform on `.page__content` (centered inside `.page`), so the perspective origin stays centered on `.page__content` at every viewport size.
