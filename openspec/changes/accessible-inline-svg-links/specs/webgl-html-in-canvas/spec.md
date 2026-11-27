# Spec Delta

## MODIFIED Requirements

### Requirement: Single-DOM native scroll pass-through and hit-test geometry sync
The `<main class="book" drawable>` scroller and its pages SHALL live inside `<canvas content="drawable">`, with `drawable` on `.book` and each `<article class="page__content" drawable>`. The application SHALL synchronize `.book` and active `.page__content` hit-test geometry via `canvas.updateElementGeometry(el, { canvasTransform })` in canvas CSS pixel units so user input (trackpad, touch, wheel, keyboard, `:hover`, inline SVG `<a>` links, and button clicks) reaches `.book` and `.page__content` and produces the exact snap pagination and `--progress` behavior established in `book-scroller` and `css-scroll-state`.

#### Scenario: Native scroll, snap, and button interaction behave identically with WebGL overlay active
- **WHEN** the user scrolls, swipes, hovers, or clicks interactive controls over the viewport with the WebGL canvas active
- **THEN** `.book` scrolls and snaps one page per gesture identically to `book-scroller`, `view(inline)` updates `--progress`, and `.page__badge` receives `:hover` and click events

#### Scenario: Inline SVG hyperlinks remain clickable through WebGL hit-test sync
- **WHEN** the user clicks an `<a href="...">` link inside an inline page `<svg>` on the currently active page
- **THEN** the WebGL hit-test geometry routes the click to the underlying DOM `<a>` element and opens the link without breaking scroll or curl interaction
