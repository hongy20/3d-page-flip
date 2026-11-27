# Tasks

## 1. Resolve Open Questions & CSS Check

- [ ] 1.1 Resolve `OQ-SPREAD-1` (confirm landscape `stack` mode transitions the 2-page spread as a unit) and verify Chrome 158+ `display: contents` behavior with `view(inline)` timelines.

## 2. Responsive Spread DOM & CSS

- [ ] 2.1 Group the 18 `.page` elements in `index.html` into 10 `<section class="spread">` containers (`[spacer, 1]`, `[2, 3]`, ..., `[16, 17]`, `[18, spacer]`).
- [ ] 2.2 Implement `@media (orientation: portrait)` (`display: contents` on `.spread`, `display: none` on `.spread__spacer`, per-page `--progress`) and `@media (orientation: landscape)` (`.spread` as `flex: 0 0 100%` snap unit with spread `view(inline)` `--progress` and side-by-side half-page sizing) in `src/style.css`, verifying `npm run build` succeeds.

## 3. Double-Sided Landscape Curl Renderer & Shader

- [ ] 3.1 Extend `src/shaders/page.frag.glsl` with `u_backPageTex` and `u_hasBackTex` to sample horizontally mirrored UVs (`vec2(1.0 - v_uv.x, v_uv.y)`) on `!gl_FrontFacing` when `u_hasBackTex == 1`, preserving `BACK_PAPER_COLOR` when `u_hasBackTex == 0`.
- [ ] 3.2 Update `src/gl/renderer.ts` (and `src/gl/geometrySync.ts` if needed) to detect landscape orientation via `matchMedia('(orientation: landscape)')`, read spread `--progress`, render stationary left/right spread halves plus the central-spine curled leaf with paired front/back textures, and sync hit-test geometry for both visible spread pages, verifying `npm run build` and `npm test` pass.

## 4. Verification

- [ ] 4.1 Verify in Chrome 158+ across portrait (`1..18` single pages with blank-paper back face in `curl`) and landscape (`[blank, 1]`, `[2, 3]..[16, 17]`, `[18, blank]` in `slide`, `stack`, and `curl`, with readable mirrored paired textures on curled backsides and working clicks/hovers on both halves).

## Workflow follow-up

- Sync delta specs and archive `landscape-double-page-spread` via `openspec-archive-change` after implementation and verification are complete.
