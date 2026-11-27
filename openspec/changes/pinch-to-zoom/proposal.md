# Proposal

## Why

Readers inspecting dense typography, vector illustrations, or maps need smooth pinch-to-zoom and bounded panning without accidentally turning pages or triggering browser-level page zoom.

## What Changes

- Add reader zoom support via 2-finger touch pinch (Pointer Events), desktop/trackpad `Ctrl+wheel` pinch, and double-tap / double-click zoom toggle up to a capped maximum zoom (`4x`).
- Disable page turning while zoomed in (`scale > 1`), allow bounded panning across the visible page(s) clamped to meaningful content limits, and snap smoothly back to `scale = 1` when zooming out close to `1` (`<= 1.08`), re-enabling native CSS `scroll-snap` page turning.
- Disable native browser zoom on `reader.html` while keeping browser zoom enabled on `index.html` and `settings.html`.
- Document the scoped `AGENTS.md` exception: native CSS `scroll-snap` remains solely responsible for page-turn physics at `scale === 1`, while JS gesture listeners manage zoom and bounded pan.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `book-scroller`: Add pinch-to-zoom (`<= 4x`), scroll lock while zoomed in, snap-to-`1` reset, bounded panning, and reader browser-zoom suppression; scope the zero-JS listener constraint to page-turn navigation.
- `webgl-html-in-canvas`: Apply zoom/pan transforms to the WebGL2 view and sync hit-test geometry (`updateElementGeometry`) while zoomed.

## Impact

- **Files affected**: `reader.html`, `src/style.css`, `src/gl/zoomPan.ts`, `src/gl/zoomPan.test.ts`, `src/gl/renderer.ts`, `src/gl/camera.ts`, `src/gl/geometrySync.ts`, `AGENTS.md`.
- **Dependencies**: None.
- **Unaffected**: `index.html`, `settings.html`, `src/books/catalog.ts`, `src/shaders/cone.vert.glsl`.
