# Proposal: Phase 3, WebGL Overlay & HTML-in-Canvas

## Why

Traditional 3D page-flip implementations rely on static DOM-to-image rasterization hacks (`html2canvas`, SVG `foreignObject`) that break live interactivity, text selection, and accessibility. Phase 3 introduces a raw WebGL2 overlay powered by Chrome 158+'s native HTML-in-Canvas API (`<canvas content="drawable">`, `drawable` descendants, `getElementImageDefaultSize`, `texElementSubImage2D`, and `updateElementGeometry`) to render live, interactive DOM pages onto a densely tessellated 3D plane without obstructing native CSS scroll physics.

## What Changes

- Add a viewport-fixed `<canvas content="drawable">` with a raw WebGL2 context (`OQ-01`), DPR-aware sizing capped at `2` and driven by `ResizeObserver`, and upfront feature detection for `content="drawable"`, `texElementSubImage2D`, `getElementImageDefaultSize`, and `updateElementGeometry` with a clear in-page message when missing.
- Wrap `<main class="book" drawable>` directly inside `<canvas content="drawable">` as a single DOM (`OQ-03` Option a) and synchronize hit-testing and scroll routing via `canvas.updateElementGeometry(el, { canvasTransform })` so native scrolling, snapping, and CSS `view(inline)` `--progress` from `book-scroller` and `css-scroll-state` remain unobstructed.
- Mark each `<article class="page__content" drawable>` and maintain one WebGL2 texture per page (`OQ-05`), pre-allocated to `canvas.getElementImageDefaultSize(el)` and uploaded exclusively via `gl.texElementSubImage2D(gl.TEXTURE_2D, 0, 0, 0, el)` inside the canvas `paint` (`CanvasPaintEvent`) handler—re-uploading only when page content repaints (`event.changedElements`), on initial paint, or on resize, never per-frame.
- Generate a densely tessellated plane geometry (default `64x64` segments) in the XY-plane with the binding along the Y-axis at `x = 0` and page extending to `+x`, matching the page aspect ratio and camera projection so a flat snapped page aligns pixel-for-pixel (`+-1 px`) with its DOM layout.

### Out of Scope

- Cone vertex shader deformation, CSS `--progress` to uniform mapping, and lighting (Phase 4).
- Non-WebGL fallback renderers or polyfills for browsers lacking HTML-in-Canvas.

## Capabilities

### New Capabilities
- `webgl-html-in-canvas`: Raw WebGL2 overlay using `<canvas content="drawable">` and event-driven `texElementSubImage2D` uploads to render live HTML page elements onto a pixel-aligned, densely tessellated plane.

### Modified Capabilities
<!-- None -->

## Impact

- **Files created/affected**: `index.html`, `src/style.css`, `src/main.ts`, `src/gl/` (context, feature detection, resize observer, geometry sync, plane geometry, texture upload manager, render loop), `src/shaders/page.frag.glsl` (and flat vertex shader prior to Phase 4).
- **Dependencies**: None (`OQ-01` resolved: Raw WebGL2).
- **Open Questions**: All resolved (`OQ-01`: Raw WebGL2; `OQ-03`: Option a, single DOM inside `<canvas content="drawable">`; `OQ-05`: one WebGL texture per page).
