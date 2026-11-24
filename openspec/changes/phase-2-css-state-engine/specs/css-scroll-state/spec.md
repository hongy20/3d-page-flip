# Spec Delta: css-scroll-state

## Purpose

Exposes a declarative, normalized position state `--progress` in `[-1, 1]` on every page element using CSS `@property` and native `view(inline)` scroll-driven animations with zero JavaScript (`CSS-01`..`CSS-07`, `ARCH-05`).

## ADDED Requirements

### Requirement: Registered custom property `--progress` (CSS-01, ARCH-05)
`--progress` SHALL be registered in CSS via `@property` with `syntax: '<number>'`, `inherits: true`, and `initial-value: 0` so that the browser interpolates it as a floating-point number and descendants inherit it.

#### Scenario: Custom property inherits and interpolates numerically
- **WHEN** a `.page` element animates `--progress` between `-1` and `1`
- **THEN** child elements inside `.page` inherit the live floating-point `--progress` value

### Requirement: Scroll-driven `view(inline)` timeline per page (CSS-02, CSS-03, CSS-04)
Each `.page` SHALL run a linear keyframe animation from `--progress: -1` to `--progress: 1` with `animation-timeline: view(inline)` and `animation-fill-mode: both`, configured so `--progress` is `-1` when one full page-width to the right of its snapped position, `0` when snapped in the viewport, and `1` when one full page-width to the left, remaining clamped to `[-1, 1]` outside that range. The sign convention SHALL be documented in CSS comments.

#### Scenario: Snapped and neighbor pages report exact boundary values
- **WHEN** a page is settled at its snapped position in the viewport
- **THEN** the snapped page has `--progress = 0`, its immediate right neighbor has `--progress = -1`, and its immediate left neighbor has `--progress = 1`

#### Scenario: Continuous linear progression during mid-scroll drag
- **WHEN** the scroller is dragged halfway between page `i` and page `i + 1`
- **THEN** `--progress` changes continuously and linearly with scroll position and the two visible adjacent pages always differ by `1`

### Requirement: Pure-CSS debug readout for `--progress` (CSS-05)
A debug view (toggled by a URL parameter or a CSS class in markup, without JS event listeners) SHALL display each page's live `--progress` value on screen for visual verification.

#### Scenario: On-screen debug readout reflects live scroll state
- **WHEN** the debug view is active and the user scrolls across pages
- **THEN** each page renders its current `--progress` value on screen updating in real time without JavaScript listeners

### Requirement: Optional DOM-side visuals and zero-JS access to `--progress` (CSS-06, CSS-07)
`--progress` MAY drive DOM-side visual treatments (such as hiding/fading the flat DOM page during a 3D turn, pending `OQ-02`), and no JavaScript code SHALL read or write `--progress`.

#### Scenario: Zero JavaScript interaction with `--progress`
- **WHEN** `src/` is inspected after Phase 2 implementation
- **THEN** no JavaScript reads `getComputedStyle` for `--progress`, sets `--progress`, or registers scroll/input event listeners
