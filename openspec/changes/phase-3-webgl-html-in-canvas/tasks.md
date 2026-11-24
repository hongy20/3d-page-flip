# Tasks: Phase 3, WebGL Overlay & HTML-in-Canvas

## 1. Chrome 157+ API Spike & Open Questions

- [ ] 1.1 Run a verification spike in Chrome 157+ to confirm the exact `<canvas layoutsubtree>` attribute name, `gl.texElementImage2D` signature, `paint` event semantics, `requestPaint()` method, and required Chrome flags, and record findings in `design.md` and `README.md` (`ARCH-07`, `ARCH-08`)
- [ ] 1.2 Resolve `OQ-01` (Raw WebGL2 vs Three.js), `OQ-03` (DOM structure of `.book` scroller relative to `<canvas layoutsubtree>`), and `OQ-05` (per-page textures vs 2-3 texture pool) with the user, verifying the updates in `specs/open-questions.md` and `design.md`

## 2. WebGL2 Context, Feature Detection & DPR Sizing

- [ ] 2.1 Add `<canvas layoutsubtree>` to `index.html` and implement WebGL2 context initialization and feature detection for `layoutsubtree` and `texElementImage2D` in `src/gl/`, verifying that browsers without the API show the `GL-04` diagnostic message without throwing (`GL-01`, `GL-04`, `ARCH-08`, `ARCH-12`)
- [ ] 2.2 Implement `ResizeObserver`-driven, DPR-aware (capped at `2`) canvas backing store sizing and non-blocking scroll configuration (`GL-02`, `GL-03`, `ARCH-14`), and verify scrolling and snapping work identically to Phase 1

## 3. Plane Geometry, Camera Alignment & Event-Driven Texture Upload

- [ ] 3.1 Implement the `64x64` tessellated XY-plane geometry with binding along the Y-axis at `x = 0` (`x in [0, W]`, matching `SCF-07` aspect ratio) and camera/projection matrix in `src/gl/`, verifying the flat snapped page (`progress = 0`) overlays the DOM page within `+-1 px` (`GL-10`..`GL-13`)
- [ ] 3.2 Implement `gl.texElementImage2D(...)` texture upload inside the canvas `paint` event handler (with proper orientation and premultiplied-alpha handling and idle-by-default rAF drawing) and wire `src/shaders/page.frag.glsl`, verifying live DevTools DOM edits and `:hover` changes update the WebGL render within one frame (`GL-05`..`GL-09`, `ARCH-07`, `ARCH-09`, `ARCH-13`)

## 4. Phase 3 Acceptance Verification

- [ ] 4.1 Verify in Chrome Performance panel that texture uploads occur only on `paint` events (never per-frame while idle), `npm run build` passes with zero TS errors, and `src/` still contains zero navigation listeners or JS DOM movement
