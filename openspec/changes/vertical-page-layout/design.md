# Design

## Context

See [proposal.md](proposal.md). Currently `.book` in `src/style.css` only supports horizontal `view(inline)` scroll-snap pagination and vertical-spine (`x = 0`) page curl.

## Goals / Non-Goals

**Goals:**

- Enable native vertical scroll-snap (`scroll-snap-type: y mandatory`) and `view(block)` `--progress` in portrait single-page mode.
- Support `slide`, `stack`, and horizontal top-hinge `curl` in vertical layout.
- Keep landscape viewports strictly horizontal so double-page spread layout remains unaffected.

**Non-Goals:**

- Implementing the settings UI or `localStorage` persistence (handled in `reader-settings`).
- Adding JS scroll physics.

## Decisions

1. **Portrait-scoped CSS attribute (`[data-layout="vertical"]`)**:
   - Gate vertical layout rules inside `@media (orientation: portrait)` on `body[data-layout="vertical"]` (or `.book`), switching `.book` to `flex-direction: column`, `overflow-y: auto`, `overflow-x: hidden`, `scroll-snap-type: y mandatory`, `overscroll-behavior-y: none`, and switching `.page` timeline from `view(inline)` / `--page-view inline` to `view(block)` / `--page-view block`.
   - Define vertical `stack-pin-y` keyframes translating along `Y` (`translateY(-100dvh)`) and `Z` so `stack` mode works identically along the vertical axis.
2. **Coordinate-mapped top-hinge curl (`y = pageHeight`)**:
   - Rather than duplicating the cone and cylinder equations, map a vertex `(px, py)` into the top-hinge local frame where distance from the top edge (`pageHeight - py`) plays the role of `x` from the binding edge and `px - pageWidth * 0.5` (or left/right edge offset) plays the role of `y`, apply the exact isometric cone/cylinder + `R(-rho)` rotation around the horizontal X-axis hinge, and map back to page space.
   - Map horizontal pointer coordinate (`clientX`) to `conicContribution` in `[-1, 1]` when vertical `curl` is active (left edge = `-1`, center cylinder = `0`, right edge = `+1`).
3. **Renderer axis detection**:
   - `src/gl/renderer.ts` detects active vertical layout via computed layout or `data-layout="vertical"` in portrait (`matchMedia("(orientation: portrait)")`), passing a `u_vertical` uniform (or dedicated vertical curl pass) and adjusting `pointerXToConicContribution` accordingly.

## Risks / Trade-offs

- **Landscape resize while vertical preference is selected** → `@media (orientation: portrait)` gating guarantees automatic fallback to horizontal layout in landscape without JS DOM rewriting.
- **Mesh origin & centering in top-hinge curl** → Keep `u_pageWidth` and `u_pageHeight` uniforms explicit in `cone.vert.glsl` so any page aspect ratio curls cleanly around `y = u_pageHeight` without clipping.
