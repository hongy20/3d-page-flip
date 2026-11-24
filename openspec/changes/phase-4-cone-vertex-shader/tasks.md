# Tasks: Phase 4, Cone Vertex Shader & Uniform Wiring

## 1. Open Questions & Pure CPU Cone Math Reference

- [ ] 1.1 Resolve `OQ-04` (back-of-page rendering), `OQ-06` (diffuse lighting), `OQ-07` (paper title citation), `OQ-08` (`coneParams(p)` curve), `OQ-09` (third uniform `u_rho` for binding-axis Y-rotation), and `OQ-10` (Vitest devDependency) with the user, verifying the updates in `design.md` and `proposal.md`
- [ ] 1.2 Implement the pure CPU reference port of the Hong, Card & Chen cone equations and `coneParams(p)` in `src/gl/coneMath.ts`, and verify via unit tests that `|T - A| = R` holds across a vertex grid sweep of `(theta, A_y)`, `T = P` holds at `theta = pi/2`, `coneParams(0)` returns `theta = pi/2`, and outputs always satisfy `u_Ay < min(y)` and `u_theta in (theta_min, pi/2]`

## 2. Cone Vertex Shader & Fragment Pipeline

- [ ] 2.1 Implement the Hong, Card & Chen cone deformation equations, undeformed UV pass-through, optional binding-axis rotation (`OQ-09`), and deformed surface normal calculation (`OQ-06`) in GLSL ES 3.00 (`src/shaders/cone.vert.glsl`), and verify shader compilation succeeds with zero warnings
- [ ] 2.2 Configure back-face rendering and optional diffuse shading in `src/shaders/page.frag.glsl` and the WebGL state (`OQ-04`, `OQ-06`), and verify both front and back faces render without flicker, holes, or `NaN`/`Inf` artifacts across the full curl range

## 3. Read-Only `scrollLeft` Uniform Bridge & Performance Verification

- [ ] 3.1 Implement the `requestAnimationFrame` uniform bridge in `src/gl/` that reads `book.scrollLeft` once per active frame, derives page index `i` and signed progress `p in [-1, 1]` matching `css-scroll-state`, updates `u_theta` and `u_Ay` via `coneParams(p)` only when `scrollLeft` changed, and idles when stationary
- [ ] 3.2 Verify in Chrome 157+ that slow and fast scrolling curls the page smoothly 1:1 with finger/trackpad input and native snap completion at 60 fps (Chrome Performance panel), all unit tests and `npm run build` pass, and zero navigation listeners, animation libraries, or JS DOM movement exist in `src/`
