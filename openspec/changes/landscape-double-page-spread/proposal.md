# Proposal

## Why

On landscape viewports (landscape phones, tablets, and desktop screens), readers expect a physical magazine spread rather than a single centered page: cover Page 1 alone on the right, paired spreads (2–3 through 16–17) across a central spine, and back cover Page 18 alone on the left, with double-sided page textures visible during 3D curls.

## What Changes

- Add a responsive `@media (orientation: landscape)` double-page magazine spread layout (10 spreads: `[blank, 1]`, `[2, 3]`, ..., `[16, 17]`, `[18, blank]`) while keeping the single-page layout (`1..18`) on `@media (orientation: portrait)`.
- Drive spread-level `--progress` in `[-1, 1]` via pure CSS `view(inline)` in landscape mode with zero JS scroll physics, and transition each 2-page `.spread` as a single unit in landscape `stack` mode via pure CSS (`OQ-SPREAD-1` resolved).
- Extend the WebGL `curl` renderer and fragment shader (`src/shaders/page.frag.glsl`) so a turning leaf in landscape curls across the central spine with the paired next/previous page texture rendered on its reverse side (`!gl_FrontFacing`), horizontally mirrored so it reads left-to-right when landed on the opposite half.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `book-scroller`: Add `@media (orientation: landscape)` physical magazine spread layout (including unified spread transitions in `stack` mode) while preserving single-page portrait layout.
- `css-scroll-state`: Expose spread-level `--progress` via `view(inline)` in landscape mode while keeping per-page `--progress` in portrait.
- `cone-page-curl`: Render paired next/previous page textures (horizontally mirrored on the back face) when curling a leaf in landscape spread mode.

## Impact

- **Files affected**: `index.html` (or `reader.html` + `src/main.ts` if `book-library` lands first), `src/style.css`, `src/gl/renderer.ts`, `src/gl/geometrySync.ts`, `src/shaders/page.frag.glsl`.
- **Dependencies**: None.
- **Open Questions**: None (`OQ-SPREAD-1` resolved: landscape `stack` mode transitions the full 2-page spread as one unit).
