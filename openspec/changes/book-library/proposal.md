# Proposal

## Why

Visitors currently land directly inside a single hardcoded 18-page book (`index.html`). Adding a dedicated book-chooser shelf page lets visitors browse and open books from a static catalog while keeping the reader reusable for books with arbitrary page counts and aspect ratios.

## What Changes

- Convert the project into a multi-page Vite app (`vite.config.ts` with Rollup inputs `index.html` and `reader.html`):
  - `index.html`: Accessible Book Library / Shelf landing page rendering cards from a static TypeScript book catalog (`src/books/catalog.ts`), each displaying the book's cover (`page_1.svg` thumbnail via `<img>`), title, metadata (page count), and a native `<a href="./reader.html?book=<id>">` link.
  - `reader.html`: Reader page containing the `<canvas content="drawable">`, `.controls` (including a native `<a href="./">` back-to-library link), and `<main class="book" drawable>` whose `.page` elements and `--page-aspect` are generated dynamically from the selected `?book=<id>` catalog entry and populated via `src/svgLoader.ts` (from `accessible-inline-svg-links`).
- Move repo-hosted book assets to `public/books/<id>/page_1.svg..page_N.svg`, starting with `public/books/malaga/page_1.svg..page_18.svg` (aspect ratio `2115 / 2990`, 18 pages) so adding a new book only requires adding a folder under `public/books/<id>/` and a catalog entry in `src/books/catalog.ts`.
- Out of scope: uploading/opening local files from disk, backend storage, reading-position persistence, search/filtering UI, or modifying CSS scroll-snap or WebGL curl math.

## Capabilities

### New Capabilities

- `book-library`: Static repo-hosted SVG book catalog, accessible book shelf landing page at `index.html`, multi-page navigation to `reader.html?book=<id>` and back, fallback for unknown book IDs, and multi-page Vite build configuration.

### Modified Capabilities

- `book-scroller`: Reader lives at `reader.html`, constructs `.page` elements and `--page-aspect` dynamically from the selected book's catalog entry, and exposes a back-to-library link in `.controls`.

## Impact

- **Files affected**: `vite.config.ts`, `index.html`, `reader.html`, `src/books/catalog.ts`, `src/books/catalog.test.ts`, `src/library.ts`, `src/library.css`, `src/main.ts`, `src/style.css`, `public/books/malaga/page_*.svg` (moved from `public/pages/`).
- **Dependencies**: Zero new runtime dependencies; builds cleanly on `accessible-inline-svg-links` (`src/svgLoader.ts`). Coordinates with `publish-public-demo` (both configure `vite.config.ts`).
- **Open Questions**: None.
