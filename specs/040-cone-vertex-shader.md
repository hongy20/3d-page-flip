# 040: Phase 4, Cone Vertex Shader & Uniform Wiring

Status: Draft

## Goal

Deform the page plane in the vertex shader with the cone model of Hong, Card & Chen,
and drive its parameters from the scroller's `scrollLeft`, so the page curls in step
with native scrolling.

## Coordinate system

- The flat page lies in the XY-plane (z = 0). The **Y-axis is the binding**, and the page
  occupies `x ∈ [0, W]`, `y ∈ [0, H]`.
- An imaginary cone rests on the XY-plane with its **apex at `A = (0, A_y, 0)`** on the
  binding axis and half-angle `θ` (`u_theta`).
- The page wraps around the cone without stretching. `θ = π/2` is the degenerate case:
  the page is flat.

## The math (fixed: ARCH-10)

For a flat vertex `P = (P_x, P_y, 0)`:

```
R  = sqrt(P_x² + (P_y − A_y)²)
α  = asin(P_x / R)
β  = α / sin(θ)
r  = R · sin(θ)
T_x = r · sin(β)
T_y = R + A_y − r · (1 − cos β) · sin(θ)
T_z = r · (1 − cos β) · cos(θ)
```

Uniforms: `u_theta` (θ, radians), `u_Ay` (A_y, page units).

## Requirements

### Shader
| ID | Requirement |
|----|-------------|
| SHD-01 | The vertex shader MUST implement the formulas above exactly, in GLSL ES 3.00, with no substitute curl model. |
| SHD-02 | The shader MUST pass the undeformed UV through to the fragment shader, so the texture stays attached to the paper. |
| SHD-03 | **Domain invariant:** `u_Ay` MUST be strictly less than the minimum page `y` (i.e. the apex is below the page). This guarantees `R > 0` (no division by zero) and `P_y − A_y > 0`, which `asin` needs to recover the correct angle. The JS side enforces it. |
| SHD-04 | `u_theta` MUST be kept within `(θ_min, π/2]` with `θ_min > 0`, so `sin θ > 0`. Values are clamped in JS, not branched in GLSL. |
| SHD-05 | The shader MUST compute a deformed normal (analytic or finite-difference) for the fragment shader, if lighting is enabled (pending **OQ-06**). |
| SHD-06 | Back faces (the reverse of the page) MUST render, using the next page's texture or a paper colour (pending **OQ-04**). |
| SHD-07 | **No stretching:** for any valid `(θ, A_y)`, the distance from the apex is preserved for every vertex (`|T − A| = R`, where `A = (0, A_y, 0)`), and at `θ = π/2` the output equals the input (`T = P`) within float tolerance. |

### Uniform wiring (JS bridge)
| ID | Requirement |
|----|-------------|
| SHD-08 | Once per animation frame while scrolling, JS MUST read `book.scrollLeft` (and nothing else as animation state, per ARCH-06). |
| SHD-09 | JS MUST derive the turning page index `i` and the signed progress `p ∈ [-1, 1]` from `scrollLeft / pageWidth`, using the same sign convention as CSS-03. |
| SHD-10 | JS MUST map `p` to `(u_theta, u_Ay)` with a pure, unit-tested function `coneParams(p)`. Its curve is pending **OQ-08**. At `p = 0` it MUST return `θ = π/2` (flat page). |
| SHD-11 | The paper's page-turn also rotates the deformed page about the binding (Y) axis. Whether this PoC adds a third uniform for that rotation is pending **OQ-09**. Without it, the page curls but never fully turns over. |
| SHD-12 | Uniforms are set only when `scrollLeft` changed since the last frame (ARCH-13). |

## Design notes

- `asin(P_x / R)` with `P_x ≤ R` always holds mathematically. Clamp the argument to
  `[-1, 1]` in GLSL to absorb float error. That clamp isn't a behaviour change.
- Check: at θ = π/2, sin θ = 1, so β = α, r = R, T_x = R sin α = P_x,
  T_y = A_y + R cos α = P_y, T_z = 0. The flat page is the identity mapping.
- As θ decreases, the page wraps more tightly and lifts in +z. When β exceeds π, the paper
  wraps past a half-turn of the cone. `coneParams` should avoid that range, or it needs
  to be confirmed acceptable visually.
- Keep `coneParams` in its own TS module so it can be unit-tested without WebGL
  (this adds a dev dependency such as Vitest; pending approval in **OQ-10**).

## Acceptance criteria

1. Scrolling slowly makes the turning page curl smoothly and continuously from flat
   (snapped) through to fully curled, tracking the finger 1:1. Releasing lets native snap
   finish the motion, and the curl follows it.
2. SHD-07 is verified by a unit test that runs a CPU port of the shader math over a vertex
   grid for a sweep of `(θ, A_y)` values.
3. `coneParams(0)` returns θ = π/2, and outputs always satisfy SHD-03 and SHD-04 (unit test).
4. No NaN/Inf vertices (no flicker or holes) across the full scroll range.
5. 60 fps during continuous scrolling on the reference machine (Chrome Performance panel).
6. Still no navigation listeners, animation libraries, or JS DOM movement.

## Out of scope

Shadows/lighting polish (unless OQ-06 says otherwise), two-page spreads, page thickness.

## Tasks

- [ ] Resolve OQ-04, OQ-06, OQ-08, OQ-09, OQ-10.
- [ ] Write the CPU reference implementation of the cone mapping, plus SHD-07 tests.
- [ ] Implement `coneParams(p)` plus tests.
- [ ] Port the math to `cone.vert.glsl`; wire the uniforms.
- [ ] Add the rAF loop that reads `scrollLeft` and updates uniforms only on change.
- [ ] Verify the acceptance criteria; commit.
