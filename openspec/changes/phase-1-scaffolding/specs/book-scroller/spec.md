# Spec Delta: book-scroller

## Purpose

Provides the native CSS horizontal scroll-snap book container, renderer-agnostic HTML/SVG page structure, paper layout styling, and zero-JS navigation physics for WebBook 3D (`SCF-01`..`SCF-09`, `ARCH-01`..`ARCH-04`, `ARCH-11`, `ARCH-15`, `ARCH-16`).

## ADDED Requirements

### Requirement: Vite and strict TypeScript project scaffolding (SCF-01, SCF-02, SCF-09, ARCH-11, ARCH-15)
The project SHALL be initialized with Vite (`vanilla-ts`), configured with `strict: true` in `tsconfig.json`, stripped of template demo boilerplate, and include a `.gitignore` for `node_modules/` and `dist/`, npm scripts `dev`, `build`, and `preview`, and zero runtime dependencies in `package.json`.

#### Scenario: Clean development server and production build
- **WHEN** `npm install && npm run build` is executed
- **THEN** the build succeeds with zero TypeScript errors and `package.json` contains no runtime `dependencies`

### Requirement: Book scroller and renderer-agnostic page DOM structure (SCF-03, VIS-05, ARCH-16)
`index.html` SHALL contain one scroller element (`.book`) holding `N >= 4` page elements (`.page`), each containing static HTML/SVG content (`.page__content`) authored without renderer-specific coupling, including at least one SVG illustration and one page with interactive CSS (`:hover`), while preserving native DOM text selection and accessibility.

#### Scenario: Four or more accessible HTML/SVG pages rendered
- **WHEN** `index.html` is loaded in Chrome
- **THEN** `.book` contains at least 4 `.page` elements with selectable text, an SVG illustration, and an interactive `:hover` element

### Requirement: Native horizontal flex scroll-snap container (SCF-04, SCF-05, SCF-06, ARCH-04)
`.book` SHALL be styled as `display: flex`, `overflow-x: auto`, `overflow-y: hidden`, `scroll-snap-type: x mandatory`, fill the viewport (`100dvh`), hide its scrollbar, and set `overscroll-behavior-x: contain`. Each `.page` SHALL be `flex: 0 0 100%` of the scroller width with `scroll-snap-align: start` (or `center`, per `OQ-12`) and `scroll-snap-stop: always`.

#### Scenario: Single-page snap navigation across input modalities
- **WHEN** the user navigates horizontally via trackpad swipe, touch drag, `Shift+wheel`, or keyboard arrow keys
- **THEN** `.book` scrolls using native momentum and settles snapped by at most one `.page` per gesture without triggering browser back/forward history gestures

### Requirement: Fixed aspect ratio paper page styling (SCF-07)
Each `.page__content` element SHALL have a fixed aspect ratio (such as `3:4`) and paper-like visual styling so it is recognizable as a book page both in flat DOM layout and when later uploaded as a GPU texture.

#### Scenario: Pages display with fixed aspect ratio paper styling
- **WHEN** the viewport is resized across desktop or mobile dimensions
- **THEN** `.page__content` maintains its configured aspect ratio and paper appearance within each full-viewport `.page` snap target

### Requirement: Zero-JS navigation physics and no DOM movement (SCF-08, ARCH-01, ARCH-02, ARCH-03)
All dragging, touch tracking, momentum, and snapping SHALL come exclusively from native CSS scrolling. The codebase SHALL NOT include JS animation or physics libraries, SHALL NOT register `touchstart`, `touchmove`, `touchend`, `pointer*`, `mouse*`, or `wheel` event listeners for navigation, and SHALL NOT mutate DOM element positions or scroll offsets (`style.transform`, `left`, `scrollLeft`, `scrollTo()`). In Phase 1, `src/main.ts` SHALL only import the stylesheet.

#### Scenario: Static inspection confirms zero navigation listeners or DOM movement
- **WHEN** `src/` is searched for `addEventListener` or `on(touch|wheel|pointer|mouse)` handlers
- **THEN** zero matches are found and `src/main.ts` contains only the stylesheet import
