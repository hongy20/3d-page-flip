# Tasks

## 1. CSS Layout & Scroll Snap Updates

- [x] 1.1 Update `.page__badge` in `src/style.css` to center horizontally along the bottom edge of `.page__content` (keeping `:hover`/`:focus-visible` transforms centered without horizontal jump) and verify `npm run build` succeeds.
- [x] 1.2 Change `scroll-snap-stop: always` to `scroll-snap-stop: normal` on `.page` in `src/style.css`, verifying zero navigation JS listeners or DOM scroll mutations exist in `src/`.

## 2. Verification

- [x] 2.1 Verify in Chrome 158+ that `.page__badge` renders horizontally centered at the bottom edge (including during `:hover`/`:focus-visible`), gentle swipes snap one page at a time, and strong fast swipes traverse multiple pages via native momentum before snapping.

## Workflow follow-up

- Sync delta specs and archive `reader-ui-and-swipe-polish` via `openspec-archive-change` after implementation and verification are complete.
