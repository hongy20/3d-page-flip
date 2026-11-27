# Design

## Context

See [proposal.md](proposal.md). Static inspection of `public/pages/page_1.svg` through `page_18.svg` confirmed:

- All 18 files use page-prefixed element IDs (`p1___...`..`p18___...`) and 89 `@font-face` font families with **zero cross-page collisions**.
- Total size across all 18 SVGs is ~14 MB (568 KB–1.1 MB each, primarily embedded base64 JPEG backgrounds).
- All 6 main links are **already authored** in the SVGs as native `<a ...><title>...</title><rect .../></a>` transparent-hit-rect overlays with `aria-label`, `target="_blank"`, `rel="nofollow"`, and built-in `<style>` rules (`a { cursor: pointer; rect { fill: transparent; } }`, `a:focus { outline: solid medium royalblue; }`):
  - `page_1.svg`: `http://www.spain.info`
  - `page_2.svg`: `mailto:brochures@tourspain.es`
  - `page_17.svg`: `http://www.spain.info`, `mailto:visita@malaga.eu`, `http://www.visita.malaga.eu`
  - `page_18.svg`: `http://spain.info`
- Unlinked `123rf.com` photo credits (`page_8.svg`, `page_10.svg`, `page_12.svg`, `page_13.svg`) and `@spain` labels (`page_18.svg`) are intentionally left unlinked.

## Goals / Non-Goals

**Goals:**

- Expose inline `<svg>` `<text>` content and existing native SVG `<a>` links to assistive technologies and pointer/keyboard users inside `.page__content`.
- Keep `src/svgLoader.ts` clean, base-URL-aware, and reusable for a follow-up `book-library` change.
- Keep drag/scroll hit-testing smooth (`pointer-events: none` on `.page__svg`, `pointer-events: all` on `.page__svg a`).

**Non-Goals:**

- Editing `public/pages/page_*.svg`.
- Re-authoring or splitting embedded JPEG raster layers inside the SVGs.
- Adding JS click listeners to intercept or open SVG URLs.

## Decisions

1. **Runtime `fetch()` + inline `<svg>` DOM injection (`OQ-SVG-1` resolved)**: Replace `<img class="page__svg">` in `index.html` with lightweight `<div class="page__svg-slot" data-svg="pages/page_N.svg">` placeholders (avoiding a ~14 MB `index.html` and avoiding double-downloading via `<img>` + `fetch()`). Implement `src/svgLoader.ts` resolving asset URLs via `${import.meta.env.BASE_URL}${relativePath}`, prioritizing page 1 first so initial render is fast, fetching remaining pages concurrently, parsing via `DOMParser` (`image/svg+xml`), adding `class="page__svg"` on the root `<svg>`, replacing each slot in `.page__content`, and invoking an `onPageMounted` callback (`canvas.requestPaint?.()`) so HTML-in-Canvas captures textures as pages mount.
2. **Preserve existing native SVG `<a>` links untouched (`OQ-SVG-2` resolved)**: Keep all 6 existing `<a>` elements in `public/pages/page_*.svg` as-is (`http://`, `mailto:`, `rel="nofollow"`, `target="_blank"`, transparent `<rect>` hit targets) with zero edits to the SVG files.
3. **Inline pointer-events discipline**: Keep `pointer-events: none` on `.page__svg` and set `.page__svg a { pointer-events: all; cursor: pointer; }` so transparent `<rect>` hit-overlays inside `<a>` reliably receive clicks/hover while non-link SVG artwork never blocks native scroll dragging.

## Risks / Trade-offs

- **Async mount vs initial WebGL paint** → Mitigated by prioritizing page 1 first and calling `canvas.requestPaint?.()` whenever a page SVG mounts.
- **Unscoped `<style>` inside inline SVGs (`a { ... }`)** → Checked: `index.html` currently has no conflicting `<a>` styling; if later pages add `<a>` controls (e.g. a back-to-library link in `book-library`), scope controls with explicit classes.

## Open Questions

None (`OQ-SVG-1` and `OQ-SVG-2` resolved; no blocking open questions remain).
