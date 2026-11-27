# Tasks

## 1. Collaborative Lineup & Static Generator

- [ ] 1.1 Resolve `OQ-SHOWCASE-1` with the user to pick the full set of showcase SVG pages and implement `scripts/generate-showcase.ts` (using Node 26 + `node:zlib` with zero runtime dependencies) to generate deterministic SVGs including an embedded APNG page under `public/books/<id>/`.
- [ ] 1.2 Register the generated showcase book in `src/books/catalog.ts` and update `src/books/catalog.test.ts`, verifying `npm test` and `npm run build` pass.

## 2. HTML-in-Canvas Animation Verification & Polish

- [ ] 2.1 Verify APNG playback inside `reader.html` in Chrome 157+ (flat and during 3D curl); if Chrome does not emit `paint` events on APNG ticks automatically, add scoped `requestPaint()` refreshes for active animated pages in `src/gl/renderer.ts` while keeping static pages idle.
- [ ] 2.2 Run `npm run lint`, `npm run format:check`, `npm test`, and `npm run build` and confirm all exit `0`.

## Workflow follow-up

- Sync delta specs and archive `showcase-svg-books` via `openspec-archive-change` after implementation and verification are complete.
