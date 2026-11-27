# Tasks

## 1. Pure Zoom & Bounded Pan State Machine

- [ ] 1.1 Create `src/gl/zoomPan.ts` and `src/gl/zoomPan.test.ts` implementing focal-point zoom (`[1, 4]`), `<= 1.08` snap-to-`1` release threshold, double-tap toggle, and bounded pan clamping around visible page bounds, verifying `npm test` passes.

## 2. Reader Integration, Scroll Lock & Browser-Zoom Suppression

- [ ] 2.1 Wire Pointer Events (2-finger pinch + single-pointer pan while zoomed + double-tap/double-click), `Ctrl+wheel` zoom, `.book--zoomed` scroll lock, and `reader.html` browser-zoom suppression into `src/gl/renderer.ts`, `src/gl/camera.ts`, `src/gl/geometrySync.ts`, `src/style.css`, and `reader.html`, updating `AGENTS.md` with the scoped zoom/pan exception.

## 3. Verification

- [ ] 3.1 Verify in Chrome that zooming in locks page turning, panning clamps cleanly around visible page bounds, zooming out near `1` snaps to `1` and re-enables page turns, native browser zoom is suppressed on `reader.html` only, and SVG links/badges stay clickable when zoomed; run `npm run lint`, `npm run format:check`, `npm test`, and `npm run build` and confirm all exit `0`.

## Workflow follow-up

- Sync delta specs and archive `pinch-to-zoom` via `openspec-archive-change` after implementation and verification are complete.
