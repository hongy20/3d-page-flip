# Spec Delta: css-scroll-state

## RENAMED Requirements
- FROM: ### Requirement: Extensible pure-CSS transition modes (`slide` and `stack`) with JS-free switching
- TO: ### Requirement: Extensible transition modes (`curl`, `slide`, and `stack`) with JS-free switching

## MODIFIED Requirements

### Requirement: Extensible transition modes (`curl`, `slide`, and `stack`) with JS-free switching
The reader SHALL support transition modes switched via native `<input type="radio" name="mode">` controls and CSS `:has()` without JS control listeners: `curl` (default 3D cone page curl), `slide` (horizontal slide), and `stack` (smaller pages above larger ones, top page sliding left while the centered underneath page rises/recedes along Z). Additional modes SHALL be addable without modifying scroll logic.

#### Scenario: Curl mode is selected by default
- **WHEN** the reader loads initially without user mode selection
- **THEN** the `curl` radio option is checked by default

#### Scenario: Forward swipe in `stack` mode
- **WHEN** `stack` mode is selected and the user swipes forward from page `i` to page `i + 1`
- **THEN** page `i` renders on top of page `i + 1` and slides out to the left while page `i + 1` stays horizontally centered underneath and rises forward along the z-axis from behind until settled

#### Scenario: Backward swipe in `stack` mode
- **WHEN** `stack` mode is selected and the user swipes backward from page `i + 1` to page `i`
- **THEN** page `i` renders on top of page `i + 1` and slides in from the left over page `i + 1`, which stays horizontally centered and recedes back along the z-axis behind page `i`

#### Scenario: Mode switching between `slide` and `stack` uses zero JS
- **WHEN** the user activates the `slide` or `stack` radio control
- **THEN** the transition behavior switches immediately via CSS `:has()` with zero JavaScript event listeners or DOM style mutations

#### Scenario: Mode switching to `curl` uses zero JS
- **WHEN** the user activates the `curl` radio control
- **THEN** the transition behavior switches to `curl` immediately via CSS `:has()` with zero JavaScript control event listeners or DOM scroll mutations
