# Spec Delta

## ADDED Requirements

### Requirement: Intuitive bending-edge tracking during curl drag

In `curl` mode, the visible bending crease SHALL track the user's horizontal pointer/scroll progression across the page width intuitively without breaking paper isometry or the flat rest identity (`p = 0`), choosing between Option 1 (`--progress`-linear crease) and Option 2 (active pointer-X-tracked crease) after hands-on Chrome evaluation.

#### Scenario: Bending crease tracks horizontal drag across the page

- **WHEN** the user drags horizontally across a page in `curl` mode
- **THEN** the bending crease advances smoothly with the drag motion and returns to flat (`p = 0`) when settled without stretching or distortion

## MODIFIED Requirements

### Requirement: Read-only CSS `--progress` bridge and change-gated uniform updates

Once per active animation frame, JavaScript SHALL read CSS `--progress` via CSSOM on active/visible `.page` elements and redraw only when `--progress`, `paint`, resize, `conicContribution`, drag crease offset, or light config changes. Passive Pointer Events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) SHALL only read pointer coordinates for curl shape tracking and SHALL NOT drive scroll or DOM movement.

#### Scenario: Uniforms update at 60 fps on `--progress` change and idle when stationary

- **WHEN** active page `--progress` or live pointer curl state changes during user scrolling or native snap settling
- **THEN** the render loop updates curl uniforms at 60 fps and stops issuing uniform updates or draw calls once state stops changing

### Requirement: Continuous directional curl blending (top cone, cylinder, bottom cone)

The curl renderer SHALL read pointer position via passive Pointer Events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) across mouse, touch, and pen without driving scroll or DOM movement, mapping vertical position continuously to `conicContribution` in `[-1, 1]` between top-corner cone (`-1`), cylinder (`0`), and bottom-corner cone (`+1` default for non-pointer navigation), updating live during vertical drag.

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

#### Scenario: Dragging vertically mid-turn updates cone-to-cylinder ratio live

- **WHEN** the user moves their pointer vertically while dragging a page turn in `curl` mode
- **THEN** `conicContribution` updates continuously in real time, smoothly morphing between top cone, cylinder, and bottom cone without interrupting native scroll

#### Scenario: Non-pointer navigation defaults to bottom-corner cone curl

- **WHEN** the user navigates via keyboard arrow keys or wheel without a pointer swipe
- **THEN** `curl` mode uses `conicContribution = +1` (the default bottom-corner cone curl)
