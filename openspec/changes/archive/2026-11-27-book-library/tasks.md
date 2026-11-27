# Tasks

## 1. Multi-Page Vite Config, Book Assets & Catalog

- [x] 1.1 Create `vite.config.ts` configuring Rollup `build.rollupOptions.input` for `index.html` and `reader.html`, move `public/pages/page_*.svg` to `public/books/malaga/page_*.svg`, and verify `npm run build` outputs both HTML entrypoints cleanly.
- [x] 1.2 Create `src/books/catalog.ts` defining `BookManifest`, the `BOOKS` catalog starting with `malaga` (18 pages, `2115 / 2990`), and `resolveBook` / `getBookPagePaths` helpers, plus unit tests in `src/books/catalog.test.ts` verified with `npm test`.

## 2. Book Shelf Landing Page (`index.html`)

- [x] 2.1 Replace `index.html` with the accessible Book Library shelf page and create `src/library.ts` and `src/library.css` to render book cards from `BOOKS` with cover thumbnail (`page_1.svg`), title, page count, and native `<a href="./reader.html?book=<id>">` links, verifying `npm run build` and `npm run lint` succeed.

## 3. Dynamic Reader (`reader.html`) & Back Navigation

- [x] 3.1 Move the reader markup to `reader.html` with an empty `<main class="book" drawable>` container and a scoped `<a class="controls__back" href="./">` back-to-library link in `.controls` (isolated from inline SVG `a` styles in `src/style.css`).
- [x] 3.2 Update `src/main.ts` and `src/style.css` to resolve `?book=<id>` (defaulting to the first catalog entry when omitted, and rendering an accessible not-found fallback with `<a href="./">` when unknown), generate `N` `.page` elements with `--page-aspect` from the manifest, initialize `initBookRenderer`, and mount inline SVGs via `src/svgLoader.ts`, verifying `npm test` and `npm run build` pass.

## 4. Verification

- [x] 4.1 Run `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`, confirming `dist/index.html`, `dist/reader.html`, and `dist/books/malaga/page_1.svg`..`page_18.svg` exist with zero errors.
- [x] 4.2 Verify manually in Chrome 158+: `index.html` renders the shelf card, clicking opens `reader.html?book=malaga`, `reader.html` without params defaults to Málaga, `reader.html?book=missing` shows the fallback with a working back link, the `.controls` back link returns to `index.html`, and all 3 modes (`Slide`, `Stack`, `Curl`) plus inline SVG links work identically.

## Workflow follow-up

- Sync delta specs and archive `book-library` via `openspec-archive-change` after implementation and verification are complete.
