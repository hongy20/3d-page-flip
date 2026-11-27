# Design: Motion-Driven Physical Lighting

## Context

See [proposal.md](proposal.md) for motivation. The `cone-vertex-shader` change exposes a configurable `u_lightPos` uniform and `setLightPos()` handle in `src/gl/renderer.ts` and `src/shaders/page.frag.glsl` with a static default. This change drives `u_lightPos` from `DeviceOrientationEvent` while preserving Dropp's idle-when-stationary GPU loop and zero-JS scroll physics.

## Goals / Non-Goals

**Goals:**

- Isolate sensor math (`motionToLightPos`) and smoothing/deadband logic in a pure, unit-tested TypeScript module (`src/gl/motionLighting.ts`) with zero DOM/WebGL imports.
- Smooth noisy `DeviceOrientationEvent` (`beta`/`gamma`) streams and apply an epsilon deadband plus `document.hidden` pausing so stationary devices remain idle.
- Gate activation behind an opt-in `Motion light` pill toggle in `.controls` that cleanly handles `DeviceOrientationEvent.requestPermission()` and falls back silently on desktop or denied permissions.

**Non-Goals:**

- Changing Hong, Card & Chen cone math or `cone.vert.glsl`.
- Dynamic shadows, specular highlights, desktop pointer-parallax fallback, or tilt-to-scroll interactions.

## Decisions

1. **`DeviceOrientationEvent` (`beta`/`gamma`) Adapter + Pure `motionToLightPos` Mapper (`OQ-11` resolved)**
   - _Decision_: Separate `DeviceOrientationEvent` (`beta`/`gamma`) acquisition from coordinate mapping (`src/gl/motionLighting.ts`), clamping tilt angles into bounded offsets around `DEFAULT_LIGHT_POS` with `lightPos.z > 0`.
   - _Rationale_: Works out of the box on Chrome Android and Chrome DevTools Sensors panel, and enables deterministic Vitest verification without physical mobile hardware.

2. **Parameterized Low-Pass Smoothing + Deadband Change-Gating + Visibility Pause (`OQ-13` resolved)**
   - _Decision_: Apply exponential moving average smoothing (`alpha`) and only invoke `renderer.setLightPos(...)` when `distance(nextLight, committedLight) > epsilon`, pausing updates when `document.hidden` is true. Define named preset constants in `src/gl/motionLighting.ts` (`balanced`: `alpha = 0.15, epsilon = 0.015` as default; `snappy`: `alpha = 0.25, epsilon = 0.008`; `gentle`: `alpha = 0.08, epsilon = 0.03`) so we can compare them during verification and lock in the best feel/performance balance without adding UI tuning knobs.
   - _Rationale_: Prevents MEMS micro-jitter from triggering continuous WebGL redraws when the device is resting or held steady.

3. **Opt-In `Motion light` Toggle Pill & Permission UX (`OQ-12` resolved)**
   - _Decision_: Add an opt-in `Motion light` toggle pill inside `.controls` (off by default). Toggling it on provides the user gesture needed for `DeviceOrientationEvent.requestPermission()` on platforms that require it; if denied or unsupported, revert/disable gracefully and keep default lighting.
   - _Rationale_: Avoids unsolicited permission prompts or unexpected shading shifts while matching `.controls` styling.

4. **Static Desktop Fallback (`OQ-14` resolved)**
   - _Decision_: On desktop browsers without inertial sensors (or when `Motion light` is off/denied/unsupported), stay purely at `DEFAULT_LIGHT_POS` with zero extra pointer listeners; desktop verification uses Chrome DevTools Sensors panel.
   - _Rationale_: Preserves Dropp's strict zero-pointer-listener discipline and avoids mixing mouse movement with scroll interactions.

## Risks / Trade-offs

- **[Risk] Continuous sensor jitter keeps the WebGL canvas redrawing** → Mitigation: Tunable `alpha` / `epsilon` presets (`balanced` default), `document.hidden` listener pause, and `LIGHT_CHANGE_EPS` guard in `renderer.setLightPos()`.
- **[Risk] Inline SVG `<style>` or `controls` width on narrow mobile viewports** → Mitigation: Keep the `Motion light` pill concise inside `.controls` with `flex-wrap` / compact spacing if needed.

## Open Questions

None (`OQ-11`–`OQ-14` resolved).
