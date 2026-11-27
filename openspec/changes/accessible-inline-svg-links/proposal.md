# Proposal

## Why

Rendering pages via `<img src="/pages/page_N.svg">` hides all SVG text and links from screen readers and prevents interactive links inside the page artwork. Mounting the SVGs as real inline `<svg>` DOM elements and encoding discovered URLs as native SVG `<a>` elements makes page text accessible and links clickable directly within the SVG spec.

## What Changes

- Replace `<img class="page__svg">` with inline `<svg>` DOM elements inside `<article class="page__content" drawable>` (mounting strategy — runtime `fetch()` vs build-time HTML inlining — tracked in `OQ-SVG-1`).
- Audit all 18 `public/pages/page_*.svg` files and wrap valid URLs (and, pending `OQ-SVG-2`, emails / credit domains) in standard SVG `<a href="..." target="_blank" rel="noopener noreferrer">` elements directly inside the SVG files.
- Ensure WebGL HTML-in-Canvas texture capture (`texElementSubImage2D`) and hit-test geometry sync (`updateElementGeometry`) preserve clickable SVG `<a>` links and accessible text.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `book-scroller`: Render page artwork as inline `<svg>` DOM elements exposed to screen readers and wrap valid SVG URLs in native SVG `<a>` hyperlinks.
- `webgl-html-in-canvas`: Preserve inline SVG `<a>` link clickability through HTML-in-Canvas hit-test geometry sync.

## Impact

- **Files affected**: `public/pages/page_*.svg`, `index.html`, `src/style.css`, `src/main.ts` (and optional inline-SVG loader module if runtime-fetched).
- **Dependencies**: None.
- **Open Questions**: `OQ-SVG-1` (runtime `fetch()` DOM injection vs build-time HTML inlining) and `OQ-SVG-2` (whether to wrap emails and `123rf.com` photo credits in addition to tourism URLs).
