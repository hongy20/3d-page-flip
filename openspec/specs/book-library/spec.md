# book-library Specification

## Purpose

Provides a static catalog of repo-hosted SVG books, an accessible shelf landing page (`index.html`), and multi-page navigation into and back from the 3D book reader (`reader.html?book=<id>`).

## Requirements

### Requirement: Static repo-hosted SVG book catalog

`src/books/catalog.ts` SHALL define a typed catalog of repo-hosted SVG books (`id`, `title`, `subtitle?`, `pageCount`, `aspectRatio`, `basePath`, `coverPath`), starting with the Málaga brochure (`malaga`, 18 pages, `2115 / 2990`, `books/malaga`), plus a pure lookup helper (`resolveBook(id)`). Adding another book SHALL require only placing SVG pages under `public/books/<id>/` and adding an entry in `src/books/catalog.ts`.

#### Scenario: Catalog resolves known book and builds base-aware page paths

- **WHEN** `resolveBook("malaga")` is called
- **THEN** it returns the Málaga manifest with `pageCount: 18`, `aspectRatio: "2115 / 2990"`, and relative page paths `books/malaga/page_1.svg`..`books/malaga/page_18.svg`

### Requirement: Accessible book shelf landing page

`index.html` SHALL render a responsive, accessible book library listing every entry in the catalog with its cover thumbnail, title, page count, and a native `<a href="./reader.html?book=<id>">` link with no JS click router required.

#### Scenario: Clicking a book card navigates to the reader for that book

- **WHEN** a visitor opens `index.html` and activates a book card's link
- **THEN** the browser navigates directly via `<a href="./reader.html?book=<id>">` to the reader for that book

### Requirement: Reader book selection, fallback, and back-to-library navigation

`reader.html` SHALL read `?book=<id>` from `window.location.search`, default to the first catalog book when `book` is omitted, display an accessible not-found fallback with a link back to `./` when `<id>` does not match any catalog entry, update `document.title` to include the book title, and provide a native `<a href="./">` back-to-library link inside `.controls`.

#### Scenario: Valid book query parameter loads the selected book

- **WHEN** a visitor opens `reader.html?book=malaga`
- **THEN** `document.title` includes the Málaga book title, 18 `.page` elements are rendered, and `.controls` includes a clickable link back to `./`

#### Scenario: Omitted book query parameter defaults to the first catalog entry

- **WHEN** a visitor opens `reader.html` without a `book` query parameter
- **THEN** the reader loads the first book in `src/books/catalog.ts`

#### Scenario: Unknown book query parameter renders an accessible not-found fallback

- **WHEN** a visitor opens `reader.html?book=missing`
- **THEN** the reader displays an accessible not-found message with a native `<a href="./">` link back to the book library without crashing WebGL initialization

### Requirement: Multi-page Vite production build

`vite.config.ts` SHALL configure Rollup `build.rollupOptions.input` with `index.html`, `reader.html`, and `settings.html` using relative/base-aware asset links so both local dev/preview and subpath deployments (such as GitHub Pages `/dropp/`) resolve all entrypoints and assets with zero 404s. `index.html` SHALL include a native `<a href="./settings.html">` link to settings.

#### Scenario: Production build emits both library and reader entrypoints

- **WHEN** `npm run build` is executed
- **THEN** `dist/` contains `dist/index.html`, `dist/reader.html`, and `dist/settings.html` with valid bundled JS/CSS references

### Requirement: Orientation-based responsive bookshelf row layout

The book shelf grid in `index.html` / `src/library.css` SHALL display 2 book slots per row in portrait orientation (`(orientation: portrait)`) and 3 book slots per row in landscape orientation (`(orientation: landscape)`), reflowing purely via CSS without JS resize listeners.

#### Scenario: Portrait orientation displays 2 items per row

- **WHEN** the viewport is in portrait orientation
- **THEN** `.shelf` uses a 2-column grid layout with books aligned onto shelf rows

#### Scenario: Landscape orientation displays 3 items per row

- **WHEN** the viewport is in landscape orientation
- **THEN** `.shelf` uses a 3-column grid layout with books aligned onto shelf rows

### Requirement: Wooden bookshelf cabinet backdrop and full-width thick wooden shelf boards

The library page SHALL render a wooden bookshelf background and a thick wooden shelf board visually supporting the bottom of every row of books, spanning the full width of the shelf row even when the row contains fewer books than the row capacity, using CSS/inline SVG styling with zero external image dependencies.

#### Scenario: Full-width thick wooden board supports partial and full rows

- **WHEN** the library renders one or more books in portrait or landscape orientation
- **THEN** a thick wooden shelf board spans the full shelf row width beneath every row of books with books resting flush on the board and zero external image requests

### Requirement: Spotlight highlight effect for hovered and focused book selection

Hovering or keyboard-focusing a book card (`:hover` / `:focus-visible`) SHALL illuminate the selected book with an overhead spotlight effect and elevated shelf contrast via pure CSS while preserving keyboard focus visibility, legibility, and `prefers-reduced-motion` accessibility.

#### Scenario: Hovering or focusing a book card activates the spotlight highlight

- **WHEN** a visitor hovers over or focuses a book card with the keyboard
- **THEN** a visible overhead spotlight illuminates that book card and its shelf surface while keeping the native link focusable and legible
