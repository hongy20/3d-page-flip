# Design: Phase 3, WebGL Overlay & HTML-in-Canvas

## Context

See `proposal.md` for motivation. Phase 3 introduces the GPU rendering layer: a `<canvas layoutsubtree>` overlay that captures live DOM children into WebGL2 textures via `texElementImage2D` on `paint` events and draws them onto a 64x64 tessellated plane aligned with the DOM layout. At the end of Phase 3, the rendered page is flat; 3D cone curl deformation is added in Phase 4 (`phase-4-cone-vertex-shader`).

## Goals / Non-Goals

**Goals:**
- Verify the exact experimental HTML-in-Canvas API surface in Chrome 157+ via an initial spike.
- Upload live HTML/SVG pages into WebGL2 textures strictly on `paint` events.
- Construct the `64x64` page mesh in the Hong, Card & Chen coordinate system (`x in [0, W]` with binding at `x = 0`) and align its flat projection within `+-1 px` of the DOM layout.
- Preserve 100% of native CSS scrolling and accessibility.

**Non-Goals:**
- Cone vertex deformation or CSS `--progress` uniform updates (deferred to Phase 4).
- Polyfills or fallback renderers for browsers without HTML-in-Canvas.

## Decisions

1. **Initial Chrome 157+ API Surface Spike**
   - *Decision*: Before writing production `src/gl/` modules, run a small verification spike in Chrome 157+ to confirm the exact `layoutsubtree` attribute name, `gl.texElementImage2D` signature, `paint` event payload/invalidation semantics, `requestPaint()` requirements, and required `chrome://flags`.
   - *Rationale*: HTML-in-Canvas (WICG proposal) is experimental in Chrome 157+. Confirming the exact call signature first prevents speculative abstractions.

2. **Renderer Choice (`OQ-01`)**
   - *Recommendation*: Raw WebGL2 (pending human confirmation on `OQ-01`).
   - *Rationale*: `texElementImage2D` is a raw WebGL2 context method not wrapped by Three.js. Since the scene consists of a single textured, subdivided quad with custom vertex/fragment shaders, raw WebGL2 requires zero runtime dependencies and zero internal texture-state workarounds.

3. **Coordinate System and Camera Alignment**
   - *Decision*: Generate the `64x64` plane with vertex `x in [0, W]` (binding along the Y-axis at `x = 0`) and `y in [0, H]` matching the `book-scroller` page aspect ratio. Configure the perspective/view transform so that at `z = 0` (flat page), `[0, W] x [0, H]` maps directly to the DOM `.page__content` client rect (`+-1 px`).
   - *Rationale*: Placing the binding on the Y-axis at `x = 0` is required by the Hong, Card & Chen cone equations in Phase 4 (`cone-page-curl`), while still allowing a 3D perspective projection when vertices lift into `+z` during a curl.

4. **Idle-By-Default Render Loop**
   - *Decision*: Schedule a `requestAnimationFrame` draw only when a `paint` event uploads a texture (or, in Phase 4, when CSS `--progress` changes).
   - *Rationale*: Eliminates idle GPU usage when the reader is stationary on a page.

## Risks / Trade-offs

- **[Risk] DOM structure interaction between `.book` scroller and `<canvas layoutsubtree>` (`OQ-03`)** → Mitigation: Textured elements must be direct children of `<canvas layoutsubtree>`, and canvas children are laid out/hit-testable but not painted directly by the browser. The spike will validate whether the scroller lives inside the canvas subtree (`OQ-03a`) or uses a synchronized structure (`OQ-03b/c`).
- **[Risk] Vertical flip or premultiplied alpha mismatch in WebGL texture** → Mitigation: Explicitly configure `gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, ...)` and `UNPACK_PREMULTIPLY_ALPHA_WEBGL` to match the WebGL2 context's `premultipliedAlpha` attribute.

## Open Questions

Must be resolved with the human before completing Phase 3 implementation (per `AGENTS.md`):

- **`OQ-01` (Raw WebGL2 or Three.js?)**: `texElementImage2D` is a raw-GL method that Three.js does not wrap. Raw WebGL2 means zero dependencies and no glue; Three.js adds ~150 KB and needs texture upload workarounds. Recommendation: **Raw WebGL2**. Status: **Open**.
- **`OQ-03` (DOM structure: where does the scroller live relative to `<canvas layoutsubtree>`?)**: Options:
  - `(a)` Scroller with pages *inside* the canvas subtree: one DOM, native scroll, canvas paints everything (needs a spike to confirm scrolling works inside `layoutsubtree`);
  - `(b)` A visible scroller plus a separate canvas holding duplicate page content, with the overlay `pointer-events: none`;
  - `(c)` A transparent "ghost" scroller for input only, with content only in the canvas.
  - Status: **Open**.
- **`OQ-05` (Texture management: one texture per page, or a pool of 2-3 for current/next/prev?)**: A pool scales to large books; per-page is simpler for a small PoC. Status: **Open**.
