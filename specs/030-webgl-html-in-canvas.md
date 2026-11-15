# 030: Phase 3, WebGL Overlay & HTML-in-Canvas

Status: Draft

## Goal

Render the live HTML page content as a GPU texture on a densely tessellated plane in a
WebGL canvas that sits over the scroller, while native scrolling still works.
At the end of this phase, the page appears **flat** in WebGL; deformation comes in Phase 4.

## Requirements

### Canvas & context
| ID | Requirement |
|----|-------------|
| GL-01 | A `<canvas layoutsubtree>` MUST be present, fixed over the viewport, with a WebGL2 context. |
| GL-02 | The canvas MUST NOT block native scrolling: input must still reach the scroller (via `pointer-events`, stacking, or by putting the scroller inside the canvas subtree; see **OQ-03**). Snapping from Phase 1 must behave the same. |
| GL-03 | Canvas size MUST follow ARCH-14 (DPR-aware, capped, `ResizeObserver`-driven). |
| GL-04 | Before rendering, the app MUST feature-detect `layoutsubtree` and `texElementImage2D`, and show a clear in-page message (e.g. "Chrome 157+ with … required") if they're missing. No fallback renderer. |

### HTML-in-Canvas texture
| ID | Requirement |
|----|-------------|
| GL-05 | Page content elements to be textured MUST be direct children of the `layoutsubtree` canvas, as the API requires. |
| GL-06 | Textures MUST be uploaded with `gl.texElementImage2D(...)`. No DOM-to-image path (ARCH-09). |
| GL-07 | Re-uploads MUST happen inside the canvas `paint` event handler, and only for elements that changed. No per-frame uploads. |
| GL-08 | At minimum, the current page and the page being revealed MUST have textures. Texture management strategy (one per page vs a small pool) is pending **OQ-05**. |
| GL-09 | The texture MUST be sampled with correct orientation (no vertical flip bugs) and premultiplied-alpha handling consistent with the canvas context settings. |

### Geometry
| ID | Requirement |
|----|-------------|
| GL-10 | The page MUST be a plane in the XY-plane with the **binding along the Y-axis at x = 0** and the page extending to +x, matching the cone model's coordinate system (see 040). |
| GL-11 | The plane MUST be tessellated densely enough for smooth curvature (default 64×64 segments, configurable as a constant; must look smooth at 2× DPR). |
| GL-12 | Plane dimensions MUST match the page's aspect ratio from SCF-07, in a unit system documented in code (e.g. page width = 1.0). |
| GL-13 | The camera/projection MUST make the flat, snapped page (`progress = 0`) overlay its DOM position pixel-for-pixel (±1 px) so the WebGL page and the layout agree. |

## Design notes

- **Renderer choice (OQ-01).** `texElementImage2D` is a raw WebGL method. Three.js doesn't
  expose it, so using Three.js means calling it on Three's internal GL context and
  marking the texture as already uploaded. Raw WebGL2 avoids that glue for what is one
  textured, deformed mesh. This spec is written renderer-agnostic until OQ-01 is decided.
- **API surface to verify first.** HTML-in-Canvas is experimental. The first task is a
  throwaway spike to confirm, in the actual Chrome 157 build, the attribute name, the
  `texElementImage2D` signature, `paint` event semantics, and any `requestPaint()` method
  and flag requirement. Record the findings back into this spec before implementing.
- **DOM double-rendering.** The canvas subtree children are laid out and hit-testable but
  not painted directly. How this interacts with the visible DOM pages from Phase 1
  (duplicate content? scroller inside the canvas?) is the main structural decision, **OQ-03**.

## Acceptance criteria

1. In Chrome 157+, the WebGL canvas shows the current page flat, matching the DOM layout position (GL-13).
2. Scrolling and snapping still work exactly as in Phase 1 (GL-02).
3. Editing page text in DevTools, or hovering an interactive element, updates the WebGL
   texture within one frame, and the DevTools performance panel shows texture uploads only on `paint`.
4. In a browser without the API, the GL-04 message is shown and nothing throws.
5. Still no navigation listeners or JS DOM movement.

## Out of scope

Deformation, scroll→uniform wiring, lighting.

## Tasks

- [ ] Spike: verify the HTML-in-Canvas API surface in Chrome 157; update this spec.
- [ ] Resolve OQ-01, OQ-03, OQ-05.
- [ ] Add canvas, context creation, and feature detection.
- [ ] Add DPR-aware resize handling.
- [ ] Generate the dense plane geometry (binding at x = 0).
- [ ] Upload textures via `texElementImage2D` in the `paint` handler.
- [ ] Add the projection/camera for a pixel-aligned flat page.
- [ ] Verify the acceptance criteria; commit.
