# Design: Motion-Driven Physical Lighting

## Context

See `proposal.md` for motivation. Phase 4 (`phase-4-cone-vertex-shader`) exposes a configurable `u_lightPos` uniform in `src/gl/renderer.ts` and `src/shaders/page.frag.glsl` with a static default. This change explores driving `u_lightPos` from browser motion/orientation APIs while preserving WebBook 3D's idle-when-stationary GPU loop and zero-JS scroll physics.

## Goals / Non-Goals

**Goals:**
- Isolate sensor math (`motionToLightPos`) in a pure, unit-tested TypeScript module with zero DOM/WebGL imports.
- Smooth noisy sensor streams and apply an epsilon deadband so stationary devices remain idle.
- Integrate cleanly with Phase 4's `u_lightPos` setter without modifying cone geometry or scroll behavior.

**Non-Goals:**
- Changing Hong, Card & Chen cone math or `cone.vert.glsl`.
- Dynamic shadows, specular highlights, or tilt-to-scroll interactions.

## Decisions

1. **Pure `motionToLightPos` Mapper + Low-Pass Smoothing**
   - *Decision*: Separate sensor event acquisition from coordinate mapping (`src/gl/motionLighting.ts`), clamping tilt angles (e.g., `beta`/`gamma` or gravity vector components) into bounded offsets around the default `u_lightPos` with `lightPos.z > 0`.
   - *Rationale*: Enables deterministic Vitest verification of bounds, clamping, and deadband filtering without physical mobile hardware.

2. **Deadband Change-Gating for Idle GPU Loop**
   - *Decision*: Apply exponential moving average smoothing and only invoke the renderer's `setLightPosition(x, y, z)` when `distance(nextLight, committedLight) > epsilon` (`OQ-13`).
   - *Rationale*: Prevents MEMS accelerometer/gyroscope micro-jitter from triggering continuous 60 fps WebGL redraws when the device is resting on a table or held steady.

3. **Graceful Static Fallback**
   - *Decision*: Treat missing APIs, denied permissions, or inactive opt-in state as a no-op that preserves the Phase 4 default `u_lightPos` (with optional desktop fallback to be decided in `OQ-14`).

## Risks / Trade-offs

- **[Risk] Continuous sensor jitter keeps the WebGL canvas redrawing** → Mitigation: Tune low-pass alpha and deadband epsilon (`OQ-13`) and pause listeners when `document.hidden` is true.
- **[Risk] Different browsers expose different orientation axes or permission APIs** → Mitigation: Resolve `OQ-11` (`DeviceOrientationEvent` vs `DeviceMotionEvent` vs `GravitySensor`) and `OQ-12` (permission trigger UX) before writing the adapter.

## Open Questions

Must be resolved with the user before implementation begins:

- **`OQ-11` (Sensor API choice)**: Use `DeviceOrientationEvent` (`beta`/`gamma` tilt), `DeviceMotionEvent` (`accelerationIncludingGravity`), or `GravitySensor` (Generic Sensor API, Chrome)? Status: **Open**.
- **`OQ-12` (Opt-in & permission UX)**: Should motion lighting be toggled by a new pill control in `.controls` (which also serves as the user gesture for `DeviceOrientationEvent.requestPermission()` where required), or auto-enabled when permitted? Status: **Open**.
- **`OQ-13` (Smoothing & deadband tuning)**: Preferred responsiveness vs battery/idle tradeoff (e.g., low-pass alpha and minimum Euclidean delta before scheduling a WebGL redraw)? Status: **Open**.
- **`OQ-14` (Desktop fallback)**: On desktop browsers without inertial sensors, stay purely static at default `u_lightPos`, or add an optional pointer/parallax simulation? Status: **Open**.
