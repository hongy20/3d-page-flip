# 010: Phase 1, Project Scaffolding

Status: Draft

## Goal

Create a minimal Vite + TypeScript project whose page is a horizontally scrolling,
snap-paginated book built only from HTML and CSS. At the end of this phase the book is
fully navigable with no JavaScript doing anything except importing the stylesheet.

## Requirements

| ID | Requirement |
|----|-------------|
| SCF-01 | The project MUST be initialised with Vite's `vanilla-ts` template, then stripped of template demo files (counter, logos). |
| SCF-02 | `tsconfig` MUST have `strict: true`. |
| SCF-03 | `index.html` MUST contain one scroller element (`.book`) holding N ≥ 4 page elements (`.page`), each with its own static HTML/SVG content (`.page__content`). |
| SCF-04 | `.book` MUST be `display: flex` with `overflow-x: auto`, `overflow-y: hidden`, and `scroll-snap-type: x mandatory`. |
| SCF-05 | Each `.page` MUST be `flex: 0 0 100%` of the scroller width, with `scroll-snap-align: start` (or `center`, see note) and `scroll-snap-stop: always`, so one gesture turns at most one page. |
| SCF-06 | The scroller MUST fill the viewport (`100dvh`), hide its scrollbar, and set `overscroll-behavior-x: contain` so browser back/forward swipes don't fire. |
| SCF-07 | Page content MUST have a fixed aspect ratio (e.g. 3:4) and paper-like styling so it is recognisable as a page once it becomes a texture. |
| SCF-08 | Per ARCH-02 and ARCH-03, `src/main.ts` MUST contain no event listeners and no DOM manipulation in this phase. |
| SCF-09 | The repo MUST include a `.gitignore` for `node_modules/` and `dist/`, and npm scripts `dev`, `build`, `preview`. |

> Note: whichever snap alignment is chosen defines what `--progress = 0` means in Phase 2,
> and the uniform mapping in Phase 4. Pick it once and keep it consistent.

## Design notes

- Keep page markup renderer-agnostic. Phase 3 may need to move page content under a
  `<canvas layoutsubtree>` (see **OQ-03**), so avoid styling that depends on the
  `.book > .page` ancestry beyond layout.
- Include at least one SVG illustration and one page with interactive CSS (e.g. `:hover`)
  to exercise live-texture updates later (VIS-02).

## Acceptance criteria

1. `npm install && npm run dev` starts without errors, and `npm run build` succeeds with no TS errors.
2. In Chrome: trackpad swipe, touch drag (DevTools device mode), Shift+wheel, and arrow keys
   each move exactly one page and settle snapped.
3. `grep -rE "addEventListener|on(touch|wheel|pointer|mouse)" src/` returns nothing.
4. No runtime dependencies in `package.json`.

## Out of scope

`@property`, scroll timelines, canvas, WebGL.

## Tasks

- [ ] Scaffold with Vite `vanilla-ts` into the repo root; remove demo files.
- [ ] Write the `index.html` book and page markup with ≥ 4 sample pages.
- [ ] Write `src/style.css`: reset, scroller, pages, paper styling.
- [ ] Reduce `src/main.ts` to the stylesheet import.
- [ ] Verify the acceptance criteria; commit.
