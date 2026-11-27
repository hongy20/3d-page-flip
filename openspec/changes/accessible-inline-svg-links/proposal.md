# Proposal

## Why

Rendering pages via `<img src="/pages/page_N.svg">` hides all SVG text and the existing native SVG `<a>` links from screen readers and blocks link interactivity. Mounting the SVGs as real inline `<svg>` DOM elements at runtime exposes page text to screen readers and activates the existing native SVG hyperlinks.

## What Changes

- Replace `<img class="page__svg">` with runtime-fetched inline `<svg>` DOM elements inside `<article class="page__content" drawable>` using a reusable base-URL-aware SVG loader (`src/svgLoader.ts`, `import.meta.env.BASE_URL`), prioritizing page 1 first and fetching remaining pages concurrently (`OQ-SVG-1` resolved).
- Preserve the 6 existing native SVG `<a>` links already authored in `public/pages/page_*.svg` (`page_1.svg`, `page_2.svg`, `page_17.svg`, `page_18.svg`) completely untouched — **zero edits to `public/pages/page_*.svg`** (`OQ-SVG-2` resolved; `123rf.com` photo credits and `@spain` labels remain unlinked).
- Ensure WebGL HTML-in-Canvas texture capture (`canvas.requestPaint?.()` on SVG mount) and hit-test geometry sync (`updateElementGeometry`) preserve clickable SVG `<a>` links and accessible text without interfering with native scroll dragging.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `book-scroller`: Render page artwork as runtime-fetched inline `<svg>` DOM elements exposed to screen readers while preserving the existing native SVG `<a>` hyperlinks untouched.
- `webgl-html-in-canvas`: Preserve inline SVG `<a>` link clickability through HTML-in-Canvas hit-test geometry sync.

## Impact

- **Files affected**: `index.html`, `src/style.css`, `src/main.ts`, `src/svgLoader.ts`, `src/svgLoader.test.ts` (zero edits to `public/pages/page_*.svg`).
- **Dependencies**: None.
- **Open Questions**: None (`OQ-SVG-1` and `OQ-SVG-2` resolved).
