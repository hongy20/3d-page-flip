# Spec Delta

## MODIFIED Requirements

### Requirement: Extensible pure-CSS transition modes (`slide` and `stack`) with JS-free switching
The reader SHALL support pure-CSS transition modes switched solely via native `<input type="radio" name="mode">` controls and CSS `:has()` without JavaScript: `slide` (default horizontal slide) and `stack` (smaller page numbers stacked above larger ones, with the top page sliding out/in from the left while the horizontally centered underneath page rises forward from behind on forward swipes and recedes back behind on backward swipes along the z-axis). Additional modes SHALL be addable without modifying scroll logic.

#### Scenario: Forward swipe in `stack` mode
- **WHEN** `stack` mode is selected and the user swipes forward from page `i` to page `i + 1`
- **THEN** page `i` renders on top of page `i + 1` and slides out to the left while page `i + 1` stays horizontally centered underneath and rises forward along the z-axis from behind until settled

#### Scenario: Backward swipe in `stack` mode
- **WHEN** `stack` mode is selected and the user swipes backward from page `i + 1` to page `i`
- **THEN** page `i` renders on top of page `i + 1` and slides in from the left over page `i + 1`, which stays horizontally centered and recedes back along the z-axis behind page `i`

#### Scenario: Mode switching between `slide` and `stack` uses zero JS
- **WHEN** the user activates the `slide` or `stack` radio control
- **THEN** the transition behavior switches immediately via CSS `:has()` with zero JavaScript event listeners or DOM style mutations
