# Spec Delta

## ADDED Requirements

### Requirement: Intuitive bending-edge tracking during curl drag

In `curl` mode, `coneParams(p)` and `cylKappa(p)` SHALL calibrate `(u_theta, u_Ay, u_rho, u_cylKappa)` against CSS `--progress` so the visible bending crease sweeps proportionally across `[pageWidth, 0]` over `|p| in [0, 0.96]` (staying near mid-page at `|p| = 0.5`) without breaking paper isometry or the flat rest identity (`p = 0`).

#### Scenario: Bending crease tracks horizontal drag across the page

- **WHEN** the user drags horizontally across a page in `curl` mode
- **THEN** the bending crease advances linearly across the page width with `--progress` and returns to flat (`p = 0`) when settled without stretching or distortion

## MODIFIED Requirements

### Requirement: Read-only CSS `--progress` bridge and change-gated uniform updates

Once per active animation frame, JavaScript SHALL read CSS `--progress` via CSSOM on active/visible `.page` elements and redraw only when `--progress`, `paint`, resize, `conicContribution`, `cornerBend`, or light config changes. Passive Pointer Events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`, with passive touch fallback during native scroll) SHALL only read pointer coordinates for curl shape tracking and SHALL NOT drive scroll or DOM movement.

#### Scenario: Uniforms update at 60 fps on `--progress` change and idle when stationary

- **WHEN** active page `--progress` or live pointer curl state changes during user scrolling or native snap settling
- **THEN** the render loop updates curl uniforms at 60 fps and stops issuing uniform updates or draw calls once state stops changing

### Requirement: Continuous directional curl blending (top cone, cylinder, bottom cone)

The curl renderer SHALL read pointer position via passive Pointer Events (with passive touch fallback during native scroll) without driving scroll or DOM movement, anchoring the initial curl corner from the grab height (`conicContribution` in `[-1, 1]`, defaulting to `+1` for non-pointer navigation) and solving live vertical displacement into `conicContribution` and `cornerBend` in `[0, 1]` so the grabbed point tracks the pointer vertically within isometric cone and cylinder limits.

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

#### Scenario: Non-pointer navigation defaults to bottom-corner cone curl

- **WHEN** the user navigates via keyboard arrow keys or wheel without a pointer swipe
- **THEN** `curl` mode uses `conicContribution = +1` (the default bottom-corner cone curl)
