# Proposal

## Why

On real Android phones, horizontal page-turn swipes feel smooth because CSS `--progress` updates at compositor frame rate, whereas moving a finger up and down mid-drag feels delayed and steppy. Once native scrolling begins, Chrome fires `pointercancel` and throttles passive `touchmove` updates to ~200 ms (`kAsyncTouchMoveInterval`), and the renderer currently snaps `(conicContribution, cornerBend)` instantaneously to each sample, lacks `overscroll-behavior-y: none` in horizontal mode, solves base cone parameters redundantly three times per frame, and runs full curved vertex shader work for flat pages and repeated layout reads every frame.

## What Changes

- Add frame-rate-independent exponential smoothing (`smoothCurlControl`) to live `(conicContribution, cornerBend)` updates during active turns while keeping instant grab-corner anchoring on turn start, smooth convergence through release, and idle-when-settled rendering—with 100% passive listeners and zero JS scroll or navigation physics.
- Apply `overscroll-behavior-y: none` globally on `html, body` and `.book` (including horizontal layout) so downward finger motion mid-turn does not fight Android Chrome's pull-to-refresh or vertical overscroll.
- Deduplicate `solveBaseConeParams()` in `src/gl/coneMath.ts` and `src/gl/renderer.ts` so base cone parameters are computed once per frame and shared across vertical curl control, corner bend, and `cylKappa`.
- Add a flat-page fast path in the WebGL renderer/shader so flat page draws (the stationary underlying page `baseIdx`, settled resting pages, and `slide`/`stack` modes) skip the 5× `curlDeform()` finite-difference vertex shader work while preserving pixel-aligned geometry and Lambert shading.
- Cache `canvasRect`, page `sampleRect`, and CSS page dimensions on resize/orientation change instead of polling `getBoundingClientRect()` and layout styles every frame during drag.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `cone-page-curl`: Smooth frame-rate-independent transitions on `(conicContribution, cornerBend)` across throttled mobile touch updates, single-pass per-frame base cone solving, and a flat-page fast path for non-curling page draws.
- `book-scroller`: Global `overscroll-behavior-y: none` alongside `overscroll-behavior-x: none` on the viewport and horizontal `.book` scroller so downward mid-turn drags on mobile touch devices do not trigger vertical overscroll or pull-to-refresh.

## Impact

- **Files affected**: `src/gl/coneMath.ts`, `src/gl/coneMath.test.ts`, `src/gl/renderer.ts`, `src/gl/planeGeometry.ts`, `src/shaders/cone.vert.glsl`, `src/style.css`.
- **Dependencies**: None.
- **Unaffected**: `AGENTS.md` non-negotiable constraints (native CSS `scroll-snap-type` only, passive read-only pointer/touch tracking, no `preventDefault()`), HTML-in-Canvas texture upload semantics, and inline SVG accessibility.
