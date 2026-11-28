# Design

## Context

See [proposal.md](proposal.md) for motivation. On real Android phones running Chrome 157+, `.book` handles horizontal pagination via native compositor scrolling, so CSS `--progress` updates smoothly every display frame. By contrast, transverse finger movement during a turn relies on passive pointer/touch events: once native scrolling starts, Chromium fires `pointercancel` and throttles passive `touchmove` delivery to ~200 ms (`kAsyncTouchMoveInterval`). Currently, `src/gl/renderer.ts` snaps `activeConicContribution` and `activeCornerBend` directly to each sample, `src/style.css` only sets `overscroll-behavior-y: none` in portrait vertical layout, `solveBaseConeParams()` is invoked three times per frame for the same `p`, flat pages run the full `64×64` finite-difference vertex shader, and `renderFrame()` performs repeated `getBoundingClientRect()` / `getComputedStyle()` calls every frame.

## Goals / Non-Goals

**Goals:**

- Eliminate discrete visual stepping when `(conicContribution, cornerBend)` updates arrive at throttled mobile `touchmove` rates.
- Suppress vertical overscroll and pull-to-refresh interference during downward finger motion in horizontal layout.
- Cut redundant per-frame CPU math, GPU vertex shader work on flat pages, and synchronous layout reads on mobile devices.
- Preserve 100% native CSS `scroll-snap-type` navigation, passive read-only listeners, and all `AGENTS.md` constraints.

**Non-Goals:**

- Disabling native scrolling (`touch-action: none` or `preventDefault()`) or implementing JS scroll/drag physics.
- Adding a 2D vertical `scroll-timeline` scroller in this change (noted as a future experiment only if ~100–200 ms touch delivery latency itself remains objectionable after smoothing, subject to Android scroll-rail-lock verification).
- Changing the Hong, Card & Chen cone or Project Austin cylinder deformation equations.

## Decisions

1. **Frame-rate-independent exponential smoothing on `(conicContribution, cornerBend)`**:
   - Add a pure helper `smoothCurlControl(current, target, dtMs, tauMs)` in `src/gl/coneMath.ts` computing `alpha = 1 - Math.exp(-clamp(dtMs, 0, 100) / tauMs)` (default `CURL_SMOOTHING_TAU_MS = 55`), snapping directly to `target` when `Math.abs(target - current) <= eps` so the render loop converges and idles cleanly.
   - Maintain separate `targetConicContribution`/`targetCornerBend` and smoothed `activeConicContribution`/`activeCornerBend` in `src/gl/renderer.ts`:
     - When a new turn starts (`activeTurnPage === -1`), snap both target and active immediately to the initial grab corner so turns start crisply with zero initial lag.
     - During drag and after `endDrag()` while a turn remains active, continue running rAF frames and easing active toward target until both controls converge within `CONIC_CHANGE_EPS`.
   - **Alternative considered**: Linear fixed-step interpolation per frame (`lerp` with constant factor). Rejected because frame rates vary on mobile (60/90/120 Hz) and exponential `dt`-normalized damping preserves consistent feel across refresh rates.

2. **Global `overscroll-behavior-y: none`**:
   - Set `overscroll-behavior: none` (both `x` and `y`) on `html, body` and `.book` in `src/style.css` rather than scoping `overscroll-behavior-y: none` solely to `@media (orientation: portrait)` vertical layout.
   - **Alternative considered**: Keeping `overscroll-behavior-y` scoped to vertical layout. Rejected because horizontal curl drags routinely involve downward finger motion that competes with Android pull-to-refresh / overscroll glow.

3. **Single-pass base cone solve per frame**:
   - Export/refactor a reusable base-cone solve helper in `src/gl/coneMath.ts` (e.g., `solveBaseConeParams` and parameterized `solveVerticalCurlControl` / `coneParamsFromBase` / `cylKappaFromBase`, or a combined frame helper) so `src/gl/renderer.ts` solves `(theta, Ay, rho)` once per frame for `progressScratch[turningIdx]` and reuses it across vertical control solving, `cornerBend` application, and `cylKappa`.
   - **Alternative considered**: Memoizing `solveBaseConeParams` in a module-level single-entry cache. Rejected in favor of explicit pure parameter passing so `coneMath.ts` remains stateless, deterministic, and trivial to test against existing functions.

4. **Flat-page fast path (`2`-triangle quad / shader bypass)**:
   - Add a lightweight 2-triangle flat quad mesh in `src/gl/planeGeometry.ts` (matching `[0, width] x [0, height]` and `[0, 1]^2` UVs) alongside a flat-bypass uniform (e.g., `u_isFlat`) in `src/shaders/cone.vert.glsl` so flat draws (`baseIdx`, settled resting pages, `slide`, `stack`) emit `pos = vec3(a_position, u_zBias)` and `v_normal = vec3(0.0, 0.0, 1.0)` over 2 triangles instead of evaluating 5× `curlDeform()` over 4,225 vertices.
   - **Alternative considered**: Keeping the `64×64` mesh for flat draws with only a shader `u_isFlat` branch, or creating a separate shader program. Using a 2-triangle quad + `u_isFlat` uniform avoids shader program switching while cutting vertex count from 4,225 to 4 (2 triangles) on every flat draw.

5. **Cached layout rects & page dimensions**:
   - Cache `canvasRect`, `sampleRect` (for curl centered bounds), and per-page CSS dimensions in `src/gl/renderer.ts`, refreshing them on initialization, `ResizeObserver` callbacks, and orientation changes rather than calling `getBoundingClientRect()` and `getComputedStyle()` every active frame in `curl` mode.
   - Keep `flatVisiblePages` bounds checks accurate in `slide`/`stack` modes while avoiding redundant per-frame `getComputedStyle(content)` reads when page sizes have not changed.

## Risks / Trade-offs

- **Input delivery latency on Android** → Exponential smoothing removes ~5 Hz visual stepping and makes transitions fluid, though it cannot reduce Chromium's ~100–200 ms `touchmove` delivery cadence once native scroll takes over. Tuning `CURL_SMOOTHING_TAU_MS` balances responsiveness vs. smoothness across 200 ms input gaps.
- **Cached rect staleness during dynamic browser chrome / viewport changes** → Mitigated by refreshing cached rects in `ResizeObserver` (which observes `canvas` sized to `100dvh`) and `portraitMediaQuery` change events, plus refreshing immediately when `resizeDirty` is set.
- **2D `scroll-timeline` deferred** → Keeping single-axis native scroll avoids Android Chrome horizontal scroll-rail lock issues while remaining compatible with a future separate experiment if needed.

## Open Questions

None blocking. `CURL_SMOOTHING_TAU_MS` (default `55 ms`) may be tuned during real-device Android Chrome verification in `tasks.md`.
