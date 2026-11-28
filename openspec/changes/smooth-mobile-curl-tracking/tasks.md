# Tasks

## 1. Smooth Curl Control & Single-Pass Solver (`coneMath` + `renderer`)

- [ ] 1.1 Add pure `smoothCurlControl` (frame-delta exponential damping with `CURL_SMOOTHING_TAU_MS` and epsilon snap) and reusable base-cone solve API in `src/gl/coneMath.ts`, plus unit tests in `src/gl/coneMath.test.ts` verifying convergence, `dt` clamping, `dt = 0` identity, monotonic step smoothing, and exact numerical equivalence between deduplicated and standalone `coneParams`/`cylKappa`/`solveVerticalCurlControl`.
- [ ] 1.2 Integrate target/smoothed `(conicContribution, cornerBend)` state and single-pass base-cone evaluation in `src/gl/renderer.ts` (instant anchor on new turn start, continuous rAF convergence until within `CONIC_CHANGE_EPS` including across `endDrag()`, zero draw calls when settled) and verify `npm test` passes.

## 2. Mobile Rendering & Gesture Hygiene (`planeGeometry`, `cone.vert.glsl`, `renderer`, `style.css`)

- [ ] 2.1 Add a flat-page fast path (2-triangle flat quad mesh in `src/gl/planeGeometry.ts` and flat-bypass uniform in `src/shaders/cone.vert.glsl` + `src/gl/renderer.ts`) for the flat underlying page (`baseIdx`), settled pages, and `slide`/`stack` modes, preserving exact pixel alignment and diffuse lighting.
- [ ] 2.2 Cache `canvasRect`, `sampleRect`, and page CSS dimensions on resize/orientation change in `src/gl/renderer.ts` to remove per-frame synchronous `getBoundingClientRect()` and `getComputedStyle()` thrashing during drag.
- [ ] 2.3 Set `overscroll-behavior: none` (both `x` and `y`) on `html, body` and `.book` in `src/style.css` so downward drags in horizontal mode do not trigger Android pull-to-refresh or vertical overscroll.

## 3. Verification

- [ ] 3.1 Run `npm run lint`, `npm run format:check`, `npm test`, and `npm run build` and verify all exit `0`.
- [ ] 3.2 Perform manual real-phone verification in Chrome 157+ on Android: drag horizontally and move finger up/down in both horizontal and vertical curl modes, confirm smooth bending transitions without ~5 Hz jumps or pull-to-refresh interference, tune `CURL_SMOOTHING_TAU_MS` if needed, and verify idle-when-settled behavior.

## Workflow follow-up

- Sync delta specs and archive `smooth-mobile-curl-tracking` via `openspec-archive-change` after implementation and verification are complete.
