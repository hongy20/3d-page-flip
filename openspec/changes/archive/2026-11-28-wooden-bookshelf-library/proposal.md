# Proposal

## Why

Replace the plain dark flat grid on `index.html` with a tactile wooden bookshelf presentation that adapts cleanly to portrait (2 books/row) and landscape (3 books/row) viewports and visually spotlights the hovered or focused book.

## What Changes

- Update `.shelf` responsive grid in `src/library.css` to strictly 2 columns in portrait orientation (`@media (orientation: portrait)`) and 3 columns in landscape orientation (`@media (orientation: landscape)`).
- Style the library page (`index.html` / `src/library.css`) with a warm wooden bookshelf cabinet backdrop and a thick, wall-to-wall wooden shelf board beneath every row of books (spanning the full row width even when a row has fewer than 2 or 3 books).
- Add a pure-CSS overhead spotlight highlight effect on `:hover` and `:focus-visible` (illuminating the selected book and wooden board beneath it while subtly dimming non-selected books via `:has()`, respecting `prefers-reduced-motion`).
- Keep all navigation native `<a href="./reader.html?book=<id>">` with zero runtime dependencies and zero external image assets.
- Out of scope: adding new books to `src/books/catalog.ts`, JS routing/animations, or modifying `reader.html` / WebGL curl rendering.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `book-library`: Responsive orientation-based row counts (2 items/row portrait, 3 items/row landscape), wooden bookshelf cabinet & full-width thick shelf boards per row, and pure-CSS selection spotlight highlight.

## Impact

- **Files affected**: `src/library.css`, optionally minimal semantic/styling hooks in `index.html` and `src/library.ts` (preserving `<a href="./reader.html?book=<id>">` structure).
- **Dependencies**: None.
- **Unaffected**: `src/books/catalog.ts`, `reader.html`, `src/main.ts`, `src/gl/*`, `src/shaders/*`.
