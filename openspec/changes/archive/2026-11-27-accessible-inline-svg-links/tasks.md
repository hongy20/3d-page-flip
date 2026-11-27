# Tasks

## 1. Reusable Runtime Inline SVG Loader

- [x] 1.1 Create `src/svgLoader.ts` to fetch SVG assets using `import.meta.env.BASE_URL`, parse via `DOMParser` (`image/svg+xml`), mount inline `<svg class="page__svg">` elements (prioritizing page 1 first, then loading remaining pages concurrently), and invoke an `onPageMounted` callback; add unit tests in `src/svgLoader.test.ts` covering base-URL resolution, XML parsing, and priority/error handling.

## 2. Inline DOM Mounting & Hit-Test Integration

- [x] 2.1 Replace `<img class="page__svg">` placeholders in `index.html` with `<div class="page__svg-slot" data-svg="pages/page_N.svg">`, wire `src/main.ts` to mount inline `<svg>` nodes via `src/svgLoader.ts` and trigger `canvas.requestPaint?.()` on mount, and update `src/style.css` (`.page__svg { pointer-events: none; }` and `.page__svg a { pointer-events: all; cursor: pointer; }`), confirming zero edits to `public/pages/page_*.svg`.

## 3. Verification

- [x] 3.1 Run `npm run lint`, `npm run format:check`, `npm test`, and `npm run build` and confirm zero errors.
- [x] 3.2 Verify in Chrome 158+ DevTools Accessibility Tree that all 18 pages expose inline `<svg>` `<text>` nodes and all 6 existing `<a>` links without font/ID collisions, and verify clicking the SVG links opens the target URL while native scroll, snap, and 3D curl interactions remain intact.

## Workflow follow-up

- Sync delta specs and archive `accessible-inline-svg-links` via `openspec-archive-change` after implementation and verification are complete.
