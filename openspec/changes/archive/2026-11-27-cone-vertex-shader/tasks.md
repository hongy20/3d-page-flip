# Tasks: Cone Vertex Shader & Uniform Wiring

## 1. Test Setup & Pure CPU Cone Math Reference

- [x] 1.1 Install `vitest` as a `devDependency` and add a `"test"` script in `package.json`
- [x] 1.2 Implement the pure CPU reference port of the Hong, Card & Chen cone equations plus binding-axis Y-rotation (`deformVertexCone`) and 3-stage `coneParams(p)` in `src/gl/coneMath.ts`, and verify via unit tests in `src/gl/coneMath.test.ts` that `|V - A| = R` holds across a vertex grid sweep of `(theta, A_y, rho)`, `V = P` holds at `(theta = pi/2, rho = 0)`, `coneParams(0)` returns flat identity, and outputs satisfy `u_Ay < 0`, `u_theta in (theta_min, pi/2]`, and `u_rho in [0, pi]`

## 2. Cone Vertex Shader, Blank Back Face & Configurable Lighting

- [x] 2.1 Implement `src/shaders/cone.vert.glsl` in GLSL ES 3.00 with exact Hong, Card & Chen cone deformation (cancellation-safe `R + A_y`), `R_y(-u_rho)` binding-axis rotation, finite-difference deformed normal calculation, and undeformed UV pass-through, verifying clean shader compilation with zero warnings
- [x] 2.2 Update `src/shaders/page.frag.glsl` and WebGL pipeline state (`gl.disable(gl.CULL_FACE)`) for warm blank-paper back-face rendering (`!gl_FrontFacing` with flipped normal) and Lambert diffuse shading driven by a code-configurable `u_lightPos` uniform (preserving premultiplied alpha output)

## 3. Curl Mode Controls, `--progress` Uniform Bridge & Verification

- [x] 3.1 Add `Curl` as the default `<input type="radio" name="mode" value="curl" checked>` option alongside `Slide` and `Stack` in `index.html` and `src/style.css` with zero JS control listeners
- [x] 3.2 Update `src/gl/renderer.ts` with the read-only CSS `--progress` CSSOM bridge (`computedStyleMap().get('--progress')` / `getComputedStyle`), single-page `Curl` composition (turning page anchored to centered binding over flat underneath page with smooth end-of-turn fade), flat `Slide`/`Stack` preservation, configurable light-position API, and change-gated idle-when-stationary render loop
- [x] 3.3 Verify in Chrome 158+ that slow and fast scrolling and native snap curl smoothly 1:1 at 60 fps, blank-paper back face and Lambert shading render without flicker, holes, or `NaN`/`Inf` artifacts, `Slide`/`Stack`/`Debug`/`.page__badge` interactions still work, `npm test` and `npm run build` pass, and zero navigation/control listeners, animation libraries, or JS DOM scroll mutations exist in `src/`
