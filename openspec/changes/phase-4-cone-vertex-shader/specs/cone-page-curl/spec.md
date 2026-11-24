# Spec Delta: cone-page-curl

## Purpose

Deforms the page mesh in a GLSL ES 3.00 vertex shader using the isometric cone page-curl model of Hong, Card & Chen (2006), driven exclusively by reading `book.scrollLeft` once per active frame and mapping normalized page turn progress `p` to cone parameters.

## ADDED Requirements

### Requirement: Hong, Card & Chen cone vertex shader deformation and UV pass-through
The vertex shader (`src/shaders/cone.vert.glsl`) SHALL implement the exact Hong, Card & Chen cone deformation equations in GLSL ES 3.00 (`R`, `alpha`, `beta`, `r`, and deformed `(T_x, T_y, T_z)`) driven by `u_theta` and `u_Ay` with no substitute curl model, and SHALL pass undeformed UV coordinates to the fragment shader.

#### Scenario: Vertex shader deforms page mesh smoothly without UV sliding
- **WHEN** `u_theta` decreases from `pi/2` toward `theta_min` during a page scroll
- **THEN** the page mesh curls smoothly in 3D space around the cone while its live HTML texture remains anchored to the paper surface

### Requirement: Cone domain invariants for `u_Ay` and `u_theta`
The JavaScript uniform bridge SHALL enforce that `u_Ay` is strictly less than the minimum page `y` (keeping the cone apex below the page so `R > 0` and `P_y - A_y > 0`) and SHALL clamp `u_theta` to `(theta_min, pi/2]` with `theta_min > 0` (so `sin(theta) > 0`), without branching in GLSL.

#### Scenario: Domain invariants hold across full scroll range with zero NaN/Inf vertices
- **WHEN** `coneParams(p)` is evaluated across the full scroll progress range `p in [-1, 1]`
- **THEN** `u_Ay < min(P_y)` and `u_theta in (theta_min, pi/2]` hold for every input and the vertex math produces zero `NaN` or `Inf` coordinates

### Requirement: Isometric no-stretching invariant and flat identity at `theta = pi/2`
For any valid `(u_theta, u_Ay)`, the cone deformation SHALL preserve the distance from the cone apex `A = (0, A_y, 0)` for every vertex (`|T - A| = R`) and at `u_theta = pi/2` the deformed vertex `T` SHALL equal the undeformed flat vertex `P = (P_x, P_y, 0)` within floating-point tolerance.

#### Scenario: CPU reference port passes isometric and identity unit tests
- **WHEN** the unit test suite runs the CPU reference port of the cone equations over a vertex grid across a sweep of valid `(theta, A_y)` pairs
- **THEN** `|T - A| == R` holds for all vertices and `T == P` holds at `theta = pi/2` within float tolerance

### Requirement: Deformed normal shading and back-face rendering
The shader pipeline SHALL compute a deformed surface normal (analytic or finite-difference) when lighting is enabled (`OQ-06`), and SHALL render back faces (the reverse side of the curling page) using either the next page's texture or a paper color (`OQ-04`).

#### Scenario: Reverse side of curling page renders cleanly without disappearing
- **WHEN** a page curls far enough that its back face becomes visible to the camera
- **THEN** the back face is rendered with the configured reverse-side appearance and optional diffuse shading rather than being culled or invisible

### Requirement: Pure `coneParams(p)` parameter mapping
JavaScript SHALL map signed turn progress `p in [-1, 1]` to `(u_theta, u_Ay)` (plus optional binding-axis Y-rotation uniform per `OQ-09`) using a pure, unit-tested function `coneParams(p)` (`OQ-08`) that returns `u_theta = pi/2` (flat page) at `p = 0`.

#### Scenario: `coneParams(0)` returns flat identity
- **WHEN** `coneParams(0)` is evaluated
- **THEN** it returns `u_theta = pi/2` and a valid `u_Ay < min(P_y)`

### Requirement: Read-only `scrollLeft` bridge and change-gated uniform updates
Once per animation frame while scrolling, JavaScript SHALL read `book.scrollLeft` (and nothing else as animation state), derive the turning page index `i` and signed progress `p in [-1, 1]` from `scrollLeft / pageWidth` matching the `css-scroll-state` sign convention, and update shader uniforms only when `scrollLeft` changed since the previous frame, maintaining 60 fps during page turns.

#### Scenario: Uniforms update at 60 fps on scroll change and idle when stationary
- **WHEN** `book.scrollLeft` changes during user scrolling or native snap settling
- **THEN** the render loop updates cone uniforms 1:1 with `scrollLeft` at 60 fps and stops issuing uniform updates or draw calls once `scrollLeft` stops changing
