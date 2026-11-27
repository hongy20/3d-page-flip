# Tasks

## 1. Resolve Open Questions & Strategy

- [ ] 1.1 Resolve `OQ-SVG-1` (benchmark runtime `fetch()` DOM injection vs build-time HTML inlining in Chrome with HTML-in-Canvas) and `OQ-SVG-2` (confirm whether email addresses and `123rf.com` photo credits should be wrapped alongside tourism URLs).

## 2. SVG Link Markup

- [ ] 2.1 Inspect exact `<text>` elements for every confirmed URL/email in `public/pages/page_*.svg` and wrap them directly inside standard SVG `<a href="..." target="_blank" rel="noopener noreferrer">` elements (handling multi-`<text>` splits where present), verifying every edited SVG parses cleanly as valid XML.

## 3. Inline DOM Mounting & Hit-Test Integration

- [ ] 3.1 Mount the 18 SVGs as real inline `<svg>` DOM elements inside each `<article class="page__content" drawable>` per `OQ-SVG-1`, update `.page__svg` (`pointer-events: none`) and `.page__svg a` (`pointer-events: auto; cursor: pointer`) in `src/style.css`, and trigger `canvas.requestPaint?.()` once mounted so HTML-in-Canvas captures initial textures.

## 4. Verification

- [ ] 4.1 Run `npm run build` and `npm test` and confirm zero errors.
- [ ] 4.2 Verify in Chrome 158+ DevTools Accessibility Tree that all 18 pages expose inline `<svg>` `<text>` nodes and `<a>` links to screen readers without font/ID collisions, and verify clicking SVG links opens the target URL while native scroll and curl interactions remain intact.

## Workflow follow-up

- Sync delta specs and archive `accessible-inline-svg-links` via `openspec-archive-change` after implementation and verification are complete.
