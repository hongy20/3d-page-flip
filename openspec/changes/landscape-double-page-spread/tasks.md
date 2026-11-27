# Tasks

## 1. CSS `display: contents` Compatibility Check

- [ ] 1.1 Verify Chrome 158+ `display: contents` behavior with `view(inline)` timelines (`OQ-SPREAD-1` already resolved: landscape `stack` mode transitions the full 2-page spread as one unit).

## 2. Responsive Spread DOM & CSS

- [ ] 2.1 Group the 18 `.page` elements in `index.html` (or dynamically in `src/main.ts` if `book-library` has landed) into `<section class="spread">` containers (`[spacer, 1]`, `[2, 3]`, ..., `[16, 17]`, `[18, spacer]`).
- [ ] 2.2 Implement `@media (orientation: portrait)` (`display: contents` on `.spread`, `display: none` on `.spread__spacer`, per-page `--progress`) and `@media (orientation: landscape)` (`.spread` as `flex: 0 0 100%` snap unit with spread `view(inline)` `--progress`, side-by-side half-page sizing, and `stack-pin` / `stack-reveal` applied to `.spread` in `stack` mode) in `src/style.css`, verifying `npm run build` succeeds.

## 3. Double-Sided Landscape Curl Renderer & Shader

- [ ] 3.1 Extend `src/shaders/page.frag.glsl` with `u_backPageTex` and `u_hasBackTex` to sample horizontally mirrored UVs (`vec2(1.0 - v_uv.x, v_uv.y)`) on `!gl_FrontFacing` when `u_hasBackTex == 1`, preserving `BACK_PAPER_COLOR` when `u_hasBackTex == 0`.
- [ ] 3.2 Update `src/gl/renderer.ts` (and `src/gl/geometrySync.ts` if needed) to detect landscape orientation via `matchMedia('(orientation: landscape)')`, read spread `--progress`, render stationary left/right spread halves plus the central-spine curled leaf with paired front/back textures, and sync hit-test geometry for both visible spread pages, verifying `npm run build` and `npm test` pass.

## 4. Verification

- [ ] 4.1 Verify in Chrome 158+ across portrait (`1..18` single pages with blank-paper back face in `curl`) and landscape (`[blank, 1]`, `[2, 3]..[16, 17]`, `[18, blank]` in `slide`, `stack`, and `curl`, with readable mirrored paired textures on curled backsides and working clicks/hovers on both halves).

## Workflow follow-up

- Sync delta specs and archive `landscape-double-page-spread` via `openspec-archive-change` after implementation and verification are complete.
