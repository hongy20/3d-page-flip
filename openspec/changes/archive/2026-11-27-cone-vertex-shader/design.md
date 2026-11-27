# Design: Cone Vertex Shader & Uniform Wiring

## Context

See `proposal.md` for motivation. This change completes the WebBook 3D pipeline by replacing `webgl-html-in-canvas`'s flat vertex transformation with the isometric cone deformation and concurrent binding-axis Y-rotation model of **Hong, Card & Chen (PARC, SIGGRAPH 2004 Sketches, `sketches_0135`), _"Deforming Pages of 3D Electronic Books"_** in `src/shaders/cone.vert.glsl`, adding two-sided blank-paper rendering and configurable Lambert shading in `src/shaders/page.frag.glsl`, and wiring CSS `--progress` (read via CSSOM) to shader uniforms via a pure 3-stage `coneParams(p)` trajectory.

## Goals / Non-Goals

**Goals:**

- Implement the exact Hong, Card & Chen cone deformation + binding-axis Y-rotation equations in both a pure TypeScript CPU reference function (for unit testing) and GLSL ES 3.00 (`highp float`, cancellation-safe `R + A_y`).
- Implement the 3-stage empirical `coneParams(p)` trajectory in an isolated, unit-tested TypeScript module guaranteeing domain invariants, flat identity at `p = 0`, and smooth uncurling as `p -> 1`.
- Render both front (live HTML texture) and back (warm blank paper) faces with finite-difference deformed normals and Lambert diffuse shading driven by a code-configurable `u_lightPos` uniform.
- Support `Curl` as the default mode alongside flat `Slide` and `Stack` modes with zero JS control listeners, driven strictly by reading CSS `--progress` via CSSOM on change in the `requestAnimationFrame` loop at 60 fps.

**Non-Goals:**

- Cylindrical or non-cone curl approximations.
- Two-page spreads or next-page reverse-side textures.
- Light-position UI controls or Browser Motion API listeners (deferred to `motion-driven-lighting`).
- Any JS scroll mutation, navigation/control input listeners, or animation libraries.

## Decisions

1. **Coordinate System & Fixed Two-Stage Hong, Card & Chen Equations**
   - _Coordinate System_:
     - Flat page lies in the XY-plane (`z = 0`), with the **Y-axis as the binding** (`x = 0`) and page extent `x in [0, W]`, `y in [0, H]`.
     - Imaginary cone lies on the XY-plane with its side touching the Y-axis, apex `A = (0, A_y, 0)`, and half-angle `theta` (`u_theta`).
   - _Stage 1 — Cone Deformation (Eqs. 1–3)_: For flat vertex `P = (P_x, P_y, 0)` with `A_y < 0 <= P_y`:
     ```text
     R     = sqrt(P_x^2 + (P_y - A_y)^2)
     alpha = asin(clamp(P_x / R, -1.0, 1.0))
     beta  = alpha / sin(theta)
     r     = R * sin(theta)
     T_x   = r * sin(beta)
     T_y   = P_y + (P_x^2) / (R + (P_y - A_y)) - r * (1.0 - cos(beta)) * sin(theta)
     T_z   = r * (1.0 - cos(beta)) * cos(theta)
     ```
     _Cancellation-safe `R + A_y`_: Since `R^2 - (P_y - A_y)^2 = P_x^2` and `P_y - A_y > 0`, `R - (P_y - A_y) = P_x^2 / (R + (P_y - A_y))`, so `R + A_y = P_y + P_x^2 / (R + (P_y - A_y))` is algebraically exact while eliminating 32-bit `highp float` catastrophic cancellation when `A_y` becomes strongly negative in Stage 3.
   - _Stage 2 — Binding-Axis Y-Rotation (`R_y(-u_rho)` for `u_rho in [0, pi]`)_:
     ```text
     V_x = T_x * cos(rho) - T_z * sin(rho)
     V_y = T_y
     V_z = T_x * sin(rho) + T_z * cos(rho)
     ```
     _Rationale_: Rotating `T` around the Y-axis by `-rho` swings the page from `+x` (`+z` lift) across the spine toward `-x` (`+z` lift), matching the paper's concurrent rotation process. Because `A = (0, A_y, 0)` lies on the Y-axis, rotation around Y preserves distance to the apex exactly (`|V - A| = |T - A| = R`). At `(theta = pi/2, rho = 0)`, `V = P` (exact flat right-side identity); at `(theta = pi/2, rho = pi)`, `V = (-P_x, P_y, 0)` (flat uncurled page on the left side).

2. **Three-Stage Empirical `coneParams(t)` Trajectory**
   - _Decision_: Map normalized forward curl progress `t = clamp(abs(p), 0, 1)` to `(theta, Ay, rho)` using a smooth 3-stage empirical curve matching Section 2 of Hong, Card & Chen (2004):
     - **Stage 1 (`t = 0`, resting flat)**: `theta = pi/2`, `Ay = Ay_start < 0`, `rho = 0`.
     - **Stage 2 (`0 < t < 1`, lift & curl)**: `theta(t)` dips smoothly from `pi/2` toward a minimum curl half-angle `> theta_min > 0` while `Ay(t)` moves down `-Y` (causing the lower-right corner to lift ahead of the rest of the page) and `rho(t)` advances smoothly from `0` toward `pi`.
     - **Stage 3 (`t -> 1`, uncurl to flat)**: `Ay(t)` moves strongly negative along `-Y` while `theta(t)` eases back toward `pi/2` as `rho(t) -> pi`, smoothly flattening the page without `beta > pi` self-intersection or float precision loss.
   - _Rationale_: Follows the source paper's empirical construction while guaranteeing `u_Ay < 0`, `u_theta in (theta_min, pi/2]`, `u_rho in [0, pi]`, and `coneParams(0) -> (theta = pi/2, rho = 0)` for all inputs.

3. **Isolated Pure Module for `coneParams` and CPU Cone Reference**
   - _Decision_: Place `coneParams(p)` and `deformVertexCone(P, theta, Ay, rho)` in `src/gl/coneMath.ts` with zero WebGL or DOM imports, tested via `vitest` in `src/gl/coneMath.test.ts`.
   - _Rationale_: Enables deterministic verification of `|V - A| = R`, flat identity, and domain invariants without a headless GPU context.

4. **Deformed Normals, Blank-Paper Back Face & Configurable `u_lightPos`**
   - _Decision_:
     - In `src/shaders/cone.vert.glsl`, evaluate `V(P_x, P_y)` and small finite-difference offsets `V(P_x + eps, P_y)` and `V(P_x, P_y + eps)` (using the same `coneDeform` helper) to compute `N = normalize(cross(dV/dx, dV/dy))` in model space, transforming to view/world lighting space cleanly.
     - Disable face culling (`gl.disable(gl.CULL_FACE)`) so back faces remain visible during turns.
     - In `src/shaders/page.frag.glsl`, select `texture(u_pageTex, v_uv)` when `gl_FrontFacing` is true and warm blank paper (`#fdfbf7`-matched off-white color, alpha `1.0`) when `!gl_FrontFacing` (single-page mode; next-page reverse texture deferred to any future double-page mode). Flip `N` for back faces (`gl_FrontFacing ? N : -N`) and compute ambient + Lambert diffuse shading from `u_lightPos`. Multiply final RGB and alpha by `u_opacity` in premultiplied-alpha form (`gl.ONE, gl.ONE_MINUS_SRC_ALPHA`).
     - Expose `u_lightPos` via a configurable renderer option/setter (initialized to an upper-front-left default) with zero UI controls initially, ready for `motion-driven-lighting` to supply live device-tilt coordinates later.

5. **Single-Page `Curl` Mode vs Flat `Slide`/`Stack` Modes**
   - _Decision_:
     - Add `Curl` (`value="curl"`, `checked` by default) to `.controls` in `index.html` alongside `Slide` and `Stack`. Style `.page` in `curl` mode in `src/style.css` purely via CSS `:has()`, so switching radios triggers Chrome's `paint` event and changes active `--progress` / layout without any JS control event listeners.
     - In `src/gl/renderer.ts`, inspect the active mode (`curl` vs `slide`/`stack`) from CSS/DOM state on render frames (never registering `change`/`input` listeners on controls):
       - In **`curl` mode**: Compute the centered page slot rect matching a settled `.page__frame`. Render the revealed underneath page (`p in (-1, 0)`) flat (`theta = pi/2, rho = 0`) with a tiny `-z` depth bias to avoid spine z-fighting, and render the turning top page (`p in [0, 1)`) anchored at the same centered binding edge (`x = 0`) deformed by `coneParams(p)`. Apply a smooth opacity fade-out near `p -> 1` so single-page mode avoids a sudden pop at the left edge on wide viewports when snap finishes. Sync `updateElementGeometry` for the settled/interactive page so `.page__badge` hit-testing and `:hover` stay aligned.
       - In **`slide` and `stack` modes**: Render visible pages flat (`theta = pi/2, rho = 0`) at `.page__frame.getBoundingClientRect()`, preserving all prior behavior identically.

6. **Change-Gated CSS `--progress` Render Loop**
   - _Decision_: Each `requestAnimationFrame` pass checks active/visible `.page` `--progress` values via CSSOM (`computedStyleMap().get('--progress')` with `getComputedStyle` fallback), plus pending `paint` uploads or resizes. Only draw when `--progress` changed, a `paint` event arrived, or viewport/mode changed; stop scheduling `requestAnimationFrame` once stationary, and wake on `paint`, `resize`, or scroll-driven observation (e.g., `scroll` passive wakeup or checking active `.page` state without ever modifying scroll position or handling navigation input).
   - _Constraint check_: Wait — per `AGENTS.md`, never add `touchstart`/`touchmove`/`pointermove`/`wheel` listeners for navigation, and never write scroll position or styles to animate. Observing `scroll` (passive, read-only wake-up to schedule a rAF check of CSS `--progress`) or `scrollend` does not intercept or drive navigation physics and allows the rAF loop to idle completely with 0% CPU when stationary, waking on the first scroll tick to read CSS `--progress`.

## Risks / Trade-offs

- **[Risk] 32-bit float precision loss when `A_y` becomes strongly negative in Stage 3** → Mitigation: Use `P_y + P_x^2 / (R + (P_y - A_y))` instead of `R + A_y` in both `cone.vert.glsl` and `coneMath.ts`, and bound `A_y` cleanly within safe float range while still flattening `theta -> pi/2`.
- **[Risk] Back-face normal sign or spine z-fighting between turning page and underneath page** → Mitigation: Bias the flat underneath page slightly behind `z = 0` in `Curl` mode and verify front/back Lambert shading polarity visually in Chrome 158+.
- **[Risk] Turning page clipping or popping on wide viewports as `p -> 1`** → Mitigation: Ensure perspective near/far planes comfortably enclose the curled + rotated page (`z in [-W, +W]`), and smoothly fade turning-page `u_opacity` as `p` approaches `1`.

## Open Questions (All Resolved)

- **`OQ-04` (Back of a turning page)**: **Resolved** — Warm blank paper (`#fdfbf7`-matched) for single-page mode (next-page texture deferred to any future double-page spread mode).
- **`OQ-06` (Lighting)**: **Resolved** — Minimal Lambert diffuse shading from deformed normals driven by a code-configurable `u_lightPos` uniform (no UI controls; future Browser Motion API exploration logged in `motion-driven-lighting`).
- **`OQ-07` (Paper title & citation)**: **Resolved** — Confirmed via user-provided PDF: Hong, Card & Chen (PARC, SIGGRAPH 2004 Sketches, `sketches_0135`), _"Deforming Pages of 3D Electronic Books"_.
- **`OQ-08` (`coneParams(p)` curve)**: **Resolved** — Follow the 3-stage empirical trajectory described in Section 2 of the source paper (`theta = pi/2` flat start -> `theta` dips & `A_y` moves down `-Y` to lift lower-right corner -> `A_y` moves strongly negative & `theta -> pi/2` to uncurl flat).
- **`OQ-09` (Binding-axis Y-rotation `u_rho`)**: **Resolved** — Include `u_rho in [0, pi]` around the Y-axis (`R_y(-u_rho)`) composed after the cone deformation, matching the source paper's concurrent rotation + deformation processes.
- **`OQ-10` (Unit test runner)**: **Resolved** — `vitest` approved as a `devDependency`.
