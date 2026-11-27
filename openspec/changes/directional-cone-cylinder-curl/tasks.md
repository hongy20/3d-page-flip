# Tasks

## 1. Resolve Open Questions & Constraints

- [ ] 1.1 Resolve `OQ-CURL-1` (discrete 3-zone switching vs continuous vertical blending across `top`, `middle`, and `bottom`) and update `AGENTS.md` non-negotiable constraints to permit passive, read-only `pointerdown` Y-zone classification and the extended cone + cylinder curl model.

## 2. CPU Reference Math & Shader Extensions

- [ ] 2.1 Extend `src/gl/coneMath.ts` with top-corner Y-reflected cone deformation, cancellation-safe isometric cylindrical curl (`kappa`), and `curlParams(p, zone)` mapping; add unit tests in `src/gl/coneMath.test.ts` verifying flat identity at `p = 0`, finite vertices across `p in [-1, 1]`, and isometric distance/arc-length invariants (`npm test`).
- [ ] 2.2 Port the Y-reflected top-cone and cylinder formulas into `src/shaders/cone.vert.glsl` using dedicated uniforms (`u_flipY`, `u_cylKappa`, `u_cylBlend`, `u_pageHeight`) and verify `npm run build` succeeds.

## 3. Passive Zone Observer & Renderer Wiring

- [ ] 3.1 Add a passive, read-only `pointerdown` Y-zone listener on `.book` in `src/gl/renderer.ts` (latching zone per active turn, defaulting to `bottom` for keyboard/wheel navigation) and pass the curl-zone uniforms to the shader without modifying scroll offsets or DOM styles, verifying `npm run build` and `npm test` pass.

## 4. Verification

- [ ] 4.1 Verify manually in Chrome 158+ (`curl` mode): swiping in the top third curls downward from the upper corner, swiping in the middle third curls evenly like a cylinder, swiping in the bottom third curls upward from the lower corner, and keyboard arrow navigation defaults to the bottom-corner curl.

## Workflow follow-up

- Sync delta specs and archive `directional-cone-cylinder-curl` via `openspec-archive-change` after implementation and verification are complete.
