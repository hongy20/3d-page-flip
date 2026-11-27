# Proposal: Cone Vertex Shader & Uniform Wiring

## Why

With native scrolling (`scaffolding`), declarative scroll state (`css-state-engine`), and live HTML-in-Canvas textures on a tessellated WebGL2 plane (`webgl-html-in-canvas`) in place, this change delivers the core visual goal of **WebBook 3D**: deforming the page mesh in real time using the isometric cone page-curl and binding-axis rotation model of Hong, Card & Chen (SIGGRAPH 2004 Sketches, `sketches_0135`, _"Deforming Pages of 3D Electronic Books"_) driven exclusively by reading CSS `--progress` via CSSOM.

## What Changes

- Implement the exact Hong, Card & Chen cone deformation (`u_theta`, `u_Ay`, Eqs. 1–3 with cancellation-safe `R + A_y`) composed with concurrent binding-axis Y-rotation (`u_rho` in `[0, pi]`) in GLSL ES 3.00 (`src/shaders/cone.vert.glsl`), preserving undeformed UVs and exact isometric distances.
- Compute finite-difference deformed normals in `src/shaders/cone.vert.glsl` and update `src/shaders/page.frag.glsl` with two-sided rendering (`gl.disable(gl.CULL_FACE)`): live HTML page texture on the front face (`gl_FrontFacing`), warm blank-paper tone (`#fdfbf7`-matched) on the back face for single-page mode (deferring next-page back textures to any future double-page spread mode), and minimal Lambert diffuse lighting driven by a code-configurable `u_lightPos` uniform (with no UI controls; future Browser Motion API control is logged separately in `motion-driven-lighting`).
- Add `Curl` as the new default transition mode radio option alongside `Slide` and `Stack` in `.controls` (switched via native radio inputs and CSS `:has()` with zero JS control listeners); keep `Slide` and `Stack` flat in WebGL while `Curl` renders the turning page anchored to the centered binding over the flat revealed page underneath.
- Implement the read-only JS bridge in `src/gl/renderer.ts` that reads CSS `--progress` on active/visible `.page` element(s) via CSSOM (`computedStyleMap().get('--progress')` / `getComputedStyle`) once per active frame, identifies the turning page and signed progress `p` in `[-1, 1]`, maps `p` via a pure 3-stage empirical `coneParams(p)` function (`src/gl/coneMath.ts`), and updates uniforms and draws only when `--progress`, `paint`, or resize changes occur.
- Add a pure CPU reference port (`deformVertexCone`) in `src/gl/coneMath.ts` and a `vitest` unit test suite (`src/gl/coneMath.test.ts`) verifying isometric distance preservation (`|V - A| = R`), flat identity at `(theta = pi/2, rho = 0)`, 3-stage curl/uncurl curves, and domain invariants.

### Out of Scope

- Two-page spreads (and rendering next-page textures on reverse faces), book covers, page thickness, or shadow mapping.
- Light-source UI sliders or Browser Motion API integration (logged in `motion-driven-lighting`).
- Any JS scroll writes, navigation/control input event listeners, or animation libraries.

## Capabilities

### New Capabilities

- `cone-page-curl`: GLSL ES 3.00 cone vertex deformation and binding-axis rotation shader (Hong, Card & Chen model), deformed-normal Lambert shading with configurable `u_lightPos`, blank-paper back-face rendering, pure 3-stage `coneParams(p)` and CPU verification tests, single-page `Curl` mode rendering, and read-only CSS `--progress` uniform bridge.

### Modified Capabilities

- `css-scroll-state`: Adds `curl` as the default transition mode radio option alongside `slide` and `stack`, preserving zero-JS mode switching via CSS `:has()`.

## Impact

- **Files created/affected**: `index.html`, `src/style.css`, `src/shaders/cone.vert.glsl`, `src/shaders/page.frag.glsl`, `src/gl/coneMath.ts`, `src/gl/coneMath.test.ts`, `src/gl/renderer.ts`, `package.json`.
- **Dependencies**: `vitest` added as a `devDependency` for CPU math unit testing; zero new runtime dependencies.
- **Open Questions**: All `cone-vertex-shader` open questions (`OQ-04`, `OQ-06`, `OQ-07`, `OQ-08`, `OQ-09`, `OQ-10`) are resolved.
