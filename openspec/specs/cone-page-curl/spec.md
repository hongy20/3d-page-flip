# cone-page-curl Specification

## Purpose

Deforms the page mesh in a GLSL ES 3.00 vertex shader using the isometric cone page-curl and binding-axis rotation model of Hong, Card & Chen (2004), driven exclusively by reading CSS `--progress` on active/visible `.page` element(s) via CSSOM once per active frame.

## Requirements

### Requirement: Hong, Card & Chen cone deformation, binding-axis rotation, and UV pass-through
The vertex shader SHALL implement the Hong, Card & Chen cone deformation equations (`R`, `alpha`, `beta`, `r`, `(T_x, T_y, T_z)` with cancellation-safe `R + A_y`) composed with binding-axis Y-rotation `u_rho` in GLSL ES 3.00, and SHALL pass undeformed UV coordinates to the fragment shader.

#### Scenario: Vertex shader curls and turns page smoothly without UV sliding
- **WHEN** `u_theta`, `u_Ay`, and `u_rho` advance across a page turn
- **THEN** the page mesh curls around the cone and rotates across the Y-axis binding while its live HTML texture remains anchored to the paper surface

### Requirement: Cone domain invariants for `u_Ay`, `u_theta`, and `u_rho`
The uniform parameter mapping SHALL enforce `u_Ay < min(P_y)`, clamp `u_theta` to `(theta_min, pi/2]` with `theta_min > 0`, and bound `u_rho` to `[0, pi]` so the vertex equations produce zero `NaN` or `Inf` coordinates without GLSL branching.

#### Scenario: Domain invariants hold across full scroll range with zero NaN/Inf vertices
- **WHEN** `coneParams(p)` is evaluated across `p in [-1, 1]`
- **THEN** `u_Ay < min(P_y)`, `u_theta in (theta_min, pi/2]`, and `u_rho in [0, pi]` hold for every input and all deformed vertices are finite

### Requirement: Isometric no-stretching invariant and flat identity
For any valid `(u_theta, u_Ay, u_rho)`, the deformation SHALL preserve distance to the cone apex `A = (0, A_y, 0)` for every vertex (`|V - A| = R`) and at `(u_theta = pi/2, u_rho = 0)` SHALL equal the flat vertex `P = (P_x, P_y, 0)` within floating-point tolerance.

#### Scenario: CPU reference port passes isometric and identity unit tests
- **WHEN** the unit test suite evaluates the CPU reference port over a vertex grid across a sweep of valid `(theta, A_y, rho)` triples
- **THEN** `|V - A| == R` holds for all vertices and `V == P` holds at `(theta = pi/2, rho = 0)` within floating-point tolerance

### Requirement: Deformed normal Lambert shading with configurable light position
The shader pipeline SHALL compute a deformed surface normal in vertex space and apply ambient plus Lambert diffuse shading driven by a code-configurable `u_lightPos` uniform without requiring UI lighting controls.

#### Scenario: Curled surface exhibits shading gradient responsive to `u_lightPos`
- **WHEN** a page curls out of the `z = 0` plane or `u_lightPos` is configured to a new 3D position
- **THEN** the fragment shader shades vertices according to their deformed surface normals relative to `u_lightPos`

### Requirement: Blank-paper back-face rendering in single-page curl mode
The WebGL pipeline SHALL disable back-face culling and render front faces with the live HTML page texture and back faces with a warm blank-paper tone shaded using the flipped deformed normal.

#### Scenario: Reverse side of turning page renders as shaded blank paper
- **WHEN** a turning page curls and rotates past perpendicular so its reverse side faces the camera
- **THEN** the back face renders with the warm blank-paper color and diffuse shading without culling artifacts or holes

### Requirement: Pure three-stage `coneParams(p)` parameter mapping
JavaScript SHALL map turn progress `p` to `(u_theta, u_Ay, u_rho)` via a pure, unit-tested 3-stage empirical function `coneParams(p)` that returns `(theta = pi/2, rho = 0)` at `p = 0`, lifts the lower-right corner mid-turn, and uncurls smoothly toward flat as `|p| -> 1`.

#### Scenario: `coneParams(0)` returns flat resting identity
- **WHEN** `coneParams(0)` is evaluated
- **THEN** it returns `u_theta = pi/2`, `u_rho = 0`, and a valid `u_Ay < min(P_y)`

#### Scenario: `coneParams(p)` follows three-stage lift and uncurl trajectory
- **WHEN** `coneParams(p)` is sampled from `p = 0` to `p = 1`
- **THEN** `u_theta` dips below `pi/2` while `u_Ay` moves negative mid-turn and eases back toward `pi/2` as `u_rho -> pi` and `u_Ay` becomes strongly negative

### Requirement: Single-page `curl` rendering alongside flat `slide` and `stack` modes
When `curl` mode is active, the renderer SHALL anchor the turning page (`p in [0, 1)`) at the centered binding edge over the flat revealed page underneath (`p in (-1, 0)`) and fade smoothly near `p -> 1`; when `slide` or `stack` mode is active, pages SHALL render flat at their DOM frame bounds.

#### Scenario: Switching between `curl`, `slide`, and `stack` updates WebGL deformation behavior
- **WHEN** the user selects `curl`, `slide`, or `stack` in `.controls`
- **THEN** `curl` renders 3D cone turns over the stationary next page while `slide` and `stack` render flat aligned pages matching their CSS layout

### Requirement: Read-only CSS `--progress` bridge and change-gated uniform updates
Once per active animation frame, JavaScript SHALL read CSS `--progress` on active/visible `.page` element(s) via CSSOM (`computedStyleMap().get('--progress')` / `getComputedStyle`, and nothing else as animation state) and update uniforms and draw only when `--progress`, `paint`, resize, or light config changed.

#### Scenario: Uniforms update at 60 fps on `--progress` change and idle when stationary
- **WHEN** active page `--progress` changes during user scrolling or native snap settling
- **THEN** the render loop updates cone uniforms 1:1 with `--progress` at 60 fps and stops issuing uniform updates or draw calls once `--progress` stops changing
