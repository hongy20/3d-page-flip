# Tasks

## 1. Live Pointer Tracking & Evaluable Crease Prototypes

- [x] 1.1 Update `src/gl/renderer.ts` (and pure helpers in `src/gl/coneMath.ts` + `src/gl/coneMath.test.ts`) to track `conicContribution` continuously via passive Pointer Events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) across mouse, touch, and pen, verifying `npm test` passes.
- [x] 1.2 Implement prototype support for both Option 1 (`--progress`-calibrated linear crease) and Option 2 (pointer-X-tracked crease with smooth release easing) in `src/gl/coneMath.ts`, `src/gl/renderer.ts`, and `src/shaders/cone.vert.glsl`, adding unit tests for finite vertices and `p = 0` identity.
- [x] 1.3 Update grabbed-point vertical drag tracking (`solveVerticalCurlControl` + `cornerBend`) in `src/gl/coneMath.ts`, `src/gl/coneMath.test.ts`, and `src/gl/renderer.ts` so a grabbed page point tracks upward/downward pointer movement up to the cone/cylinder geometric limit, verifying `npm test` passes.

## 2. Evaluation, Selection & Verification

- [x] 2.1 Evaluate Option 1 and Option 2 interactively in Chrome (mouse/trackpad and touch emulation), record the chosen option (resolving `OQ-CURL-1`), remove the unselected prototype path, and update `AGENTS.md` with the scoped Pointer Events rule.
- [x] 2.2 Run `npm run lint`, `npm run format:check`, `npm test`, and `npm run build` and verify all exit `0`.

## Workflow follow-up

- Sync delta specs and archive `interactive-curl-tracking` via `openspec-archive-change` after implementation and verification are complete.
