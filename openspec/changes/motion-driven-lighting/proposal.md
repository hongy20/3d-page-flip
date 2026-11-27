# Proposal: Motion-Driven Physical Lighting

## Why

The `cone-page-curl` renderer introduces Lambert diffuse shading on the curled 3D page driven by a configurable `u_lightPos` uniform. Using `DeviceOrientationEvent` tilt readings to dynamically update `u_lightPos` as a user tilts their mobile device makes the paper curl feel physically grounded in the real world.

## What Changes

- Add an opt-in `Motion light` toggle pill in `.controls` (off by default, serving as the user gesture for `DeviceOrientationEvent.requestPermission()` where required) that reads `DeviceOrientationEvent` (`beta`/`gamma` tilt) and maps it through a pure, bounded `motionToLightPos` mapper to update the renderer's `u_lightPos` uniform (`OQ-11`, `OQ-12` resolved).
- Apply configurable low-pass smoothing and Euclidean deadband gating (pausing listeners when `document.hidden` is true), starting with a balanced default (`alpha = 0.15`, `epsilon = 0.015`) while comparing named presets (`balanced` vs `snappy` / `gentle`) during verification to lock in the best feel and idle GPU behavior without exposing tuning knobs in the UI (`OQ-13` resolved).
- Fall back silently to the static default `u_lightPos` when sensors are unavailable, denied, or on desktop browsers without inertial sensors — zero pointer-parallax fallback (`OQ-14` resolved).

### Out of Scope

- Altering cone deformation math, scroll-snap physics, or CSS `--progress` state.
- Cast shadows, environment maps, desktop pointer-parallax lighting, or non-lighting motion interactions (e.g., tilt-to-scroll).

## Capabilities

### New Capabilities

- `motion-lighting`: Opt-in `DeviceOrientationEvent` adapter with pure bounded `motionToLightPos` mapping, low-pass smoothing/deadband gating, permission handling, and static-light fallback feeding `u_lightPos`.

### Modified Capabilities

<!-- None -->

## Impact

- **Files created/affected**: `index.html` (or `reader.html` if `book-library` lands first), `src/style.css`, `src/main.ts`, `src/gl/motionLighting.ts` (pure mapper + presets + `DeviceOrientationEvent` adapter), `src/gl/motionLighting.test.ts`, and `src/gl/renderer.ts` (if any additional hook is needed).
- **Dependencies**: Zero new runtime dependencies; unit-tested with `vitest`.
- **Open Questions**: None (`OQ-11`–`OQ-14` resolved).
