# css-scroll-state Specification

## Purpose

Exposes a declarative, normalized position state `--progress` in `[-1, 1]` on every page element using CSS `@property` and native `view(inline)` scroll-driven animations with zero JavaScript, powering extensible pure-CSS transition modes (`slide`, `stack`) and a JS-free debug readout.

## Requirements

### Requirement: Registered custom property `--progress`

`--progress` SHALL be registered in CSS via `@property` with `syntax: '<number>'`, `inherits: true`, and `initial-value: 0` so that the browser interpolates it as a floating-point number and descendants inherit it.

#### Scenario: Custom property inherits and interpolates numerically

- **WHEN** a `.page` element animates `--progress` between `-1` and `1`
- **THEN** child elements inside `.page` inherit the live floating-point `--progress` value

### Requirement: Scroll-driven `view(inline)` timeline per page

Each `.page` SHALL run a linear keyframe animation from `--progress: -1` to `--progress: 1` with `animation-timeline: view(inline)` and `animation-fill-mode: both`, configured so `--progress` is `-1` when one full page-width to the right of its snapped position, `0` when snapped in the viewport, and `1` when one full page-width to the left, remaining clamped to `[-1, 1]` outside that range. The sign convention SHALL be documented in CSS comments.

#### Scenario: Snapped and neighbor middle pages report exact boundary values

- **WHEN** a middle page is settled at its snapped position in the viewport
- **THEN** the snapped page has `--progress = 0`, its immediate right neighbor has `--progress = -1`, and its immediate left neighbor has `--progress = 1`

#### Scenario: Continuous linear progression during mid-scroll drag

- **WHEN** the scroller is dragged halfway between page `i` and page `i + 1`
- **THEN** `--progress` changes continuously and linearly with scroll position and the two visible adjacent pages always differ by `1`

#### Scenario: First page starts at `0` and ranges over `[0, 1]`

- **WHEN** a multi-page book is at its initial resting scroll position or scrolled away from page 1
- **THEN** the first page starts at `--progress = 0` (never `-1`) and progresses over `[0, 1]` as it exits to the left

#### Scenario: Last page enters from `-1` and ends at `0`

- **WHEN** a multi-page book is scrolled to its final page
- **THEN** the last page enters from `--progress = -1`, settles at `--progress = 0`, and never reaches `1`

#### Scenario: Single-page book resolves `--progress` to `0`

- **WHEN** `.book` contains only one `.page` (`N = 1`) and has zero scrollable overflow
- **THEN** the `view(inline)` timeline is inactive and `--progress` resolves cleanly to `0`

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

### Requirement: Zero JavaScript for CSS scroll state and controls

The CSS scroll state engine SHALL NOT use JavaScript to compute or mutate `--progress`, drive pure-CSS transitions, switch transition modes, or handle scroll/input/control events.

#### Scenario: Zero JavaScript handles scroll state or controls

- **WHEN** `src/` is inspected for CSS scroll state or mode switching behavior
- **THEN** no JavaScript sets `--progress`, mutates transition styles, or registers scroll, input, or control event listeners
