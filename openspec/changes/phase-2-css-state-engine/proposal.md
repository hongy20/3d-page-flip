# Proposal: Phase 2, CSS State Engine

## Why

To maintain a single declarative source of truth where CSS owns page scroll state and physics, each page in the book scroller needs a normalized position state `--progress` in `[-1, 1]` driven entirely by the browser's native CSS Scroll-Driven Animations engine with zero JavaScript involvement. That `--progress` signal powers pure-CSS transition modes (`slide` and `stack`) and debug readouts in Phase 2, and serves as the canonical animation state read by WebGL in Phase 4.

## What Changes

- Register `--progress` in CSS via `@property` (`syntax: '<number>'`, `inherits: true`, `initial-value: 0`) so it interpolates smoothly and inherits to page descendants.
- Attach a linear `@keyframes` animation (`--progress: -1` to `1`) to each `.page` driven by `animation-timeline: view(inline)` and clamped with `animation-fill-mode: both`.
- Configure and document the `animation-range` and sign convention so `--progress` is `-1` when a page is one full page-width to the right of its snapped position, `0` when snapped/centered, and `1` when one full page-width to the left, including explicit boundary and single-page behavior:
  - First page starts at `0` and ranges over `[0, 1]` (never `-1`).
  - Last page enters from `-1` and ends at `0`, ranging over `[-1, 0]` (never `1`).
  - Single-page book (`N = 1`, zero scrollable overflow) has an inactive `view(inline)` timeline, so `--progress` resolves cleanly to `0`.
- Implement extensible pure-CSS transition modes driven by `--progress`:
  - `slide` (default): native horizontal slide in/out.
  - `stack`: smaller page numbers visually stack on top of larger page numbers; swiping forward slides the top page out from the left while the next page stays stationary underneath; swiping backward slides the incoming smaller-numbered page in from the left over the stationary current page.
- Provide a 100% JS-free mode switcher (`<input type="radio" name="mode">` for `slide` / `stack`, extensible for future modes) and debug toggle (`<input type="checkbox" name="debug">`) wired via CSS `:has()`, displaying each page's live `--progress` value on screen with zero JavaScript.
- Record `OQ-02` as resolved: CSS `--progress` is the single source of truth for both pure-CSS transitions (Phase 2) and WebGL shader uniforms (Phase 4, where JS reads `--progress` via CSSOM).

### Out of Scope

- `<canvas layoutsubtree>`, WebGL context, and HTML-in-Canvas texture uploads (Phase 3).
- Vertex shader deformation and CSS `--progress` to WebGL uniform bridge (Phase 4).

## Capabilities

### New Capabilities
- `css-scroll-state`: Declarative per-page normalized scroll progress state (`--progress` in `[-1, 1]`) driven by CSS `@property` and `view(inline)` scroll-driven timelines, extensible pure-CSS transition modes (`slide`, `stack`), and JS-free mode/debug controls with an on-screen debug readout.

### Modified Capabilities
<!-- None -->

## Impact

- **Files affected**: `src/style.css`, `index.html` (JS-free radio/checkbox controls for transition mode and `--progress` debug readout).
- **Dependencies**: None (native CSS Scroll-Driven Animations, CSS `:has()`, and CSS Properties & Values API in Chrome 157+).
- **Open Questions**: Both `OQ-02` and `OQ-12` are resolved; no blocking open questions remain for Phase 2.
