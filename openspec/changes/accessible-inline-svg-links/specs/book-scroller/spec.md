# Spec Delta

## ADDED Requirements

### Requirement: Inline DOM SVG page content for screen-reader accessibility

Each `.page__content` SHALL contain the page artwork as a real inline `<svg>` DOM element (rather than an `<img>`) so SVG `<text>` content and semantics are exposed to screen readers without ID or `@font-face` collisions across the 18 pages.

#### Scenario: Screen readers can access inline SVG text across all 18 pages

- **WHEN** the reader loads in Chrome
- **THEN** each `.page__content` contains an inline `<svg>` element whose `<text>` nodes are present in the accessibility tree and render without font or ID collisions

### Requirement: Native SVG hyperlinks for URLs within page SVGs

Valid URLs contained in `public/pages/page_*.svg` SHALL be wrapped in standard SVG `<a href="..." target="_blank" rel="noopener noreferrer">` elements inside the SVG files themselves so links are natively clickable and keyboard-focusable without JS click handlers.

#### Scenario: URLs inside page SVGs open as native SVG hyperlinks

- **WHEN** a user clicks or activates via keyboard a URL rendered inside an inline page `<svg>`
- **THEN** the browser navigates via the native SVG `<a href="...">` element with zero JS click interception

## MODIFIED Requirements

### Requirement: Book scroller and renderer-agnostic page DOM structure

`index.html` SHALL contain one scroller element (`.book`) holding 18 page elements (`.page`), each containing static HTML and inline `<svg>` content (`.page__content`) authored without renderer-specific coupling, displaying the 18 page SVGs (`public/pages/page_1.svg`..`page_18.svg`) with interactive CSS (`:hover`) elements and native SVG links while preserving native DOM accessibility.

#### Scenario: Eighteen accessible HTML/SVG pages rendered

- **WHEN** `index.html` is loaded in Chrome
- **THEN** `.book` contains 18 `.page` elements rendering `page_1.svg` through `page_18.svg` and interactive `:hover` styling
