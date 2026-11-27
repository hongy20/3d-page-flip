# Design

## Context

See [proposal.md](proposal.md). Static inspection of `public/pages/page_1.svg` through `page_18.svg` confirmed:

- All 18 files use page-prefixed element IDs (`p1___...`..`p18___...`) and 89 `@font-face` font families with **zero cross-page collisions**.
- Total size across all 18 SVGs is ~15 MB (primarily embedded base64 JPEG backgrounds).
- URL / contact string audit across `<text>` nodes:
  - `page_1.svg`: `www.spain.info`
  - `page_2.svg`: `brochures@tourspain.es`
  - `page_8.svg`, `page_10.svg`, `page_12.svg`, `page_13.svg`: `123rf.com` (photo credit text)
  - `page_17.svg`: `www.visita.malaga.eu`, `visita@malaga.eu`, `www.spain.info`
  - `page_18.svg`: `Spain.info`
  - (Concatenated false positives like `sKaleja.ES` on `page_7` and `route.Com` on `page_12` are excluded.)

## Goals / Non-Goals

**Goals:**

- Expose all SVG `<text>` content and links to assistive technologies inside `.page__content`.
- Encode clickable hyperlinks directly inside `public/pages/page_*.svg` using standard SVG `<a href="..." target="_blank" rel="noopener noreferrer">`.
- Keep drag/scroll hit-testing smooth (`pointer-events: none` on non-interactive SVG artwork, `pointer-events: auto` on `.page__svg a`).

**Non-Goals:**

- Re-authoring or splitting embedded JPEG raster layers inside the SVGs.
- Adding JS click listeners to intercept or open SVG URLs.

## Decisions

1. **Pure SVG-spec links**: Wrap matching `<text>` / `<tspan>` elements in standard SVG `<a href="..." target="_blank" rel="noopener noreferrer">` elements (using `https://` for `www.*` / domain URLs and `mailto:` if emails are included per `OQ-SVG-2`), styled via SVG/CSS with `pointer-events: auto; cursor: pointer`.
2. **HTML-in-Canvas paint readiness**: Ensure `canvas.requestPaint?.()` fires once inline `<svg>` nodes are mounted (if runtime-loaded) so `texElementSubImage2D` captures the full SVG artwork.
3. **Inline pointer-events discipline**: Keep `pointer-events: none` on `.page__svg` (or non-link children) and enable `pointer-events: auto` on `.page__svg a` so swiping over text/images never interferes with native scrolling.

## Risks / Trade-offs

- **~15 MB inline SVG payload** → Evaluated via `OQ-SVG-1` (benchmarking runtime `fetch()` DOM injection vs build-time HTML inlining).
- **Split `<text>` nodes across characters/words** → Some PDF-exported SVGs split URLs across adjacent `<text>` nodes; wrap the contiguous group or `<text>` elements inside a single `<a>` so the whole URL forms one accessible link target.

## Open Questions

- **`OQ-SVG-1` (Mounting strategy)**: Should the 18 SVGs be fetched and injected as inline `<svg>` at runtime (small initial `index.html`, async mount + `requestPaint`) or inlined into `index.html` at build time (~15 MB HTML, zero runtime fetches)? Benchmark both in Chrome to pick the better tradeoff.
- **`OQ-SVG-2` (Link scope inside SVGs)**: Should SVG `<a>` links wrap only tourism website URLs (`www.spain.info`, `www.visita.malaga.eu`, `Spain.info`), or also wrap email addresses (`mailto:brochures@tourspain.es`, `mailto:visita@malaga.eu`) and/or `123rf.com` photo credits?
