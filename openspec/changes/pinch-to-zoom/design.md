# Design

## Context

See [proposal.md](proposal.md). Currently `reader.html` renders all pages at fixed `1x` scale inside a CSS scroll-snap `.book` container overlaid by `<canvas content="drawable">` with WebGL2 hit-test sync via `canvas.updateElementGeometry`.

## Goals / Non-Goals

**Goals:**

- Smooth 2-finger pinch (Pointer Events), `Ctrl+wheel`, and double-tap / double-click zoom in `[1, 4]` with focal-point anchoring.
- Lock page turning while `scale > 1`, snap to `scale = 1` when released at `<= 1.08`, and clamp pan offsets strictly to visible page bounds.
- Suppress native browser pinch/Ctrl-wheel zoom on `reader.html` without disabling zoom on `index.html` or `settings.html`.

**Non-Goals:**

- Replacing native CSS `scroll-snap` for page turning at `scale === 1`.
- Pinch-zooming on `index.html` or `settings.html`.

## Decisions

1. **Pure unit-tested zoom/pan state machine (`src/gl/zoomPan.ts`)**:
   - Store `{ scale, panX, panY }` with `MIN_SCALE = 1`, `MAX_SCALE = 4`, `SNAP_TO_ONE_THRESHOLD = 1.08`.
   - Compute focal-point zoom adjustments so the point under the pinch midpoint or cursor remains stationary during zoom.
   - Clamp `(panX, panY)` to `maxPanX = Math.max(0, (contentWidth * scale - viewportWidth) * 0.5)` and `maxPanY = Math.max(0, (contentHeight * scale - viewportHeight) * 0.5)` (adding a tiny safe edge margin only if needed so centered pages at low zoom never drift offscreen).
2. **Scroll-lock & browser-zoom suppression on `reader.html`**:
   - When `scale > 1` or 2 pointers are active, apply `.book--zoomed` (`overflow: hidden; touch-action: none;`) to lock native page-turn scrolling cleanly.
   - Register a non-passive `wheel` listener on `.stage`/window calling `event.preventDefault()` **only** when `event.ctrlKey` is true (trackpad pinch), and add `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` solely on `reader.html`.
3. **WebGL camera/MVP & `geometrySync` integration**:
   - Compose the zoom/pan scale and translation into the WebGL projection/view matrix in `src/gl/camera.ts` and apply the matching affine scale+translate to the DOM rect passed to `geometrySync.syncPage(...)` so SVG `<a>` links and `.page__badge` remain accurately clickable while zoomed.
   - Note: update `AGENTS.md` to document this scoped zoom/pan exception alongside the existing `pointerdown`/`pointermove` curl rule.

## Risks / Trade-offs

- **Texture softness at 4x zoom** → Monitor `getElementImageDefaultSize` dimensions and `devicePixelRatio` texture sizing; document or adjust texture upload scale if vector SVG content blurs noticeably at `4x`.
- **Two-finger pinch accidentally starting a page swipe** → Engage `.book--zoomed` immediately on the second `pointerdown` (`activePointers.size >= 2`) so native scroll cannot advance while pinching.
