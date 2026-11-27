# Design

## Context

See [proposal.md](proposal.md). Currently `src/shaders/cone.vert.glsl` and `src/gl/coneMath.ts` implement only the bottom-apex Hong, Card & Chen cone curl, and `AGENTS.md` prohibits any `pointer*`/`touch*` listeners and substituting cylinder models. Amending `AGENTS.md` first keeps specs, constraints, and implementation aligned.

## Goals / Non-Goals

**Goals:**
- Respond naturally to where the user grabs the page vertically (`top`, `middle`, `bottom`) while keeping native CSS scroll-snap as the sole physics and `--progress` engine.
- Preserve exact isometry, flat identity at `p = 0`, and smooth normal lighting across all three curl modes.

**Non-Goals:**
- Driving scroll position, velocity, or snap timing from pointer events.
- Altering `slide` or `stack` transition modes.

## Decisions

1. **Constraint update in `AGENTS.md`**:
   - Amend "No JS physics" to clarify that a passive, read-only `pointerdown` listener may inspect `clientY` strictly to classify the curl zone (`top`/`middle`/`bottom`), without ever writing scroll offsets, transforms, or animation physics.
   - Amend "Cone model math is fixed" to document the extended Hong, Card & Chen cone + Y-reflected top-cone + isometric cylinder curl model.
2. **Y-reflected top-corner cone (`top` zone)**:
   - Given page height `H` (`u_pageHeight`, matching mesh height), reflect input `p' = vec2(p.x, H - p.y)`, apply `V' = coneDeform(p')`, and reflect output `V = vec3(V'.x, H - V'.y, V'.z)`.
   - Recomputing finite-difference normals `normalize(cross(dVdx, dVdy))` on the reflected `V` automatically preserves outward front-face normal orientation.
3. **Isometric cylinder curl (`middle` zone)**:
   - Parameterize curvature by `kappa(p) = 1 / r_c(p) >= 0` with `kappa(0) = kappa(1) = 0` and smooth mid-turn peak, avoiding `r_c -> infinity` singularities.
   - Wrap horizontal coordinate `x` by `phi = kappa * x`:
     - `Tx = (kappa > EPS) ? sin(phi) / kappa : x * (1.0 - phi * phi / 6.0)`
     - `Ty = p.y`
     - `Tz = (kappa > EPS) ? (1.0 - cos(phi)) / kappa : 0.5 * x * phi` (or `2.0 * sin(0.5 * phi)^2 / kappa`)
   - Compose `(Tx, Ty, Tz)` with the same binding-axis Y-rotation `u_rho` as the cone model so front-to-back rotation around `x = 0` matches seamlessly.
   - Arc length `sqrt((dTx/dx)^2 + (dTz/dx)^2) = 1` holds everywhere (exact isometry).
4. **Passive read-only zone latching**:
   - Attach `{ passive: true }` `pointerdown` listener on `.book`. Compute normalized `yNorm = clamp((e.clientY - pageRect.top) / pageRect.height, 0, 1)`.
   - Latch the active zone while a turn is in progress (`|p| > EPS`) so the deformation shape stays stable during snap settling, and reset to `bottom` when non-pointer navigation starts from rest.

## Risks / Trade-offs

- **Zone jump if pointer starts a new swipe mid-snap** → Latch the zone at `pointerdown` and only clear on idle settle (`p == 0`) or next `pointerdown`.
- **Cylinder curvature strength (`kappa`)** → Too large `kappa` can roll the outer edge past 180 degrees; bound `max(kappa) * pageWidth` below `pi` (e.g., `<= 2.2`) so the roll looks natural without self-intersection.

## Open Questions

- **`OQ-CURL-1` (Discrete 3-zone switching vs continuous vertical blend)**: Should `yNorm` select discretely among `top` (`< 1/3`), `middle` (`[1/3, 2/3]`), and `bottom` (`> 2/3`), or smoothly blend between cylinder and top/bottom cone based on exact touch `yNorm`? (Recommended: start with discrete 3 zones or narrow smooth blend around `1/3` and `2/3` so the middle feels clearly cylindrical and top/bottom feel clearly conical.)
