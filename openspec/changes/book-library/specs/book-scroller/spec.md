# Spec Delta

## MODIFIED Requirements

### Requirement: Book scroller and renderer-agnostic page DOM structure

`reader.html` SHALL contain one scroller element (`.book`) whose `.page` elements (`1..N`) and `--page-aspect` are constructed from the selected catalog book and populated at runtime with inline `<svg>` content (`.page__content`) displaying `public/books/<id>/page_1.svg`..`page_N.svg`, interactive `:hover` badges, a back-to-library link in `.controls`, and preserved native SVG links.

#### Scenario: Eighteen accessible HTML/SVG pages rendered

- **WHEN** `reader.html` is loaded in Chrome with the default Málaga catalog book
- **THEN** `.book` contains 18 `.page` elements rendering inline `page_1.svg` through `page_18.svg` and interactive `:hover` styling

#### Scenario: Selected catalog book renders N accessible HTML/SVG pages

- **WHEN** `reader.html?book=<id>` is loaded in Chrome for a catalog book with `N` pages
- **THEN** `.book` contains `N` `.page` elements rendering inline `page_1.svg` through `page_N.svg` with `--page-aspect` set from the book manifest and interactive `:hover` styling
