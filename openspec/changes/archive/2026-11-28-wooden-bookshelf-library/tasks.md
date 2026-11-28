# Tasks

## 1. Responsive Wooden Bookshelf Layout

- [x] 1.1 Update `src/library.css` (and minimal semantic hooks in `index.html` / `src/library.ts` if needed) to configure `.shelf` with 2 columns in `@media (orientation: portrait)` and 3 columns in `@media (orientation: landscape)` using CSS custom properties, preserving native `<a href="./reader.html?book=<id>">` links and verifying `npm run build` succeeds.
- [x] 1.2 Style the wooden bookshelf cabinet backdrop and per-row thick wall-to-wall wooden shelf boards (spanning the full row even on partial rows via pure CSS, with top ledge, thick front fascia, wood grain, and under-shelf shadow) with zero external image assets and verify `npm run format:check` passes.

## 2. Spotlight Selection Effect & Accessibility

- [x] 2.1 Implement the pure-CSS overhead spotlight highlight on `:hover` and `:focus-visible` (illuminating the selected book and wooden shelf surface, subtly dimming sibling books via `:has()`, preserving visible keyboard focus outlines and WCAG-legible metadata, and respecting `prefers-reduced-motion`).

## 3. Verification

- [x] 3.1 Run `npm run lint`, `npm run format:check`, `npm test`, and `npm run build` and verify all exit `0`.
- [x] 3.2 Visually verify `index.html` in Chrome across portrait (2 items/row) and landscape (3 items/row) viewports—including partial rows, hover/keyboard-focus spotlight, and clicking through to `./reader.html?book=malaga` with zero console errors.

## Workflow follow-up

- Sync delta specs and archive `wooden-bookshelf-library` via `openspec-archive-change` after implementation and verification are complete.
