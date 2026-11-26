# Design: Phase 4, Cone Vertex Shader & Uniform Wiring

## Context

See `proposal.md` for motivation. Phase 4 completes the WebBook 3D pipeline by replacing Phase 3's flat vertex transformation with the Hong, Card & Chen (2006) isometric cone deformation in `src/shaders/cone.vert.glsl` and wiring CSS `--progress` (read via CSSOM) to shader uniforms via `coneParams(p)`.

## Goals / Non-Goals

**Goals:**
- Implement the exact Hong, Card & Chen cone math in both a pure TypeScript CPU reference function (for unit testing) and GLSL ES 3.00.
- Implement `coneParams(p)` in an isolated, unit-tested TypeScript module that guarantees domain invariants and flat identity at `p = 0`.
- Drive shader uniforms strictly from reading CSS `--progress` on active/visible `.page` element(s) via CSSOM on change in the `requestAnimationFrame` loop at a steady 60 fps.

**Non-Goals:**
- Cylindrical or non-cone curl approximations.
- Any JS scroll mutation, input listeners, or animation libraries.

## Decisions

1. **Coordinate System & Fixed Cone Equations**
   - *Coordinate System*:
     - Flat page lies in the XY-plane (`z = 0`), with the **Y-axis as the binding** (`x = 0`) and page extent `x in [0, W]`, `y in [0, H]`.
     - Imaginary cone rests on the XY-plane with apex `A = (0, A_y, 0)` on the binding axis and half-angle `theta` (`u_theta`).
   - *Equations*: For flat vertex `P = (P_x, P_y, 0)`:
     ```text
     R     = sqrt(P_x^2 + (P_y - A_y)^2)
     alpha = asin(clamp(P_x / R, -1.0, 1.0))
     beta  = alpha / sin(theta)
     r     = R * sin(theta)
     T_x   = r * sin(beta)
     T_y   = R + A_y - r * (1.0 - cos(beta)) * sin(theta)
     T_z   = r * (1.0 - cos(beta)) * cos(theta)
     ```
   - *Rationale*: At `theta = pi/2`, `sin(theta) = 1`, `cos(theta) = 0`, `beta = alpha`, `r = R`, yielding `T_x = R sin(alpha) = P_x`, `T_y = A_y + R cos(alpha) = P_y`, `T_z = 0` (exact identity). For any valid `(theta, A_y)`, the distance to the apex `|T - A|` equals `R` (zero paper stretching). Clamping `P_x / R` to `[-1, 1]` in GLSL absorbs floating-point precision drift at `P_x == R` without altering math behavior.

2. **Isolated Pure Module for `coneParams(p)` and CPU Cone Reference**
   - *Decision*: Place `coneParams(p)` and the CPU port `deformVertexCone(P, theta, Ay)` in `src/gl/coneMath.ts` with zero WebGL or DOM imports.
   - *Rationale*: Enables fast deterministic unit testing of the isometric invariant, flat identity, and domain invariants in Node/Vitest (`OQ-10`) without needing a headless GPU context.

3. **Change-Gated CSS `--progress` Render Loop**
   - *Decision*: Track previous active-page `--progress` values and `needsPaintUpload` in the render loop, reading CSS `--progress` on active/visible `.page` element(s) via CSSOM (`computedStyleMap().get('--progress')` / `getComputedStyle`). Only compute uniforms and issue `gl.drawElements` when `--progress` changed or a `paint` event occurred.
   - *Rationale*: Satisfies the read-only CSS `--progress` constraint, avoids scanning offscreen pages, and ensures the render loop idles when stationary.

## Risks / Trade-offs

- **[Risk] Cone over-wrapping when `beta > pi`** → Mitigation: Tune `coneParams(p)` (`OQ-08`) so `theta` and `A_y` stay within a visually natural curl envelope where the page lifts and turns cleanly without self-intersecting.
- **[Risk] Without a binding-axis Y-rotation (`OQ-09`), the cone curls the page upward in `+z` but never lands on the left (`-x`)** → Mitigation: Resolve `OQ-09` before finalizing `cone.vert.glsl` so a third uniform (e.g., `u_rho`) can compose the Y-axis rotation after the cone deformation, matching Hong, Card & Chen (2006).

## Open Questions

Must be resolved with the human before completing Phase 4 implementation (per `AGENTS.md`):

- **`OQ-04` (Back of a turning page: show the next page's content, its mirror, or blank paper?)**: Real books show the reverse side (the next page in sequence). Status: **Open**.
- **`OQ-06` (Lighting: include simple diffuse shading from the deformed normal?)**: Greatly improves curl readability at low cost. Proposed: yes, minimal Lambert. Status: **Open**.
- **`OQ-07` (Paper title and citation confirmation)**: User brief cites *"Deforming Pages of 3D Electronic Books"*; known publication is *"Turning Pages of 3D Electronic Books"* (Hong, Card & Chen, IEEE 3DUI 2006). Confirm intended source and formula match. Status: **Open**.
- **`OQ-08` (`coneParams(p)` curve: how do `theta` and `A_y` evolve over the turn?)**: The paper uses piecewise functions over turn time. Proposed starting point: `theta` eases from `pi/2` down to `~0.1-0.3 rad`, and `A_y` moves from slightly below the page to strongly negative; tune visually. Status: **Open**.
- **`OQ-09` (Add the binding-axis rotation as a third uniform, e.g. `u_rho`?)**: The paper composes the cone deformation with a rotation about Y to complete the turn; without it, the page curls up but never lands on the left. Status: **Open**.
- **`OQ-10` (Testing: allow Vitest as a dev dependency for unit tests of the math?)**: The alternative is ad-hoc test scripts. Status: **Open**.
