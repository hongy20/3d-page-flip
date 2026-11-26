# Spec Delta: css-scroll-state

## Purpose

Exposes a declarative, normalized position state `--progress` in `[-1, 1]` on every page element using CSS `@property` and native `view(inline)` scroll-driven animations with zero JavaScript, powering extensible pure-CSS transition modes (`slide`, `stack`) and a JS-free debug readout.

## ADDED Requirements

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

### Requirement: Extensible pure-CSS transition modes (`slide` and `stack`) with JS-free switching
The reader SHALL support pure-CSS transition modes switched solely via native `<input type="radio" name="mode">` controls and CSS `:has()` without JavaScript: `slide` (default horizontal slide) and `stack` (smaller page numbers stacked above larger ones, with the top page sliding out/in from the left over a stationary underneath page). Additional modes SHALL be addable without modifying scroll logic.

#### Scenario: Forward swipe in `stack` mode
- **WHEN** `stack` mode is selected and the user swipes forward from page `i` to page `i + 1`
- **THEN** page `i` renders on top of page `i + 1` and slides out to the left while page `i + 1` stays stationary underneath until settled

#### Scenario: Backward swipe in `stack` mode
- **WHEN** `stack` mode is selected and the user swipes backward from page `i + 1` to page `i`
- **THEN** page `i` renders on top of page `i + 1` and slides in from the left over page `i + 1`, which stays stationary underneath

#### Scenario: Mode switching between `slide` and `stack` uses zero JS
- **WHEN** the user activates the `slide` or `stack` radio control
- **THEN** the transition behavior switches immediately via CSS `:has()` with zero JavaScript event listeners or DOM style mutations

### Requirement: Pure-CSS debug readout for `--progress`
A debug view toggled by a JS-free `<input type="checkbox" name="debug">` control and CSS `:has()` SHALL display each page's live `--progress` value on screen for visual verification.

#### Scenario: On-screen debug readout reflects live scroll state
- **WHEN** the debug checkbox is checked and the user scrolls across pages
- **THEN** each page renders its current `--progress` value on screen updating in real time without JavaScript listeners

### Requirement: Zero JavaScript in Phase 2
Phase 2 SHALL NOT add any JavaScript for computing `--progress`, driving transitions, switching modes, toggling debug output, or handling scroll/input events (`src/main.ts` remains stylesheet-import-only in Phase 2; reading `--progress` via CSSOM for WebGL uniforms is deferred to Phase 4).

#### Scenario: Zero JavaScript interaction in Phase 2
- **WHEN** `src/` is inspected after Phase 2 implementation
- **THEN** no JavaScript reads `getComputedStyle`/`computedStyleMap` for `--progress`, sets `--progress`, mutates styles, or registers scroll/input/control event listeners
