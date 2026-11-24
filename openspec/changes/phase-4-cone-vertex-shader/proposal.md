# Proposal: Phase 4, Cone Vertex Shader & Uniform Wiring

## Why

With native scrolling (Phase 1), declarative scroll state (Phase 2), and live HTML-in-Canvas textures on a tessellated WebGL2 plane (Phase 3) in place, Phase 4 delivers the core visual goal of **WebBook 3D**: deforming the page mesh in real time using the isometric cone page-curl model of Hong, Card & Chen (2006) driven exclusively by reading `scrollLeft`.

## What Changes

- Implement the exact Hong, Card & Chen cone deformation equations in GLSL ES 3.00 (`src/shaders/cone.vert.glsl`), transforming each flat vertex `P = (P_x, P_y, 0)` around a cone with apex `A = (0, A_y, 0)` and half-angle `theta` (`u_theta`, `u_Ay`) while preserving undeformed UVs and edge lengths.
- Support deformed normals/lighting (pending `OQ-06`), back-face rendering for the reverse side of turning pages (pending `OQ-04`), and optional binding-axis Y-rotation (pending `OQ-09`).
- Implement the read-only JS bridge that reads `book.scrollLeft` once per active frame, derives the turning page index `i` and signed progress `p` in `[-1, 1]`, and maps `p` via a pure, unit-tested `coneParams(p)` function to shader uniforms only when `scrollLeft` changes.
- Add a CPU reference port of the cone math and unit test suite verifying isometric distance preservation (`|T - A| = R`), identity at `theta = pi/2`, and domain invariants (pending `OQ-10`).

### Out of Scope

- Two-page spreads, book covers, page thickness, or complex shadows beyond optional diffuse Lambert shading.
- Any JS scroll writes, input event listeners, or animation libraries.

## Capabilities

### New Capabilities
- `cone-page-curl`: GLSL ES 3.00 cone vertex deformation shader (Hong, Card & Chen model), pure `coneParams(p)` parameter mapping, CPU math verification tests, and read-only `scrollLeft` uniform bridge.

### Modified Capabilities
<!-- None -->

## Impact

- **Files created/affected**: `src/shaders/cone.vert.glsl`, `src/shaders/page.frag.glsl`, `src/gl/` (uniform bridge, render loop idle/active gating, `coneParams.ts`), and unit tests (e.g., `src/gl/coneParams.test.ts`).
- **Dependencies**: Optional devDependency for unit testing (`Vitest`, pending `OQ-10`); zero new runtime dependencies.
- **Open Questions**: `OQ-04` (back-of-page texture/color), `OQ-06` (diffuse lighting), `OQ-07` (paper title citation confirmation), `OQ-08` (`coneParams(p)` trajectory), `OQ-09` (third uniform `u_rho` for binding-axis rotation), and `OQ-10` (Vitest devDependency).
