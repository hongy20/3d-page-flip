# Spec Delta

## ADDED Requirements

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
