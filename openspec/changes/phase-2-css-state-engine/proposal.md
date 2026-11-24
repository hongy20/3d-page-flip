# Proposal: Phase 2, CSS State Engine

## Why

To maintain a strict separation where CSS owns declarative page state and physics, each page in the book scroller needs a normalized position state `--progress` in `[-1, 1]` driven entirely by the browser's native CSS Scroll-Driven Animations engine with zero JavaScript involvement.

## What Changes

- Register `--progress` in CSS via `@property` (`syntax: '<number>'`, `inherits: true`, `initial-value: 0`) so it interpolates smoothly and inherits to page descendants.
- Attach a linear `@keyframes` animation (`--progress: -1` to `1`) to each `.page` driven by `animation-timeline: view(inline)` and clamped with `animation-fill-mode: both`.
- Configure and document the `animation-range` and sign convention so `--progress` is `-1` when a page is one full page-width to the right of its snapped position, `0` when snapped/centered, and `1` when one full page-width to the left.
- Provide a pure-CSS/markup debug readout (toggled by URL parameter or markup CSS class, without JS listeners) displaying each page's live `--progress` value on screen.
- Optionally wire `--progress` to DOM-side visual treatments pending `OQ-02`, while keeping zero JS reads or writes of `--progress`.

### Out of Scope

- `<canvas layoutsubtree>`, WebGL context, and HTML-in-Canvas texture uploads (Phase 3).
- Vertex shader deformation and `scrollLeft` uniform bridge (Phase 4).

## Capabilities

### New Capabilities
- `css-scroll-state`: Declarative per-page normalized scroll progress state (`--progress` in `[-1, 1]`) driven by CSS `@property` and `view(inline)` scroll-driven timelines, plus pure-CSS debug readout.

### Modified Capabilities
<!-- None -->

## Impact

- **Files affected**: `src/style.css`, `index.html` (debug class/markup for `--progress` readout).
- **Dependencies**: None (native CSS Scroll-Driven Animations and CSS Properties & Values API in Chrome 157+).
- **Open Questions**: `OQ-02` (what DOM-side visuals `--progress` drives) and `OQ-12` (consistency with the snap alignment chosen in `book-scroller`).
