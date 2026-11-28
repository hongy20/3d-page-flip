# book-scroller Specification

## Purpose

Provides the native CSS horizontal scroll-snap book container, renderer-agnostic HTML/SVG page structure, paper layout styling, and zero-JS navigation physics for Dropp.

## Requirements

### Requirement: Vite and strict TypeScript project scaffolding

The project SHALL be initialized with Vite (`vanilla-ts`), configured with `strict: true` in `tsconfig.json`, stripped of template demo boilerplate, and include a `.gitignore` for `node_modules/` and `dist/`, npm scripts `dev`, `build`, and `preview`, and zero runtime dependencies in `package.json`.

#### Scenario: Clean development server and production build

- **WHEN** `npm install && npm run build` is executed
- **THEN** the build succeeds with zero TypeScript errors and `package.json` contains no runtime `dependencies`

### Requirement: Book scroller and renderer-agnostic page DOM structure

`reader.html` SHALL contain one scroller element (`.book`) whose `.page` elements (`1..N`) and `--page-aspect` are constructed from the selected catalog book and populated at runtime with inline `<svg>` content (`.page__content`) displaying `public/books/<id>/page_1.svg`..`page_N.svg`, interactive `:hover` badges, a back-to-library link and a `Settings` link in `.controls` (replacing the inline mode radio group), and preserved native SVG links.

#### Scenario: Eighteen accessible HTML/SVG pages rendered

- **WHEN** `reader.html` is loaded in Chrome with the default Málaga catalog book
- **THEN** `.book` contains 18 `.page` elements rendering inline `page_1.svg` through `page_18.svg`, interactive `:hover` styling, and `Library` plus `Settings` links in `.controls`

#### Scenario: Selected catalog book renders N accessible HTML/SVG pages

- **WHEN** `reader.html?book=<id>` is loaded in Chrome for a catalog book with `N` pages
- **THEN** `.book` contains `N` `.page` elements rendering inline `page_1.svg` through `page_N.svg` with `--page-aspect` set from the book manifest and interactive `:hover` styling

### Requirement: Native horizontal flex scroll-snap container with momentum multi-page swipe

`.book` SHALL be styled as `display: flex`, `overflow-x: auto`, `overflow-y: hidden`, `scroll-snap-type: x mandatory`, fill the viewport (`100dvh`), hide its scrollbar, and set `overscroll-behavior-x: none` (suppressing both browser back/forward history gestures and edge elastic bounce-back). Each `.page` SHALL be `flex: 0 0 100%` of the scroller width with `scroll-snap-align: center` and `scroll-snap-stop: normal`, centering its `.page__content` with reasonable surrounding padding so fast, strong swipes can traverse multiple pages via native momentum.

#### Scenario: Normal gesture snaps to the adjacent page

- **WHEN** the user performs a normal swipe, drag, `Shift+wheel`, or keyboard arrow navigation
- **THEN** `.book` scrolls using native momentum and settles center-snapped on the adjacent page without triggering browser back/forward history gestures

#### Scenario: Strong fast swipe advances multiple pages via native momentum

- **WHEN** the user performs a strong, fast horizontal swipe across `.book`
- **THEN** native CSS scroll momentum carries across intermediate pages before settling center-snapped on a further page with zero JS physics

### Requirement: Bottom-centered page number badge

`.page__badge` SHALL be positioned horizontally centered along the bottom edge of `.page__content` while preserving hover/focus styling and clickability.

#### Scenario: Page number badge is centered at the bottom of each page

- **WHEN** a page renders
- **THEN** `.page__badge` is horizontally centered at the bottom edge of `.page__content` and remains clickable with hover/focus visual feedback

### Requirement: Responsive aspect-ratio-preserving paper page styling

Each `.page__content` element SHALL preserve its aspect ratio and paper-like visual styling, dynamically fitting within the available padded `.page` area across mobile portrait and desktop viewports without ever overflowing or triggering inner/vertical scrollbars.

#### Scenario: Pages always fit within available padded viewport space without scrollbars

- **WHEN** the viewport is viewed in mobile portrait mode or resized across arbitrary aspect ratios
- **THEN** `.page__content` maintains its aspect ratio, stays fully contained within the padded `.page` bounds, and triggers zero inner or vertical scrollbars

### Requirement: Zero-JS navigation physics and no DOM movement

All dragging, touch tracking, momentum, and snapping SHALL come exclusively from native CSS scrolling. The codebase SHALL NOT include JS animation or physics libraries, SHALL NOT register `touchstart`, `touchmove`, `touchend`, `pointer*`, `mouse*`, or `wheel` event listeners for navigation, and SHALL NOT mutate DOM element positions or scroll offsets (`style.transform`, `left`, `scrollLeft`, `scrollTo()`).

#### Scenario: Static inspection confirms zero navigation listeners or DOM movement

- **WHEN** `src/` is searched for navigation event listeners (`touch*`, `pointer*`, `mouse*`, `wheel`) or DOM position/scroll mutations (`style.transform`, `scrollLeft`, `scrollTo`)
- **THEN** zero matches are found

### Requirement: Inline DOM SVG page content for screen-reader accessibility

Each `.page__content` SHALL mount its page artwork at runtime via `fetch()` (using base-URL-aware paths via `import.meta.env.BASE_URL`, prioritizing page 1 first) as a real inline `<svg>` DOM element (rather than an `<img>`) and notify the drawable canvas (`canvas.requestPaint?.()`) on mount so SVG `<text>` content and semantics are exposed to screen readers without ID or `@font-face` collisions across the 18 pages.

#### Scenario: Screen readers can access inline SVG text across all 18 pages

- **WHEN** the reader loads in Chrome
- **THEN** each `.page__content` contains an inline `<svg>` element fetched at runtime whose `<text>` nodes are present in the accessibility tree and render without font or ID collisions

### Requirement: Native SVG hyperlinks preserved inside inline page SVGs

Existing native SVG `<a href="...">` elements inside `public/pages/page_*.svg` SHALL be preserved untouched and exposed as natively clickable and keyboard-focusable hyperlinks when mounted inline, with zero JS click handlers and zero edits to `public/pages/page_*.svg`.

#### Scenario: URLs inside page SVGs open as native SVG hyperlinks

- **WHEN** a user clicks or activates via keyboard an existing `<a href="...">` link rendered inside an inline page `<svg>`
- **THEN** the browser navigates via the native SVG `<a href="...">` element with zero JS click interception
