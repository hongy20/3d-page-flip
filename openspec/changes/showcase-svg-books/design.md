# Design

## Context

See [proposal.md](proposal.md). `src/books/catalog.ts` currently lists only `malaga`, and `src/gl/renderer.ts` relies on `CanvasPaintEvent` (`onPaint`) to re-upload textures via `texElementSubImage2D`.

## Goals / Non-Goals

**Goals:**

- Deterministic Node/TypeScript generator (`scripts/generate-showcase.ts`) emitting valid, self-contained static SVG files under `public/books/<id>/` with zero runtime dependencies.
- Showcase embedded APNG inside SVG plus a curated set of other rich SVG features agreed with the user (`OQ-SHOWCASE-1`).
- Smooth APNG playback in Chrome HTML-in-Canvas WebGL2 textures without waking static pages.

**Non-Goals:**

- Runtime server-side SVG generation or adding heavy image-processing runtime dependencies.

## Decisions

1. **Zero-dependency TypeScript APNG/SVG generator (`scripts/generate-showcase.ts`)**:
   - Construct valid minimal PNG + APNG chunks (`IHDR`, `acTL`, `fcTL`, `IDAT`, `fdAT`, `IEND` with CRC32 and Node's built-in `node:zlib` `deflateSync`) directly in TypeScript and embed the resulting `data:image/png;base64,...` inside an inline-safe `<svg>` `<image>` element.
   - Add an npm script or documented command (e.g., `node scripts/generate-showcase.ts` directly supported under Node 26's native TypeScript stripping) to regenerate `public/books/<showcase-id>/` cleanly.
2. **Chrome HTML-in-Canvas APNG refresh verification**:
   - First test in Chrome 157+ whether `<canvas content="drawable">` automatically dispatches `CanvasPaintEvent` on each APNG frame tick inside `<svg><image>`.
   - If Chrome does not emit automatic `paint` events for embedded APNG frames, detect animated active pages (e.g., pages flagged or containing `<image href^="data:image/png">` / `data-animated`) and schedule `canvas.requestPaint()` only while that animated page is active/visible and `document.visibilityState === "visible"`, leaving static pages 100% idle.

## Risks / Trade-offs

- **SVG size in Git** → Keep the generated APNG dimensions and frame count compact (e.g., crisp geometric/pixel-art or smooth animated emblem at ~128×128, 12–24 frames) so the resulting SVG files stay small and fast to load.
- **Unscoped SVG IDs / `@font-face` collisions** → Prefix all generated `<defs>` IDs per page (`p{k}-...`) so mounting all pages inline simultaneously in `reader.html` causes zero ID collisions.

## Open Questions

- `OQ-SHOWCASE-1`: Finalize the full showcase page lineup collaboratively with the user when starting implementation (candidate pages: 1. Embedded APNG inside SVG; 2. SMIL/CSS vector animation; 3. SVG filters, gradients & blend modes; 4. Interactive `:hover` & clickable `<a href>` SVG hotspots; 5. High-detail vector typography/diagram built to shine under `pinch-to-zoom`).
