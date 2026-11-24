# Proposal: Phase 1, Project Scaffolding

## Why

Browser e-book readers usually compromise between flat page swaps or JavaScript animation engines that fight native platform scroll physics (`VIS-01`, `VIS-03`). Phase 1 establishes the zero-JS-physics foundation of **WebBook 3D**: a minimal Vite + strict TypeScript project whose book is a horizontally scrolling, snap-paginated HTML/CSS container where native browser scrolling owns all input, momentum, and page-turn snapping (`ARCH-01`..`ARCH-04`, `SCF-01`..`SCF-09`).

## What Changes

- Initialize a minimal Vite `vanilla-ts` project with `strict: true` TypeScript configuration and standard npm scripts (`dev`, `build`, `preview`), stripped of demo boilerplate (`SCF-01`, `SCF-02`, `SCF-09`, `ARCH-11`, `ARCH-15`).
- Create `index.html` containing a horizontal flex scroller (`.book`) with 18 renderer-agnostic HTML/SVG pages (`.page` / `.page__content`) loaded from downloaded SVG page assets (`public/pages/page_1.svg` .. `page_18.svg`), plus interactive CSS `:hover` treatment (`SCF-03`, `VIS-05`).
- Style `.book` and `.page` in `src/style.css` using native CSS scroll snapping (`scroll-snap-type: x mandatory`, `scroll-snap-align: center`, `scroll-snap-stop: always`), full-viewport sizing (`100dvh`), hidden scrollbars, `overscroll-behavior-x: contain`, and responsive aspect-ratio-preserving `.page__content` paper visuals that always fit within the available space with comfortable padding and never trigger inner scrollbars, optimized primarily for mobile portrait viewports (`SCF-04`..`SCF-07`, `ARCH-04`).
- Restrict `src/main.ts` to only importing the stylesheet—zero event listeners, zero DOM manipulation, and zero runtime dependencies (`SCF-08`, `ARCH-01`..`ARCH-03`, `ARCH-15`, `ARCH-16`).

### Out of Scope

- CSS `@property --progress` and scroll-driven animation timelines (Phase 2).
- `<canvas layoutsubtree>` and WebGL context/texture upload (Phase 3).
- Cone vertex shader deformation and `scrollLeft` uniform bridge (Phase 4).
- Two-page spreads (pending `OQ-11`), EPUB/PDF loading, bookmarks, or TOC (`000-vision`).

## Capabilities

### New Capabilities
- `book-scroller`: Native CSS horizontal scroll-snap book container, renderer-agnostic HTML/SVG page structure, paper layout styling, and zero-JS navigation physics (`SCF-01`..`SCF-09`, `ARCH-01`..`ARCH-04`, `ARCH-11`, `ARCH-15`, `ARCH-16`).

### Modified Capabilities
<!-- None -->

## Impact

- **Files created/affected**: `package.json`, `tsconfig.json`, `.gitignore`, `index.html`, `src/main.ts`, `src/style.css`, `public/pages/page_1.svg`..`page_18.svg`.
- **Dependencies**: Vite and TypeScript as devDependencies only; zero runtime dependencies (`ARCH-15`).
- **Resolved Decisions**: `OQ-11` decided as **single-page view** (`flex: 0 0 100%`), optimized for mobile portrait; `OQ-12` decided as **`scroll-snap-align: center`**.
