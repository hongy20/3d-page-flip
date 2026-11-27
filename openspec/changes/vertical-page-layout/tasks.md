# Tasks

## 1. Vertical CSS Scroller & Stack Mode

- [ ] 1.1 Add portrait-scoped `body[data-layout="vertical"]` styles in `src/style.css` switching `.book` to `flex-direction: column`, `overflow-y: auto`, `scroll-snap-type: y mandatory`, `overscroll-behavior-y: none`, `view(block)` `--progress`, and vertical `stack` keyframes while keeping landscape horizontal; verify `npm run build` passes.

## 2. Top-Hinge 3D Curl Support

- [ ] 2.1 Extend `src/gl/coneMath.ts`, `src/gl/coneMath.test.ts`, `src/shaders/cone.vert.glsl`, and `src/gl/renderer.ts` to support horizontal top-hinge cone/cylinder curl and horizontal `conicContribution` pointer mapping in vertical layout, verifying unit tests pass.

## 3. Verification

- [ ] 3.1 Verify `slide`, `stack`, and top-hinge `curl` work smoothly with vertical up/down swipes in portrait and remain horizontal in landscape in Chrome; run `npm run lint`, `npm run format:check`, `npm test`, and `npm run build` and confirm all exit `0`.

## Workflow follow-up

- Sync delta specs and archive `vertical-page-layout` via `openspec-archive-change` after implementation and verification are complete.
