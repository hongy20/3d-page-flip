# Design: Phase 3, WebGL Overlay & HTML-in-Canvas

## Context

See `proposal.md` for motivation. Phase 3 introduces the GPU rendering layer: a `<canvas content="drawable">` overlay wrapping `.book` as a single DOM (`OQ-03` Option a) that captures live `drawable` page elements into per-page WebGL2 textures via `texElementSubImage2D` on `paint` events and draws them onto a `64x64` tessellated plane aligned with the DOM layout. At the end of Phase 3, the rendered page is flat; 3D cone curl deformation is added in Phase 4 (`phase-4-cone-vertex-shader`).

## Goals / Non-Goals

**Goals:**
- Record and apply the experimental HTML-in-Canvas API surface verified in Chrome 158.0.8127.89 (`content="drawable"`, `drawable`, `getElementImageDefaultSize`, `texElementSubImage2D`, `updateElementGeometry`, `CanvasPaintEvent`, `requestPaint`).
- Upload live HTML/SVG pages into per-page WebGL2 textures strictly on `paint` events (initial paint, resize, or `event.changedElements`).
- Construct the `64x64` page mesh in the Hong, Card & Chen coordinate system (`x in [0, W]` with binding at `x = 0`) and align its flat projection within `+-1 px` of the DOM layout.
- Preserve 100% of native CSS scrolling, `view(inline)` `--progress`, interactive hover/clicks, and accessibility via `updateElementGeometry`.

**Non-Goals:**
- Cone vertex deformation or CSS `--progress` uniform updates (deferred to Phase 4).
- Polyfills or fallback renderers for browsers without HTML-in-Canvas.

## Decisions

1. **Chrome 158+ API Surface (Verified via Spike on Chrome 158.0.8127.89, macOS, DPR 2)**
   - *Required flag*: `chrome://flags/#canvas-draw-element`.
   - *Canvas opt-in*: `<canvas content="drawable">` (`canvas.content === "drawable"`). Note: the older trial attribute `layoutsubtree` is not supported in Chrome 158 (leaves children unlaid-out at `0x0` and throws `InvalidStateError`).
   - *Descendant opt-in*: Every element passed to `getElementImageDefaultSize`, `texElementSubImage2D`, or `updateElementGeometry` must carry the `drawable` attribute. Arbitrary descendants work when marked `drawable` (e.g., `<article class="page__content" drawable>` inside `.page` inside `.book`); omitting `drawable` throws `InvalidStateError`.
   - *Texture upload pipeline*:
     1. Query `const size = canvas.getElementImageDefaultSize(el)` (returns DPR-scaled texture pixels, e.g., `940x1328.875` for a `470x664.4375` CSS box at DPR 2; round up with `Math.ceil(size.width)` and `Math.ceil(size.height)` so `texImage2D` never under-allocates fractional pixels).
     2. Pre-allocate storage with `gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)` (whenever missing or size changed).
     3. Upload pixels with `gl.texElementSubImage2D(gl.TEXTURE_2D, 0, 0, 0, el)`.
   - *Orientation & alpha*: Set `gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)` and `gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1)` with `{ alpha: true, premultipliedAlpha: true }` on the WebGL2 context (verified crisp and upright at DPR 2).
   - *Geometry & hit-test routing*: Call `canvas.updateElementGeometry(el, { canvasTransform })` where `canvasTransform` is a `DOMMatrix` in **canvas CSS pixels** relative to `<canvas>` (`new DOMMatrix()` for `.book`, `new DOMMatrix().translate(tx, ty).scale(sx, sy)` for visible `.page__content`, and an offscreen transform for non-visible pages). CSS transition transforms and opacity (such as `stack` mode's `stack-pin` and `stack-reveal`) animate a non-`drawable` `.page__frame` wrapper around `<article class="page__content" drawable>` so `texElementSubImage2D` always captures opaque, untransformed page textures and `frame.getBoundingClientRect()` drives WebGL projection and hit-test geometry without feedback. Verified that native horizontal `scroll-snap-type`, CSS `view(inline)` `--progress`, `:hover`, and button clicks all work inside `<canvas content="drawable">` once geometry is synced.
   - *`paint` event semantics*: `CanvasPaintEvent` exposes `event.changedElements` listing only changed `drawable` elements; `canvas.requestPaint()` triggers a paint frame; scrolling `.book` emits `.book` (not `.page__content`) in `changedElements`, avoiding redundant page texture uploads; zero idle `paint` events once interaction stops.
   - *Feature detection*: Check `'content' in HTMLCanvasElement.prototype`, `canvas.content === 'drawable'`, `typeof WebGL2RenderingContext.prototype.texElementSubImage2D === 'function'`, `typeof HTMLCanvasElement.prototype.getElementImageDefaultSize === 'function'`, and `typeof HTMLCanvasElement.prototype.updateElementGeometry === 'function'`.

2. **Renderer Choice (`OQ-01` — Resolved: Raw WebGL2)**
   - *Decision*: Raw WebGL2.
   - *Rationale*: `texElementSubImage2D` is a raw WebGL2 context method not wrapped by Three.js. Since the scene consists of a textured, subdivided quad with custom vertex/fragment shaders, raw WebGL2 requires zero runtime dependencies and zero internal texture-state workarounds.

3. **DOM Structure (`OQ-03` — Resolved: Option a, Single DOM Inside `<canvas content="drawable">`)**
   - *Decision*: Wrap `<main class="book" drawable>` directly inside `<canvas content="drawable">` and mark each `<article class="page__content" drawable>`. Sync geometry for `.book` (scroll routing) and visible `.page__content` (interactive badge clicks/hover) via `canvas.updateElementGeometry(el, { canvasTransform })`.
   - *Rationale*: Verified in the Chrome 158 spike: single DOM preserves native `scroll-snap-type`, `view(inline)` `--progress`, real `:hover`/clicks, and accessibility without duplicating page content or fighting underlying painted DOM behind a curling 3D page.

4. **Texture Management (`OQ-05` — Resolved: One Texture per Page)**
   - *Decision*: Maintain one WebGL2 texture per `.page__content` element (`Map<HTMLElement, PageTexture>`), lazily allocated to `canvas.getElementImageDefaultSize(el)` and re-uploaded only on initial paint, resize (when default size changes), or when that `.page__content` appears in `event.changedElements`.
   - *Rationale*: Simple and predictable for the 18-page PoC, with zero texture thrashing during scrolls.

5. **Coordinate System and Camera Alignment**
   - *Decision*: Generate the `64x64` plane with vertex `x in [0, W]` (binding along the Y-axis at `x = 0`) and `y in [0, H]` matching the `book-scroller` `.page__content` aspect ratio. Configure the perspective/view transform so that at `z = 0` (flat page), `[0, W] x [0, H]` maps directly to the DOM `.page__content` client rect (`+-1 px`).
   - *Rationale*: Placing the binding on the Y-axis at `x = 0` is required by the Hong, Card & Chen cone equations in Phase 4 (`cone-page-curl`), while still allowing a 3D perspective projection when vertices lift into `+z` during a curl.

6. **Idle-By-Default Render Loop**
   - *Decision*: Schedule a `requestAnimationFrame` draw only when a `paint` event fires, on resize, or (in Phase 4) when CSS `--progress` changes.
   - *Rationale*: Eliminates idle GPU usage when the reader is stationary on a page.

## Risks / Trade-offs

- **[Risk] Hit-test / scroll routing desync or rect feedback if element geometry drifts** → Mitigation: `OQ-03(a)` passed once `updateElementGeometry(el, { canvasTransform })` is supplied in canvas CSS pixel units relative to `<canvas>` and true page layout rects are read from the non-`drawable` `.page__frame` wrapper (avoiding `getBoundingClientRect()` feedback and `texElementSubImage2D` opacity/transform artifacts); re-sync `.book` and active `.page__content` geometry on `ResizeObserver` and paint/render frames so clicks, `:hover`, and scroll gestures always stay aligned.
- **[Risk] Vertical flip or premultiplied alpha mismatch in WebGL texture** → Mitigation: Verified in the Chrome 158 spike with `gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)` and `gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1)` matching `{ alpha: true, premultipliedAlpha: true }` on the WebGL2 context.

## Open Questions

All Phase 3 open questions are resolved:

- **`OQ-01` (Raw WebGL2 or Three.js?)**: **Resolved — Raw WebGL2**. Zero dependencies and calls `texElementSubImage2D` directly.
- **`OQ-03` (DOM structure relative to `<canvas content="drawable">`?)**: **Resolved — Option (a)**, `.book` scroller + pages live inside `<canvas content="drawable">` (single DOM, `drawable` on `.book` and `.page__content`, geometry synced via `updateElementGeometry`), validated in the Chrome 158 spike.
- **`OQ-05` (Texture management?)**: **Resolved — One WebGL texture per page** (`Map<HTMLElement, PageTexture>`) for this PoC.
