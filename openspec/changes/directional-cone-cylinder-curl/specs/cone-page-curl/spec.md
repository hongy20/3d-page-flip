# Spec Delta

## ADDED Requirements

### Requirement: Swipe-zone directional curl (top cone, middle cylinder, bottom cone)

The curl renderer SHALL observe the vertical start position of a pointer or touch gesture via a passive, read-only listener (without driving scroll position, momentum, or DOM movement) and classify it into `top`, `middle`, or `bottom` zones:

- `bottom` (default, including non-pointer keyboard/wheel navigation): lower-corner Hong, Card & Chen cone curl.
- `top`: vertically mirrored (upside-down) Hong, Card & Chen cone curl lifting the upper corner first.
- `middle`: isometric cylindrical curl rolling evenly about an axis parallel to the binding edge.

#### Scenario: Swiping in the bottom zone produces bottom-corner cone curl

- **WHEN** the user initiates a swipe in the bottom zone of the page in `curl` mode
- **THEN** the page curls upward from the lower outer corner using the bottom-apex cone model

#### Scenario: Swiping in the top zone produces upside-down top-corner cone curl

- **WHEN** the user initiates a swipe in the top zone of the page in `curl` mode
- **THEN** the page curls downward from the upper outer corner using the vertically mirrored cone model

#### Scenario: Swiping in the middle zone produces cylindrical curl

- **WHEN** the user initiates a swipe in the middle zone of the page in `curl` mode
- **THEN** the page rolls evenly along a cylinder parallel to the binding edge

#### Scenario: Non-pointer navigation defaults to bottom-corner cone curl

- **WHEN** the user navigates via keyboard arrow keys or wheel without a pointer swipe
- **THEN** `curl` mode uses the default bottom-corner cone curl

### Requirement: Isometric cylinder deformation and vertical cone reflection invariants

Both the vertically reflected top-corner cone deformation and the cylindrical deformation SHALL preserve paper dimensions (isometric), produce finite coordinates across `p in [-1, 1]`, equal the flat plane at `p = 0`, and be verified by unit tests against the CPU reference port.

#### Scenario: Top-cone and cylinder CPU reference ports pass flat-identity and isometric unit tests

- **WHEN** the unit test suite evaluates the CPU reference port across `top`, `middle`, and `bottom` curl zones over `p in [-1, 1]`
- **THEN** all deformed vertices are finite, `p = 0` equals the flat plane `P = (P_x, P_y, 0)`, and isometric distance / arc-length invariants hold within floating-point tolerance

## MODIFIED Requirements

### Requirement: Read-only CSS `--progress` bridge and change-gated uniform updates

Once per active animation frame, JavaScript SHALL read CSS `--progress` on active/visible `.page` element(s) via CSSOM (`computedStyleMap().get('--progress')` / `getComputedStyle`, and nothing else as animation state) and update uniforms and draw only when `--progress`, `paint`, resize, curl zone, or light config changed. Any passive pointer/touch listener SHALL only read vertical gesture start position to select curl zone and SHALL NOT drive scroll or DOM movement.

#### Scenario: Uniforms update at 60 fps on `--progress` change and idle when stationary

- **WHEN** active page `--progress` changes during user scrolling or native snap settling
- **THEN** the render loop updates cone uniforms 1:1 with `--progress` at 60 fps and stops issuing uniform updates or draw calls once `--progress` stops changing
