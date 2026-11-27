# Proposal: Motion-Driven Physical Lighting

## Why

Phase 4 introduces Lambert diffuse shading on the curled 3D page driven by a configurable `u_lightPos` uniform. Exploring browser motion and orientation APIs to dynamically update `u_lightPos` as a user tilts or moves their device can make the paper curl feel physically grounded in the real world.

## What Changes

- Add an opt-in browser motion/orientation adapter that reads device tilt/motion (pending `OQ-11`, `OQ-12`) and maps it through a pure, bounded `motionToLightPos` mapper to update Phase 4's `u_lightPos` uniform.
- Apply smoothing and a deadband threshold (pending `OQ-13`) so sensor jitter does not wake the idle WebGL render loop or cause visual flicker.
- Provide a clean permission flow (for platforms such as iOS/Safari-style `requestPermission()` or Permissions API) and graceful silent fallback to the static default `u_lightPos` when sensors are unavailable, denied, or on desktop (pending `OQ-14`).

### Out of Scope

- Altering cone deformation math, scroll-snap physics, or CSS `--progress` state.
- Cast shadows, environment maps, or non-lighting motion interactions (e.g., tilt-to-scroll).

## Capabilities

### New Capabilities
- `motion-lighting`: Opt-in browser motion/orientation adapter with pure bounded `motionToLightPos` mapping, smoothing/deadband gating, permission handling, and static-light fallback feeding `u_lightPos`.

### Modified Capabilities
<!-- None -->

## Impact

- **Files created/affected**: `src/gl/motionLighting.ts` (pure mapper + sensor adapter), `src/gl/motionLighting.test.ts`, `src/gl/renderer.ts` (light position hook), and optional opt-in UI control (`index.html` / `src/style.css`, pending `OQ-12`).
- **Dependencies**: Zero new runtime dependencies; unit-tested with `vitest`.
- **Open Questions**: `OQ-11` (sensor API choice), `OQ-12` (opt-in toggle & permission UX), `OQ-13` (smoothing & deadband thresholds), and `OQ-14` (desktop fallback / optional simulated tilt).
