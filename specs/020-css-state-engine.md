# 020: Phase 2, CSS State Engine

Status: Draft

## Goal

Give every page a normalised, declarative position state `--progress ∈ [-1, 1]`, driven
by the browser's scroll-driven animation engine with zero JavaScript.

## Requirements

| ID | Requirement |
|----|-------------|
| CSS-01 | `--progress` MUST be registered with `@property` (`syntax: '<number>'`, `inherits: true`, `initial-value: 0`) so it can be interpolated and inherited by page descendants. |
| CSS-02 | Each `.page` MUST run a keyframe animation from `--progress: -1` to `--progress: 1` with `animation-timeline: view(inline)` and `animation-timing-function: linear`. |
| CSS-03 | The animation range MUST be configured so `--progress` is exactly `-1` when the page is one full page-width to the right of its snapped position, `0` when snapped, and `1` when one full page-width to the left. The sign convention must be documented in the CSS. |
| CSS-04 | `--progress` MUST stay clamped to [-1, 1] outside that range (`animation-fill-mode: both`). |
| CSS-05 | A debug view (toggled by a URL parameter or a CSS class set in markup, not by JS listeners) SHOULD print each page's live `--progress` value on screen, so the mapping can be verified visually. |
| CSS-06 | `--progress` MAY drive DOM-side visuals (e.g. hiding the flat DOM page while its 3D counterpart is curling). The exact use is pending **OQ-02**. |
| CSS-07 | No JS may read or write `--progress` in this phase. |

## Design notes

- A `view(inline)` timeline spans the whole time the page intersects the scrollport.
  With pages at 100% of the scroller width, the full "entry → exit" range already covers
  exactly ±1 page-width, so the default `cover` range should map directly. Verify
  empirically; if it doesn't, use explicit `animation-range` values.
- The debug readout can use CSS counters or `content` with a registered integer
  property derived from `--progress` (e.g. `calc(var(--progress) * 100)`), with no JS.
- Note the architectural fact: `--progress` lives in CSS and is **not** what drives the
  shader (ARCH-06 says JS reads `scrollLeft`). Both values derive from the same scroll
  position, so they agree by construction. CSS-03 and SHD-09 must use the same convention.

## Acceptance criteria

1. With the debug view on, the snapped page shows `0`, its right neighbour `-1`, and its left neighbour `1`.
2. Mid-drag, values change continuously and linearly with finger position, and the two
   visible pages always differ by exactly 1.
3. Chrome DevTools > Animations panel shows the scroll-driven animations attached to each page.
4. Still no event listeners in `src/`.

## Out of scope

Canvas, WebGL, uniforms.

## Tasks

- [ ] Add the `@property --progress` registration.
- [ ] Add the `@keyframes` and the `view(inline)` timeline on `.page`.
- [ ] Tune `animation-range` until it meets CSS-03; document the sign convention.
- [ ] Add the debug readout (CSS-05).
- [ ] Verify the acceptance criteria; commit.
