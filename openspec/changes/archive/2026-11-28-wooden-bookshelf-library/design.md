# Design

## Context

See [proposal.md](proposal.md). Currently `src/library.css` renders a flat dark `auto-fill` grid with bordered cards and no bookshelf metaphor.

## Goals / Non-Goals

**Goals:**

- Present the library inside a warm wooden bookshelf cabinet backdrop.
- Render a thick, realistic wooden shelf board spanning 100% of every row (including partial rows such as a single book).
- Enforce exact orientation-based column counts: 2 books per row in portrait and 3 books per row in landscape.
- Highlight the hovered or keyboard-focused book with a pure-CSS overhead spotlight while keeping zero external image assets or JS layout listeners.

**Non-Goals:**

- Modifying `src/books/catalog.ts`, adding WebGL to `index.html`, or changing `reader.html`.

## Decisions

1. **Orientation-driven CSS Grid (`--shelf-cols`)**:
   - Define `--shelf-cols: 3` by default and in `@media (orientation: landscape)`, and `--shelf-cols: 2` in `@media (orientation: portrait)`.
   - Use `grid-template-columns: repeat(var(--shelf-cols), minmax(0, 1fr))` with `align-items: end` on `.shelf` so books rest flush on the shelf ledge regardless of title length.
   - Alternative considered: `auto-fit`/`minmax()` columns. Rejected because it does not guarantee exact 2-column portrait / 3-column landscape counts across varying screen widths.

2. **Pure-CSS full-row thick wooden board**:
   - Attach the full-row shelf board via `::after` on the first `.shelf__item` of each row (`:nth-child(2n + 1)` in portrait, `:nth-child(3n + 1)` in landscape), positioned beneath the row items and sized across all `--shelf-cols` tracks (`calc(var(--shelf-cols) * 100% + (var(--shelf-cols) - 1) * var(--shelf-gap) + 2 * var(--shelf-pad-x))`, `left: calc(-1 * var(--shelf-pad-x))`).
   - Build the board with a lit top ledge surface, a thick wood-grained front fascia, and a soft cast shadow onto the cabinet back panel below.
   - Alternative considered: grouping `.shelf__item` elements into `.shelf-row` wrappers in `src/library.ts` via `matchMedia`. Rejected because CSS `:nth-child()` + `calc()` avoids DOM restructuring on orientation change and keeps layout 100% declarative.

3. **Zero-asset wood grain & cabinet framing**:
   - Render warm walnut/oak tones, wood grain striations, cabinet side uprights, and recessed bay shadows using layered CSS gradients (with optional inline SVG `feTurbulence` data-URI texture), avoiding external image fetches.

4. **Pure-CSS overhead spotlight**:
   - Render a warm overhead cone of light (`radial-gradient` / `conic-gradient`) and shelf bounce highlight on `.book-card:hover` / `.book-card:focus-visible`, paired with subtle dimming on non-selected items via `.shelf:has(.book-card:hover, .book-card:focus-visible) .shelf__item:not(:has(.book-card:hover, .book-card:focus-visible))`.
   - Gate transform/transition motion under `@media (prefers-reduced-motion: no-preference)` and preserve crisp `:focus-visible` outlines.

## Risks / Trade-offs

- **Sub-pixel rounding on `calc()` shelf width** → Add `overflow-x: clip` on the cabinet container and a `1px` overlap into the cabinet side uprights so no gap appears at any viewport width.
- **Metadata contrast over wood tones** → Style book title, subtitle, and page count inside a high-contrast dark plaque or legible high-contrast text treatment meeting WCAG AA contrast.
- **Narrow portrait viewports (~360px)** → Use responsive `clamp()` spacing and font sizes so 2 items per row remain comfortable and readable without horizontal overflow.
