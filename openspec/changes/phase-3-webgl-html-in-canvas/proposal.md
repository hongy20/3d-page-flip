# Proposal: Phase 3, WebGL Overlay & HTML-in-Canvas

## Why

Traditional 3D page-flip implementations rely on static DOM-to-image rasterization hacks (`html2canvas`, SVG `foreignObject`) that break live interactivity, text selection, and accessibility (`VIS-02`, `ARCH-09`). Phase 3 introduces a WebGL2 overlay powered by Chrome 157+'s native HTML-in-Canvas API (`<canvas layoutsubtree>` and `texElementImage2D`) to render live, interactive DOM pages onto a densely tessellated 3D plane without obstructing native CSS scroll physics (`ARCH-07`, `GL-01`..`GL-13`).

## What Changes

- Add a viewport-fixed `<canvas layoutsubtree>` with a WebGL2 context, DPR-aware sizing capped and driven by `ResizeObserver`, and upfront feature detection for `layoutsubtree` and `texElementImage2D` with a clear in-page message when missing (`GL-01`, `GL-03`, `GL-04`, `ARCH-08`, `ARCH-12`, `ARCH-14`).
- Integrate the canvas with the `.book` scroller so native scrolling and snapping from Phase 1 remain unobstructed (`GL-02`, `GL-05`, pending `OQ-03`).
- Upload live page DOM elements to GPU textures exclusively via `gl.texElementImage2D(...)` inside the canvas `paint` event handler—re-uploading only when page content repaints, never per-frame (`GL-06`..`GL-09`, `ARCH-07`, `ARCH-09`, `ARCH-13`).
- Generate a densely tessellated plane geometry (default 64x64 segments) in the XY-plane with the binding along the Y-axis at `x = 0` and page extending to `+x`, matching the page aspect ratio and camera projection so a flat snapped page aligns pixel-for-pixel (`+-1 px`) with its DOM layout (`GL-10`..`GL-13`).

### Out of Scope

- Cone vertex shader deformation, `scrollLeft` to uniform mapping, and lighting (Phase 4).
- Non-WebGL fallback renderers or polyfills for browsers lacking HTML-in-Canvas (`GL-04`, `ARCH-08`, `ARCH-09`).

## Capabilities

### New Capabilities
- `webgl-html-in-canvas`: WebGL2 overlay using `<canvas layoutsubtree>` and event-driven `texElementImage2D` uploads to render live HTML page elements onto a pixel-aligned, densely tessellated plane (`GL-01`..`GL-13`, `ARCH-07`..`ARCH-09`, `ARCH-12`..`ARCH-14`).

### Modified Capabilities
<!-- None -->

## Impact

- **Files created/affected**: `index.html`, `src/style.css`, `src/main.ts`, `src/gl/` (context, feature detection, resize observer, plane geometry, texture upload manager, render loop), `src/shaders/page.frag.glsl` (and pass-through/flat vertex shader prior to Phase 4).
- **Dependencies**: None beyond the renderer decided in `OQ-01` (raw WebGL2 recommended).
- **Open Questions**: `OQ-01` (Raw WebGL2 vs Three.js), `OQ-03` (DOM structure of scroller relative to `<canvas layoutsubtree>`), and `OQ-05` (per-page textures vs 2-3 texture pool).
