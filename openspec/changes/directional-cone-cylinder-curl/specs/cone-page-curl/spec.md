# Spec Delta

## ADDED Requirements

### Requirement: Continuous directional curl blending (top cone, cylinder, bottom cone)

The curl renderer SHALL observe the vertical start position of a pointer or touch gesture via a passive, read-only listener (without driving scroll, momentum, or DOM movement) and map it to a continuous `conicContribution` parameter in `[-1, 1]`, smoothly blending between a Y-reflected top-corner cone (`-1`), an isometric cylinder (`0`), and the default bottom-corner cone (`+1`, including non-pointer navigation).

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

#### Scenario: Non-pointer navigation defaults to bottom-corner cone curl

- **WHEN** the user navigates via keyboard arrow keys or wheel without a pointer swipe
- **THEN** `curl` mode uses `conicContribution = +1` (the default bottom-corner cone curl)

### Requirement: Isometric cylinder deformation and vertical cone reflection invariants

Both the vertically reflected top-corner cone and cylindrical deformations SHALL preserve paper dimensions (isometry), produce finite coordinates across `p` and `conicContribution` in `[-1, 1]`, equal the flat plane at `p = 0`, and be verified by unit tests against the CPU reference port.

#### Scenario: Top-cone, cylinder, and blended CPU reference ports pass identity and isometric tests

- **WHEN** the unit test suite evaluates the CPU reference port across `p` and `conicContribution` in `[-1, 1]`
- **THEN** all deformed vertices are finite, `p = 0` equals the flat plane `P = (P_x, P_y, 0)`, and isometric distance / arc-length invariants hold at `conicContribution` in `{-1, 0, +1}` within floating-point tolerance

## MODIFIED Requirements

### Requirement: Read-only CSS `--progress` bridge and change-gated uniform updates

Once per active animation frame, JavaScript SHALL read CSS `--progress` on active/visible `.page` element(s) via CSSOM (`computedStyleMap().get('--progress')` / `getComputedStyle`, and nothing else as animation state) and update uniforms and draw only when `--progress`, `paint`, resize, `conicContribution`, or light config changed. Any passive pointer listener SHALL only read vertical start position and SHALL NOT drive scroll or DOM movement.

#### Scenario: Uniforms update at 60 fps on `--progress` change and idle when stationary

- **WHEN** active page `--progress` changes during user scrolling or native snap settling
- **THEN** the render loop updates curl uniforms 1:1 with `--progress` at 60 fps and stops issuing uniform updates or draw calls once `--progress` stops changing
