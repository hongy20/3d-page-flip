# Design

## Context

See [proposal.md](proposal.md). Currently `.book` holds 18 `.page` flex items directly, each snapping individually, and `src/shaders/page.frag.glsl` renders `BACK_PAPER_COLOR` on `!gl_FrontFacing`.

## Goals / Non-Goals

**Goals:**

- Support physical magazine spreads (`[blank, 1]`, `[2, 3]`, ..., `[16, 17]`, `[18, blank]`) automatically in `@media (orientation: landscape)` using the exact same single DOM and zero-JS CSS scroll-snap model.
- Transition each 2-page `.spread` as a single unit in landscape `stack` mode via pure CSS (`OQ-SPREAD-1` resolved).
- Preserve existing 18-page portrait single-page behavior untouched.
- Render paired reverse-side page textures on curled leaves in landscape `curl` mode.

**Non-Goals:**

- Adding a separate manual spread toggle control.
- Modifying single-page portrait blank-paper back-face behavior.

## Decisions

1. **Pure-CSS `.spread` grouping with `display: contents` fallback**:
   - Group pages into `<section class="spread">` containers: `[spacer, p1]`, `[p2, p3]`, ..., `[p16, p17]`, `[p18, spacer]`.
   - Under `@media (orientation: portrait)`: `.spread { display: contents; }` and `.spread__spacer { display: none; }`, keeping `.page` as the direct flex snap item and `--progress` timeline owner.
   - Under `@media (orientation: landscape)`: `.spread` becomes the `flex: 0 0 100%` horizontal snap unit owning `--progress` via `view(inline)`, placing its two half-page slots side-by-side (`aspect-ratio` constrained so two pages fit cleanly within padded viewport height and width).
   - In `@media (orientation: landscape)` `stack` mode, `stack-pin` and `stack-reveal` apply to each `.spread` container so the full 2-page spread slides/rises as one unit (`OQ-SPREAD-1` resolved).
2. **Fragment shader back-face texture (`u_backPageTex`)**:
   - Add `uniform sampler2D u_backPageTex;` and `uniform int u_hasBackTex;` to `src/shaders/page.frag.glsl`.
   - When `!gl_FrontFacing && u_hasBackTex == 1`, sample `texture(u_backPageTex, vec2(1.0 - v_uv.x, v_uv.y))` so the horizontal mirror matches a physical leaf flipped around the `x = 0` central spine (`u_rho = pi` flips X from `+x` to `-x`, making text read left-to-right).
   - When `u_hasBackTex == 0` (portrait mode), keep `BACK_PAPER_COLOR`.
3. **Spread curl scene composition in `renderer.ts`**:
   - Detect orientation via read-only `window.matchMedia('(orientation: landscape)')`.
   - When turning between outgoing spread `k` (`p in (0, 1)`) and incoming spread `k + 1` (`p in (-1, 0)`):
     - Draw stationary left half of spread `k` (if non-spacer, flat on left half, `zBias < 0`).
     - Draw stationary right half of spread `k + 1` (if non-spacer, flat on right half, `zBias < 0`).
     - Draw turning leaf anchored at spine `x = 0` with front = right half of spread `k` and back = left half of spread `k + 1`, at full opacity `1.0` across `p in [0, 1]`.
   - Sync hit-test geometry (`geometrySync.syncPage`) for both visible pages of the settled spread so interactive badges/links work on both left and right halves.

## Risks / Trade-offs

- **`display: contents` interaction with `view(inline)` / HTML-in-Canvas**: Verify in Chrome 158+ early during implementation; if `display: contents` causes any `view(inline)` quirk, move `animation-timeline: view(inline)` explicitly inside `@media (orientation: portrait) { .page { ... } }` and `@media (orientation: landscape) { .spread { ... } }` (no shared selector ambiguity).
- **Double-sided Z-fighting with stationary pages**: Offset flat left/right under-pages with negative `u_zBias` (`-0.002`) so the curled leaf cleanly clears them.
- **Dynamic books if `book-library` lands first**: Apply `.spread` grouping dynamically in `src/main.ts` for any `N`-page book (`[spacer, 1]`, `[2, 3]`, ..., ending with `[N, spacer]` when `N` is even or `[N-1, N]` when `N` is odd).

## Open Questions

None (`OQ-SPREAD-1` resolved: landscape `stack` mode transitions the full 2-page spread as one unit).
