# Design

## Context

See [proposal.md](proposal.md). Currently `index.html` is a single hardcoded 18-page reader for `public/pages/page_1.svg`..`page_18.svg`. With `accessible-inline-svg-links` introducing a base-URL-aware runtime SVG loader (`src/svgLoader.ts`), the reader no longer needs 18 hardcoded SVG blocks in HTML and can instead render any static catalog book dynamically.

## Goals / Non-Goals

**Goals:**

- Turn `index.html` into a fast, accessible book shelf landing page listing repo-hosted SVG books.
- Move the reader to `reader.html?book=<id>` so each book gets a clean WebGL context lifecycle, native browser history/back navigation, and bookmarkable URLs.
- Keep adding a new book trivial: drop `page_1.svg..page_N.svg` into `public/books/<id>/` and add one entry in `src/books/catalog.ts`.

**Non-Goals:**

- Opening user-selected files from local disk, server persistence, or reading-position storage.
- Client-side SPA routing or changing CSS scroll-snap / WebGL curl math.

## Decisions

1. **Multi-page Vite architecture (`index.html` + `reader.html`)**:
   - Use two separate HTML entrypoints configured via `vite.config.ts` (`build.rollupOptions.input`: `index.html` and `reader.html`), navigated via native `<a href="./reader.html?book=<id>">` and `<a href="./">` links.
   - Alternative considered: single-page view toggling inside `index.html`. Rejected because multi-page navigation guarantees clean WebGL2 + HTML-in-Canvas teardown/init, native Back button support, and minimal initial bundle on the shelf page.
2. **Static TypeScript catalog (`src/books/catalog.ts`) & asset layout (`public/books/<id>/`)**:
   - Move `public/pages/` to `public/books/malaga/`.
   - Define `BookManifest` (`id`, `title`, `subtitle?`, `pageCount`, `aspectRatio`, `basePath`, `coverPath`) and pure helpers `resolveBook(id)` (defaulting to the first entry when `id` is null/empty, returning `undefined` for unknown IDs) and `getBookPagePaths(book)`.
3. **Dynamic `.page` DOM construction before `initBookRenderer()`**:
   - `src/main.ts` reads `new URLSearchParams(window.location.search).get("book")`, resolves the book, and if missing renders an accessible fallback with `<a href="./">Back to library</a>` instead of starting WebGL.
   - For a valid book, `src/main.ts` sets `document.title` and `--page-aspect` on `.book` (inherited by `.page__frame`), builds `N` `<section class="page">` nodes with `<article class="page__content" drawable>`, `<div class="page__svg-slot" data-svg="...">`, and `<button class="page__badge">Page k / N</button>`, then calls `initBookRenderer(...)` and `mountInlineSvgs(...)` (`src/svgLoader.ts`) so WebGL texture/geometry sync tracks all `N` pages cleanly.
4. **Control link CSS scoping**:
   - Because inline SVGs carry unscoped `a { cursor: pointer; ... }` rules, style the back-to-library `<a class="controls__back" href="./">` explicitly in `src/style.css` so SVG anchor styles never bleed into `.controls`.

## Risks / Trade-offs

- **Coordination with `publish-public-demo` on `vite.config.ts`** → Whoever lands second merges `base: process.env.GITHUB_PAGES === 'true' ? '/3d-page-flip/' : '/'` with `build.rollupOptions.input` inside `vite.config.ts`.
- **Coordination with `landscape-double-page-spread`** → If `book-library` lands before `landscape-double-page-spread`, `landscape-double-page-spread` should group the dynamically generated `.page` elements into `.spread` containers in `src/main.ts` rather than hardcoding 10 spreads in `reader.html`.
- **Relative links under subpaths (e.g. `/3d-page-flip/`)** → Use `./reader.html?book=<id>` and `./` links plus `import.meta.env.BASE_URL` for `public/books/...` fetches/thumbnails so both `/` and `/3d-page-flip/` work identically.

## Open Questions

None.
