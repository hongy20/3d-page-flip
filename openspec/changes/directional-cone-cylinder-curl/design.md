# Design

## Context

See [proposal.md](proposal.md). Currently `src/shaders/cone.vert.glsl` and `src/gl/coneMath.ts` implement only the bottom-apex Hong, Card & Chen cone curl, and `AGENTS.md` prohibits any `pointer*`/`touch*` listeners and substituting cylinder models. Amending `AGENTS.md` first keeps specs, constraints, and implementation aligned.

The cylinder curl equations and continuous `conicContribution` blending follow Eric Brumer's **Project Austin Part 2 of 6: Page Curling** (`https://devblogs.microsoft.com/cppblog/project-austin-part-2-of-6-page-curling/`, Microsoft C++ Team Blog), unified with our cancellation-safe Hong, Card & Chen cone formulation and CSS `--progress` loop.

## Goals / Non-Goals

**Goals:**

- Respond naturally and continuously to where the user grabs the page vertically (`conicContribution` in `[-1, 1]`) while keeping native CSS scroll-snap as the sole physics and `--progress` engine.
- Preserve exact isometry at pure cone (`±1`) and pure cylinder (`0`) endpoints, flat identity at `p = 0`, and smooth normal lighting across all blended curl values.

**Non-Goals:**

- Driving scroll position, velocity, or snap timing from pointer events.
- Altering `slide` or `stack` transition modes.

## Decisions

1. **Constraint update in `AGENTS.md`**:
   - Amend "No JS physics" to clarify that a passive, read-only `pointerdown` listener may inspect `clientY` strictly to compute `conicContribution` in `[-1, 1]`, without ever writing scroll offsets, transforms, or animation physics.
   - Amend "Cone model math is fixed" to document the extended Hong, Card & Chen cone + Y-reflected top-cone + Project Austin isometric cylinder + `conicContribution` blend model.

2. **Y-reflected top-corner cone (`conicContribution < 0`)**:
   - Given page height `H` (`u_pageHeight`, matching mesh height), reflect input `p' = vec2(p.x, H - p.y)`, apply `V' = coneDeform(p')`, and reflect output `V = vec3(V'.x, H - V'.y, V'.z)`.
   - Recomputing finite-difference normals `normalize(cross(dVdx, dVdy))` on the final deformed vertex `V` automatically preserves outward front-face normal orientation.

3. **Isometric cylinder curl (`conicContribution = 0`, Project Austin Part 2)**:
   - In Project Austin Part 2, flat horizontal coordinate `x` wraps around a virtual cylinder parallel to the Y-axis (`x = 0, z = R`) via `beta = x / R`, `Tx = R * sin(beta)`, `Ty = y`, `Tz = R * (1 - cos(beta))`, followed by binding-axis Y-rotation `rho`.
   - To avoid `R -> infinity` singularities at `p = 0` and `p = 1`, we express this algebraically identically in curvature form `kappa(p) = 1 / R(p) >= 0` (`kappa(0) = kappa(1) = 0`, smooth mid-turn peak), with `phi = kappa * x`:
     - `Tx = (kappa > EPS) ? sin(phi) / kappa : x * (1.0 - phi * phi / 6.0)`
     - `Ty = p.y`
     - `Tz = (kappa > EPS) ? (1.0 - cos(phi)) / kappa : 0.5 * x * phi`
   - Using temporary `Tx`/`Tz` avoids the in-place `cylX` overwrite in the blog snippet before composing with binding-axis Y-rotation `R_y(-u_rho)`.
   - Arc length `sqrt((dTx/dx)^2 + (dTz/dx)^2) = 1` holds everywhere (exact isometry).

4. **Continuous `conicContribution` blending (`OQ-CURL-1` Resolved)**:
   - Attach a `{ passive: true }` `pointerdown` listener on `.book`. Compute normalized `yNorm = clamp((e.clientY - pageRect.top) / pageRect.height, 0, 1)` and map it continuously to `conicContribution = 2.0 * yNorm - 1.0` in `[-1, 1]` (`-1` at top edge, `0` at vertical center, `+1` at bottom edge and as the default for keyboard/wheel navigation).
   - Blend the deformed pre-rotation or post-rotation cylinder point `V_cyl` and signed cone point `V_cone` (bottom cone when `conicContribution >= 0`, Y-reflected top cone when `conicContribution < 0`) continuously by `w = abs(conicContribution)`: `V = mix(V_cyl, V_cone, w)`.
   - Latch `conicContribution` while a turn is in progress (`|p| > EPS`) so the deformation shape stays stable during snap settling, and reset to `+1` when non-pointer navigation starts from rest.

## Risks / Trade-offs

- **Zone jump if pointer starts a new swipe mid-snap** → Latch `conicContribution` at `pointerdown` and only reset to `+1` on idle settle (`p == 0`) followed by non-pointer scroll, or update on next `pointerdown`.
- **Cylinder curvature strength (`kappa`)** → Too large `kappa` can roll the outer edge past 180 degrees; bound `max(kappa) * pageWidth` below `pi` (e.g., `<= 2.2`) so the roll looks natural without self-intersection.

## Open Questions

- **`OQ-CURL-1` (Discrete 3-zone switching vs continuous vertical blend)**: **Resolved — Continuous `conicContribution` in `[-1, 1]`** matching Project Austin Part 2 (`-1` top Y-reflected cone, `0` center cylinder, `+1` bottom cone), mapped continuously from `pointerdown` `yNorm`.
