# book-scroller Specification

## Purpose

Provides the native CSS horizontal scroll-snap book container, renderer-agnostic HTML/SVG page structure, paper layout styling, and zero-JS navigation physics for WebBook 3D.

## Requirements

### Requirement: Vite and strict TypeScript project scaffolding
The project SHALL be initialized with Vite (`vanilla-ts`), configured with `strict: true` in `tsconfig.json`, stripped of template demo boilerplate, and include a `.gitignore` for `node_modules/` and `dist/`, npm scripts `dev`, `build`, and `preview`, and zero runtime dependencies in `package.json`.

#### Scenario: Clean development server and production build
- **WHEN** `npm install && npm run build` is executed
- **THEN** the build succeeds with zero TypeScript errors and `package.json` contains no runtime `dependencies`

### Requirement: Book scroller and renderer-agnostic page DOM structure
`index.html` SHALL contain one scroller element (`.book`) holding 18 page elements (`.page`), each containing static HTML/SVG content (`.page__content`) authored without renderer-specific coupling, displaying the 18 downloaded page SVGs (`public/pages/page_1.svg`..`page_18.svg`) alongside interactive CSS (`:hover`) elements while preserving native DOM accessibility.

#### Scenario: Eighteen accessible HTML/SVG pages rendered
- **WHEN** `index.html` is loaded in Chrome
- **THEN** `.book` contains 18 `.page` elements rendering `page_1.svg` through `page_18.svg` and interactive `:hover` styling

### Requirement: Native horizontal flex scroll-snap container
`.book` SHALL be styled as `display: flex`, `overflow-x: auto`, `overflow-y: hidden`, `scroll-snap-type: x mandatory`, fill the viewport (`100dvh`), hide its scrollbar, and set `overscroll-behavior-x: contain`. Each `.page` SHALL be `flex: 0 0 100%` of the scroller width with `scroll-snap-align: center` and `scroll-snap-stop: always`, centering its `.page__content` with reasonable surrounding padding.

#### Scenario: Single-page snap navigation across input modalities
- **WHEN** the user navigates horizontally via trackpad swipe, touch drag, `Shift+wheel`, or keyboard arrow keys
- **THEN** `.book` scrolls using native momentum and settles center-snapped by at most one `.page` per gesture without triggering browser back/forward history gestures

### Requirement: Responsive aspect-ratio-preserving paper page styling
Each `.page__content` element SHALL preserve its aspect ratio and paper-like visual styling, dynamically fitting within the available padded `.page` area across mobile portrait and desktop viewports without ever overflowing or triggering inner/vertical scrollbars.

#### Scenario: Pages always fit within available padded viewport space without scrollbars
- **WHEN** the viewport is viewed in mobile portrait mode or resized across arbitrary aspect ratios
- **THEN** `.page__content` maintains its aspect ratio, stays fully contained within the padded `.page` bounds, and triggers zero inner or vertical scrollbars

### Requirement: Zero-JS navigation physics and no DOM movement
All dragging, touch tracking, momentum, and snapping SHALL come exclusively from native CSS scrolling. The codebase SHALL NOT include JS animation or physics libraries, SHALL NOT register `touchstart`, `touchmove`, `touchend`, `pointer*`, `mouse*`, or `wheel` event listeners for navigation, and SHALL NOT mutate DOM element positions or scroll offsets (`style.transform`, `left`, `scrollLeft`, `scrollTo()`). In Phase 1, `src/main.ts` SHALL only import the stylesheet.

#### Scenario: Static inspection confirms zero navigation listeners or DOM movement
- **WHEN** `src/` is searched for `addEventListener` or `on(touch|wheel|pointer|mouse)` handlers
- **THEN** zero matches are found and `src/main.ts` contains only the stylesheet import
