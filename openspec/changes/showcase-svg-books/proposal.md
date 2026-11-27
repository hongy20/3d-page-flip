# Proposal

## Why

The library currently contains only the static Málaga brochure, which does not demonstrate the range of rich, dynamic SVG capabilities (such as animated APNGs embedded inside SVG) that Dropp can render live through HTML-in-Canvas.

## What Changes

- Add a reproducible Node generator script (`scripts/generate-showcase.ts`) that outputs a static showcase book under `public/books/<id>/` and register it in `src/books/catalog.ts` (keeping the built site 100% static with zero runtime dependencies).
- Include at least one SVG page featuring an **embedded animated PNG (APNG)** alongside additional showcase pages (to be explored and finalized collaboratively with the user during implementation).
- Verify and support smooth animated texture refreshes in Chrome HTML-in-Canvas when an active visible page contains animated SVG media (such as APNG), while remaining idle with zero extra paints on static pages.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `book-library`: Add an auto-generated static SVG showcase book (including embedded APNG) to the repo catalog with a reproducible generator script.
- `webgl-html-in-canvas`: Refresh WebGL page textures smoothly when an active visible page contains animated embedded media (such as APNG) while staying idle on static pages.

## Impact

- **Files created/affected**: `scripts/generate-showcase.ts`, `public/books/<showcase-id>/page_*.svg`, `src/books/catalog.ts`, `src/books/catalog.test.ts`, `src/gl/renderer.ts` (if animated-page paint refresh is required).
- **Dependencies**: Zero runtime dependencies (dev/script tooling only if needed, preferring pure TypeScript).
- **Unaffected**: `public/books/malaga/`, CSS scroll-snap physics, cone math.
