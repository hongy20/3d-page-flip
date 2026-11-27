# Spec Delta

## ADDED Requirements

### Requirement: Extensible transition modes (`slide`, `stack`, and `curl`) with JS-free switching
The reader SHALL support transition modes switched via native `<input type="radio" name="mode">` controls and CSS `:has()` without JS control listeners, ordered `Slide`, `Stack`, `Curl` in `.controls`: `slide` (default horizontal slide), `stack` (smaller pages above larger ones, top page sliding left while the centered underneath page rises/recedes along Z), and `curl` (3D cone page curl). Additional modes SHALL be addable without modifying scroll logic.

#### Scenario: Slide mode is selected by default
- **WHEN** the reader loads initially without user mode selection
- **THEN** the `slide` radio option is checked by default

#### Scenario: Mode controls appear in Slide, Stack, Curl order
- **WHEN** the reader controls toolbar renders
- **THEN** the transition mode radio options appear in order `Slide`, `Stack`, `Curl`, with `Curl` as the last option

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

## MODIFIED Requirements

### Requirement: Zero JavaScript for CSS scroll state and controls
The CSS scroll state engine SHALL NOT use JavaScript to compute or mutate `--progress`, drive pure-CSS transitions, switch transition modes, or handle scroll/input/control events.

#### Scenario: Zero JavaScript handles scroll state or controls
- **WHEN** `src/` is inspected for CSS scroll state or mode switching behavior
- **THEN** no JavaScript sets `--progress`, mutates transition styles, or registers scroll, input, or control event listeners

## REMOVED Requirements

### Requirement: Extensible transition modes (`curl`, `slide`, and `stack`) with JS-free switching
**Reason**: Superseded by `Extensible transition modes (\`slide\`, \`stack\`, and \`curl\`) with JS-free switching`, which makes `slide` the default mode and places `Curl` last in `.controls`.
**Migration**: Reorder the mode radio inputs in `index.html` to `Slide`, `Stack`, `Curl`, move `checked` to `value="slide"`, and update `readActiveMode()` fallback in `src/gl/renderer.ts` to `'slide'`.

### Requirement: Pure-CSS debug readout for `--progress`
**Reason**: The `Debug` checkbox and live `--progress` badge overlay were Phase 2 verification scaffolding and are being removed to keep `.controls` focused on transition modes.
**Migration**: Remove the `debug` checkbox and divider from `index.html` and the associated CSS (`@property --progress-pct`, `.controls__divider`, `.controls__option--toggle:has(:checked)`, `body:has(input[name='debug']:checked)`) from `src/style.css`; inspect `--progress` in Chrome DevTools if needed.
