# Spec Delta: motion-lighting

## Purpose

Maps opt-in browser device orientation readings (`DeviceOrientationEvent`) into bounded `u_lightPos` coordinates for WebBook 3D's Lambert paper shading while preserving idle-when-stationary rendering and native CSS scroll physics.

## ADDED Requirements

### Requirement: Opt-in browser orientation mapping to `u_lightPos`

The application SHALL provide an opt-in `Motion light` toggle in `.controls` (off by default) that listens to `DeviceOrientationEvent` (`beta` and `gamma` tilt) when enabled and maps device tilt into 3D light coordinates passed to the `cone-page-curl` renderer's `u_lightPos` uniform.

#### Scenario: Tilting an enabled device shifts page shading

- **WHEN** the `Motion light` toggle is enabled and `DeviceOrientationEvent` reports a device tilt
- **THEN** `u_lightPos` updates proportionally to the tilt angle and updates the curled page's Lambert shading

### Requirement: Bounded light coordinates, smoothing, and deadband gating

The motion-to-light mapper SHALL clamp tilt inputs and output `u_lightPos` to finite physical bounds (`z > 0` in front of the page), apply low-pass smoothing and a Euclidean deadband threshold, and pause updates while `document.hidden` is true so stationary sensor noise triggers zero uniform updates or redraws.

#### Scenario: Stationary device noise does not wake the render loop

- **WHEN** motion-driven lighting is enabled on a stationary device whose sensor readings fluctuate within the deadband threshold
- **THEN** `u_lightPos` remains unchanged and the WebGL render loop issues zero draw calls

### Requirement: Permission handling and silent fallback to static default lighting

When `DeviceOrientationEvent.requestPermission` is present, enabling `Motion light` SHALL invoke it from the toggle gesture; when sensors are unsupported, denied, disabled, or on desktop without inertial sensors, the application SHALL fall back silently to the static default `u_lightPos` with no pointer-parallax fallback.

#### Scenario: Unsupported, denied, or desktop browser falls back cleanly

- **WHEN** the browser lacks orientation events, the user denies sensor permission, or the user is on desktop without inertial sensors
- **THEN** no unhandled exceptions occur and the renderer continues shading with the static default `u_lightPos`

### Requirement: Zero interference with native CSS scroll navigation or `--progress`

Motion and orientation adapters SHALL NOT modify scroll position, register touch/wheel/pointer navigation listeners, or alter CSS `--progress` state.

#### Scenario: Motion lighting leaves scroll physics untouched

- **WHEN** motion-driven lighting is active while the user scrolls or swipes pages
- **THEN** scroll snapping and CSS `--progress` behave identically to static lighting
