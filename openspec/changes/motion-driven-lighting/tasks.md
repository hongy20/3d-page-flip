# Tasks: Motion-Driven Physical Lighting

## 1. Pure Motion Mapping & Smoothing Presets

- [ ] 1.1 Implement the pure `motionToLightPos` mapper (`beta`/`gamma` tilt → bounded `u_lightPos` with `z > 0`), parameterized exponential moving average smoothing (with named `balanced`, `snappy`, and `gentle` presets, defaulting to `balanced`), and Euclidean deadband change-gating in `src/gl/motionLighting.ts`, plus unit tests in `src/gl/motionLighting.test.ts` verifying bounds, clamping, smoothing, and deadband suppression (`npm test`).

## 2. Opt-In Control, Orientation Adapter & Verification

- [ ] 2.1 Add the opt-in `Motion light` toggle pill to `.controls` (`index.html` or `reader.html` + `src/style.css`), wire the `DeviceOrientationEvent` (`beta`/`gamma`) adapter, `requestPermission()` handling, `visibilitychange` pause, and static desktop fallback to `renderer.setLightPos(...)` in `src/gl/motionLighting.ts` and `src/main.ts`, verifying `npm run lint`, `npm run format:check`, `npm test`, and `npm run build` pass.
- [ ] 2.2 Verify on mobile device / Chrome DevTools Sensors panel and desktop: compare the `balanced` vs `snappy` / `gentle` presets to lock in the best feel/GPU-idle balance, confirm stationary readings produce zero idle redraws, denied/unsupported/desktop environments stay silently at default `u_lightPos`, and native CSS scroll physics remain untouched.

## Workflow follow-up

- Sync delta specs and archive `motion-driven-lighting` via `openspec-archive-change` after implementation and verification are complete.
