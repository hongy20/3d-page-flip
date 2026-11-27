# Tasks: Motion-Driven Physical Lighting

## 1. Open Questions & Pure Motion Mapping

- [ ] 1.1 Resolve `OQ-11` (sensor API), `OQ-12` (opt-in & permission UX), `OQ-13` (smoothing & deadband thresholds), and `OQ-14` (desktop fallback) with the user, updating `design.md` and `proposal.md` before coding
- [ ] 1.2 Implement the pure `motionToLightPos` mapper, smoothing filter, and deadband change-gating in `src/gl/motionLighting.ts` and verify bounds (`z > 0`), clamping, and deadband suppression via `vitest` unit tests in `src/gl/motionLighting.test.ts`

## 2. Sensor Adapter & Renderer Integration

- [ ] 2.1 Implement the browser sensor adapter, permission flow, and static fallback wiring to the renderer's `u_lightPos` setter in `src/gl/motionLighting.ts` and `src/gl/renderer.ts` (plus opt-in UI control if selected in `OQ-12`), verifying `npm test` and `npm run build` pass
- [ ] 2.2 Verify on device/Chrome DevTools Sensors panel and desktop fallback that tilting shifts `u_lightPos` shading smoothly, stationary readings produce zero idle redraws, denied/unsupported sensors fall back silently, and native CSS scroll physics remain untouched
