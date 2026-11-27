# Tasks

## 1. Constraints Update

- [ ] 1.1 Update `AGENTS.md` non-negotiable constraints to permit passive, read-only `pointerdown` Y-position observation (`conicContribution` in `[-1, 1]`) and the extended Hong, Card & Chen cone + Project Austin Part 2 cylinder curl model (`OQ-CURL-1` resolved to continuous blending).

## 2. CPU Reference Math & Shader Extensions

- [ ] 2.1 Extend `src/gl/coneMath.ts` with top-corner Y-reflected cone deformation, cancellation-safe isometric cylindrical curl (`kappa`), and continuous `conicContribution` in `[-1, 1]` blending; add unit tests in `src/gl/coneMath.test.ts` verifying flat identity at `p = 0`, finite vertices across `p` and `conicContribution` in `[-1, 1]`, and isometric distance/arc-length invariants at `conicContribution` in `{-1, 0, +1}` (`npm test`).
- [ ] 2.2 Port the Y-reflected top-cone, cylinder, and continuous `conicContribution` blend into `src/shaders/cone.vert.glsl` using dedicated uniforms (`u_conicContribution`, `u_cylKappa`, `u_pageHeight`) and verify `npm run build` succeeds.

## 3. Passive Vertical Observer & Renderer Wiring

- [ ] 3.1 Add a passive, read-only `pointerdown` Y-position listener on `.book` in `src/gl/renderer.ts` computing continuous `conicContribution` in `[-1, 1]` (latched per active turn, defaulting to `+1` for keyboard/wheel navigation) and passing curl uniforms to the shader without modifying scroll offsets or DOM styles, verifying `npm run build` and `npm test` pass.

## 4. Verification

- [ ] 4.1 Verify manually in Chrome 158+ (`curl` mode): swiping near the top edge curls downward from the upper corner, swiping near the vertical center curls evenly like a cylinder, swiping near the bottom edge curls upward from the lower corner, intermediate positions blend smoothly, and keyboard arrow navigation defaults to bottom-corner curl.

## Workflow follow-up

- Sync delta specs and archive `directional-cone-cylinder-curl` via `openspec-archive-change` after implementation and verification are complete.
