# Design: Project Scaffolding

## Context

See `proposal.md` for motivation. This change builds the baseline repository layout: a zero-JS-physics horizontal book scroller in Vite + strict TypeScript where native CSS `scroll-snap-type: x mandatory` handles all user input and pagination.

## Goals / Non-Goals

**Goals:**

- Establish the target repository structure (`index.html`, `src/main.ts`, `src/style.css`, `tsconfig.json`, `package.json`, `.gitignore`, `public/pages/page_1.svg`..`page_18.svg`).
- Author 18 pages of SVG/HTML content that remain decoupled from future `<canvas layoutsubtree>` reparenting in `webgl-html-in-canvas` (`OQ-03`).
- Guarantee responsive, aspect-ratio-preserving single-page layout (`scroll-snap-align: center`) that always fits inside the available viewport space with reasonable padding and zero inner scrollbars, primarily targeting mobile portrait mode.
- Guarantee one-page-per-gesture native snapping across touch, trackpad, wheel, and keyboard without any JS event listeners.

**Non-Goals:**

- CSS `@property --progress` or `view(inline)` scroll timelines (deferred to `css-state-engine`).
- Any WebGL or `<canvas layoutsubtree>` integration (deferred to `webgl-html-in-canvas`).

## Decisions

1. **Renderer-Agnostic Page Markup**
   - _Decision_: Separate the scroll-snap item (`.page`) from the visual page sheet (`.page__content`). Avoid CSS selectors on `.page__content` that rely on `.book > .page` ancestry beyond layout positioning.
   - _Rationale_: `webgl-html-in-canvas` (`OQ-03`) may require placing page content inside `<canvas layoutsubtree>`. Keeping `.page__content` self-contained prevents CSS breakage when the DOM hierarchy is adapted for `texElementImage2D`.

2. **18-Page SVG Book Content & Responsive Aspect-Ratio Containment**
   - _Decision_: Download all 18 page SVGs (`https://svg.issuu.com/231226180457-c79fccd91dae7f5484168dde1fa9b05c/page_1.svg` .. `page_18.svg`) into `public/pages/page_1.svg`..`page_18.svg` and render them inside `.page__content` along with interactive CSS (`:hover`) and page badge markup. Size `.page` with reasonable viewport padding (`box-sizing: border-box`) and constrain `.page__content` (via `aspect-ratio`, `max-width: 100%`, `max-height: 100%`, `width: auto`, `height: auto`, `overflow: hidden`) so that regardless of the page aspect ratio or viewport shape (primarily mobile portrait, plus desktop), the page always fits inside the available padded space without overflowing or triggering scrollbars.
   - _Rationale_: Ensures clean single-page framing on mobile portrait and any screen size while providing 18 real vector book pages for `webgl-html-in-canvas`'s `texElementImage2D` pipeline.

3. **Strict Zero-JS Entrypoint**
   - _Decision_: `src/main.ts` contains only `import './style.css';`.
   - _Rationale_: Proves that 100% of pagination feel, momentum, and accessibility come from the browser's scrolling engine.

## Risks / Trade-offs

- **[Risk] Trackpad momentum skips multiple pages in one flick** → Mitigation: Set `scroll-snap-stop: always` on `.page` so each gesture settles on the adjacent page.
- **[Risk] Horizontal swipe triggers browser back/forward navigation** → Mitigation: Set `overscroll-behavior-x: contain` on `.book`.
- **[Risk] Choice of `scroll-snap-align` affects downstream math** → Mitigation: Whichever alignment (`start` vs `center`, `OQ-12`) is chosen initially defines `--progress = 0` in `css-state-engine` and `scrollLeft` normalization in `cone-vertex-shader`. Pick once and keep consistent across all changes.

## Open Questions (Resolved)

- **`OQ-11` (Single page or two-page spread for the PoC?)**: **Decided — Single-page view** (`flex: 0 0 100%`), primarily tested in mobile portrait mode and responsive across viewports.
- **`OQ-12` (Snap alignment `start` vs `center`?)**: **Decided — `scroll-snap-align: center`**.
