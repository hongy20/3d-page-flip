# Proposal

## Why

Currently `conicContribution` is sampled only once on `pointerdown` for touch input, and the curl crease moves on a fixed progress curve rather than tracking the user's pointer, making vertical curl adjustments and drag alignment feel disconnected.

## What Changes

- Replace the touch-only `pointerdown` check with passive, read-only Pointer Events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) on `.book` to update `conicContribution` continuously while dragging vertically across mouse, pen, and touch devices (with zero JS scroll or DOM movement).
- Implement evaluable support for two bending-edge tracking strategies so both can be tested side-by-side in Chrome before locking in the preferred behavior:
  - **Option 1 (`--progress`-calibrated linear crease)**: Keep CSS `--progress` as the sole horizontal driver and calibrate curl parameters so the visible bending crease tracks horizontal progress linearly across the page width.
  - **Option 2 (Pointer-X-tracked crease)**: Read horizontal pointer position during an active drag so the visible bending crease tracks the pointer directly, blending smoothly back to `--progress` on release for native scroll-snap settling.
- Update `AGENTS.md` constraint wording to permit passive, read-only `pointermove` tracking (and Option 2 active-drag pointer-X coupling if selected).

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `cone-page-curl`: Continuous Pointer Events vertical `conicContribution` updates across mouse, touch, and pen, plus intuitive horizontal bending-edge tracking (with Option 1 vs Option 2 evaluation).

## Impact

- **Files affected**: `src/gl/renderer.ts`, `src/gl/coneMath.ts`, `src/gl/coneMath.test.ts`, `src/shaders/cone.vert.glsl`, `AGENTS.md`.
- **Dependencies**: None.
- **Unaffected**: `index.html`, `src/style.css`, CSS `--progress` scroll-driven state, and native `scroll-snap` pagination.
