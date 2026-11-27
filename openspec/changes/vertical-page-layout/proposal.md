# Proposal

## Why

Readers on portrait viewports often prefer swiping up and down vertically through single pages (like a top-bound notepad or vertical feed) as an alternative to horizontal page turns.

## What Changes

- Add a vertical single-page scroller layout for portrait viewports (`flex-direction: column`, `overflow-y: auto`, `overflow-x: hidden`, `scroll-snap-type: y mandatory`, `overscroll-behavior-y: none`) driven by CSS `view(block)` for `--progress` in `[-1, 1]`.
- Support all three transition modes in vertical layout: `slide` (vertical native scroll-snap), `stack` (pure-CSS vertical stack-pin and depth reveal along Y and Z), and `curl` (3D page curl anchored along the **horizontal top hinge**, flipping pages upward and downward).
- Enforce horizontal layout automatically in landscape / double-page spread viewports so vertical layout applies strictly to single-page / portrait viewing.
- Out of scope: vertical double-page spreads, JS scroll/momentum physics, or settings UI persistence (handled in `reader-settings`).

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `book-scroller`: Add vertical single-page scroll-snap layout in portrait while keeping landscape horizontal.
- `css-scroll-state`: Expose `--progress` via `view(block)` and add pure-CSS vertical `stack` keyframes when vertical layout is active.
- `cone-page-curl`: Support horizontal top-hinge 3D page curl (cone + cylinder + blank back-face) when vertical layout is active in `curl` mode.

## Impact

- **Files affected**: `src/style.css`, `src/gl/coneMath.ts`, `src/gl/coneMath.test.ts`, `src/shaders/cone.vert.glsl`, `src/gl/renderer.ts`.
- **Dependencies**: None.
- **Unaffected**: `index.html`, `src/library.ts`, `src/books/catalog.ts`, horizontal landscape spread layout.
