# Spec Delta

## MODIFIED Requirements

### Requirement: Single-page `curl` rendering alongside flat `slide` and `stack` modes

When `curl` mode is active, the renderer SHALL anchor the turning page (`p in [0, 1)`) at the centered binding edge over the flat revealed page underneath (`p in (-1, 0)`) and fade smoothly near `p -> 1`; when `slide` or `stack` mode is active, pages SHALL render flat at their DOM frame bounds. Flat page draws—including the stationary under-page, settled resting pages, and `slide`/`stack` pages—SHALL use a flat fast path that bypasses finite-difference 3D curl deformation while preserving pixel-aligned geometry and Lambert diffuse shading.

#### Scenario: Switching between `curl`, `slide`, and `stack` updates WebGL deformation behavior

- **WHEN** the user selects `curl`, `slide`, or `stack` in `.controls`
- **THEN** `curl` renders 3D cone turns over the stationary next page while `slide` and `stack` render flat aligned pages matching their CSS layout

#### Scenario: Flat page draws skip 3D finite-difference curl deformation

- **WHEN** the renderer draws a flat page (underneath a turning page, settled at rest, or in `slide`/`stack` mode)
- **THEN** it renders via the flat fast path with exact pixel alignment and flat Lambert shading without evaluating finite-difference 3D cone/cylinder curl per vertex

### Requirement: Read-only CSS `--progress` bridge and change-gated uniform updates

Once per active animation frame, JavaScript SHALL read CSS `--progress` via CSSOM on active/visible `.page` elements and redraw only when `--progress`, `paint`, resize, `conicContribution`, `cornerBend`, or light config changes. Passive Pointer Events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`, with passive touch fallback during native scroll) SHALL only read pointer coordinates for curl shape tracking and SHALL NOT drive scroll or DOM movement. Base cone parameters for a frame's active turn progress SHALL be computed once per frame and shared across vertical control solving, corner bend, and cylinder curvature, and the animation loop SHALL continue advancing while smoothed curl controls converge toward their target within epsilon before idling once converged.

#### Scenario: Uniforms update at 60 fps on `--progress` change and idle when stationary

- **WHEN** active page `--progress` or live pointer curl state changes during user scrolling or native snap settling
- **THEN** the render loop updates curl uniforms at 60 fps, continues until smoothed curl controls converge within epsilon, and stops issuing uniform updates or draw calls once state stops changing

### Requirement: Continuous directional curl blending (top cone, cylinder, bottom cone)

The curl renderer SHALL read pointer position via passive Pointer Events (with passive touch fallback during native scroll) without driving scroll or DOM movement, anchoring the initial curl corner from the grab height (`conicContribution` in `[-1, 1]`, defaulting to `+1` for non-pointer navigation) and solving live vertical displacement into target `conicContribution` and `cornerBend` in `[0, 1]` so the grabbed point tracks the pointer vertically within isometric cone and cylinder limits. When a turn begins, the rendered curl controls SHALL anchor immediately to the initial grab corner; during subsequent mid-turn transverse pointer updates (including throttled mobile `touchmove` intervals) and release, the rendered `(conicContribution, cornerBend)` SHALL converge toward the solved target using frame-rate-independent exponential smoothing.

#### Scenario: Swiping near the bottom edge produces bottom-corner cone curl

- **WHEN** the user initiates a swipe near the bottom edge of the page in `curl` mode (`conicContribution -> +1`)
- **THEN** the page curls upward from the lower outer corner using the bottom-apex cone model

#### Scenario: Swiping near the top edge produces upside-down top-corner cone curl

- **WHEN** the user initiates a swipe near the top edge of the page in `curl` mode (`conicContribution -> -1`)
- **THEN** the page curls downward from the upper outer corner using the vertically mirrored cone model

#### Scenario: Swiping near the vertical center produces cylindrical curl

- **WHEN** the user initiates a swipe near the vertical center of the page in `curl` mode (`conicContribution = 0`)
- **THEN** the page rolls evenly along a cylinder parallel to the binding edge

#### Scenario: Intermediate swipe positions blend smoothly between cylinder and cone

- **WHEN** the user initiates a swipe between the vertical center and the top or bottom edge (`0 < |conicContribution| < 1`)
- **THEN** the curl smoothly interpolates between the cylindrical deformation and the corresponding top or bottom cone deformation

#### Scenario: Grabbing the bottom-right corner and dragging upward bends that corner progressively deeper

- **WHEN** the user presses near the bottom-right corner of the page in `curl` mode and drags upward
- **THEN** the curl starts from the bottom-right corner (`conicContribution = +1`) and increases `cornerBend` monotonically toward `1` as the pointer moves upward so the bottom-right corner curls deeper until reaching the cone model's bending limit, rather than flipping to cylinder or top-corner cone

#### Scenario: Grabbing a page feature and moving vertically makes it follow the pointer within geometric limits

- **WHEN** the user grabs a point on the right side of the page and moves their pointer upward or downward mid-turn in `curl` mode
- **THEN** `conicContribution` and `cornerBend` update continuously with smooth asymptotic paper resistance so the deformed grabbed point follows vertical pointer movement gradually and saturates softly at the geometric limit without interrupting native scroll

#### Scenario: Throttled mobile touch updates animate smoothly without discrete jumps

- **WHEN** native scroll throttling on mobile delivers transverse `touchmove` samples intermittently during an active turn
- **THEN** the rendered `(conicContribution, cornerBend)` eases smoothly across intermediate display frames rather than snapping discontinuously on each input sample, and finishes converging cleanly after finger release

#### Scenario: Non-pointer navigation defaults to bottom-corner cone curl

- **WHEN** the user navigates via keyboard arrow keys or wheel without a pointer swipe
- **THEN** `curl` mode uses `conicContribution = +1` (the default bottom-corner cone curl)
