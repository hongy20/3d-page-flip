# Tasks: WebGL Overlay & HTML-in-Canvas

## 1. Chrome 158+ API Spike & Open Questions

- [x] 1.1 Run a verification spike in Chrome 158+ (`158.0.8127.89`) to confirm the exact `<canvas content="drawable">` + `drawable` attributes, `gl.texElementSubImage2D(TEXTURE_2D, 0, 0, 0, el)` signature, `canvas.getElementImageDefaultSize(el)` pre-allocation, `canvas.updateElementGeometry(el, { canvasTransform })` backing-store hit-test sync, `CanvasPaintEvent` (`changedElements`), `requestPaint()`, and `chrome://flags/#canvas-draw-element`, and record findings in `design.md` and `README.md`
- [x] 1.2 Resolve `OQ-01` (Raw WebGL2), `OQ-03` (Option a: `.book` scroller inside `<canvas content="drawable">`), and `OQ-05` (one WebGL texture per page) with the user, verifying the updates in `design.md` and `proposal.md`

## 2. WebGL2 Context, Feature Detection & DPR Sizing

- [x] 2.1 Wrap `<main class="book" drawable>` inside `<canvas content="drawable">` in `index.html`, mark `<article class="page__content" drawable>`, and implement raw WebGL2 context initialization (`{ alpha: true, premultipliedAlpha: true }`) and upfront feature detection (`content="drawable"`, `texElementSubImage2D`, `getElementImageDefaultSize`, `updateElementGeometry`) in `src/gl/`, verifying that browsers without the API show the unsupported-browser diagnostic message without throwing
- [x] 2.2 Implement `ResizeObserver`-driven, DPR-aware (capped at `2`) canvas backing store sizing and `canvas.updateElementGeometry(...)` sync for `.book` and active `.page__content` in canvas CSS pixel space, and verify scrolling, snapping, `--progress`, and `.page__badge` interaction work identically to `book-scroller`

## 3. Plane Geometry, Camera Alignment & Event-Driven Texture Upload

- [x] 3.1 Implement the `64x64` tessellated XY-plane geometry with binding along the Y-axis at `x = 0` (`x in [0, W]`, matching `book-scroller` `.page__content` aspect ratio) and camera/projection matrix in `src/gl/`, verifying the flat snapped page (`progress = 0`) overlays the DOM page within `+-1 px`
- [x] 3.2 Implement per-page `gl.texElementSubImage2D(gl.TEXTURE_2D, 0, 0, 0, el)` texture upload (pre-allocated via `canvas.getElementImageDefaultSize(el)`, `UNPACK_FLIP_Y_WEBGL = 1`, `UNPACK_PREMULTIPLY_ALPHA_WEBGL = 1`) inside the canvas `paint` handler gated on `event.changedElements` (plus initial paint/resize) with idle-by-default rAF drawing and `src/shaders/page.frag.glsl`, verifying live DevTools DOM edits and `:hover` changes update the WebGL render within one frame

## 4. Acceptance Verification

- [x] 4.1 Verify in Chrome Performance panel that texture uploads occur only on `paint` events (never per-frame while idle and never for unchanged pages during scroll), `npm run build` passes with zero TS errors, and `src/` still contains zero navigation listeners or JS DOM movement
