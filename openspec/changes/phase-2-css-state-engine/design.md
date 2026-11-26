# Design: Phase 2, CSS State Engine

## Context

See `proposal.md` for motivation. Building on `book-scroller`'s `.book` and `.page` flex scroll-snap layout, Phase 2 binds each `.page` to a `view(inline)` scroll-driven animation timeline that drives a registered `@property --progress` from `-1` to `1`. That declarative state powers extensible pure-CSS transition modes (`slide` and `stack`) and a pure-CSS debug readout, and establishes CSS `--progress` as the single source of truth consumed by Phase 4.

## Goals / Non-Goals

**Goals:**
- Provide an exact, linear `-1 -> 0 -> 1` progress signal per page purely in CSS, including boundary cases (first page `[0, 1]`, last page `[-1, 0]`) and single-page books (`N = 1` resolving to `0`).
- Support extensible pure-CSS transition modes (`slide` default and `stack`) switched via JS-free HTML form controls and `:has()`.
- Render a zero-JS on-screen debug readout so the mapping and sign convention can be verified visually.
- Establish CSS `--progress` as the single canonical animation state shared between Phase 2 CSS transitions and Phase 4 WebGL uniforms.

**Non-Goals:**
- Any JavaScript execution for `--progress`, transition modes, or debug toggling in Phase 2 (`src/main.ts` remains stylesheet-import-only).
- WebGL context creation or HTML-in-Canvas texture upload (Phase 3), or reading `--progress` in JS for WebGL uniforms (Phase 4).

## Decisions

1. **`view(inline)` Timeline, Range Mapping, and Boundary / Single-Page Behavior**
   - *Decision*: Attach `animation-timeline: view(inline)`, `animation-timing-function: linear`, and `animation-fill-mode: both` to `.page` across the full `cover` (`entry 0%` to `exit 100%`) range.
   - *Rationale*: Because each `.page` is `100%` of the scroller width (`book-scroller`), the `cover` range naturally spans `-1` page-width (entering from right) through `0` (centered/snapped at `50%`) to `+1` page-width (exiting to left):
     - **First page** (in a multi-page book): initially centered at `scrollLeft = 0`, which corresponds to `50%` of its `view(inline)` timeline, so `--progress` starts at `0` and ranges over `[0, 1]` (never `-1`).
     - **Last page** (in a multi-page book): enters from `-1` and stops centered at max scroll (`50%` of its `view(inline)` timeline), so `--progress` ranges over `[-1, 0]` and ends at `0` (never `1`).
     - **Single-page book (`N = 1`)**: `.book` has zero scrollable overflow, so per CSS Scroll-Driven Animations semantics the `view(inline)` timeline is inactive; the animation does not apply and `--progress` resolves cleanly to `@property`'s `initial-value: 0`.
   - This will be verified empirically in Chrome DevTools Animations panel and refined with explicit `animation-range` if needed.

2. **Stacked-Page Transition Mode (`stack`) in Pure CSS**
   - *Decision*: When `stack` mode is active, apply `transform: translateX(calc(min(var(--progress), 0) * 100%))` on `.page` and derive a non-negative `z-index` from `--progress` (e.g., `calc(100 + var(--progress-pct))`) with `isolation: isolate` on `.book`.
   - *Rationale*:
     - For the outgoing / top page (`--progress` in `[0, 1]`), `min(--progress, 0) = 0`, so `translateX(0)` leaves it in native scroll flow—sliding out to the left on a forward swipe and sliding back in from the left on a backward swipe.
     - For the immediate incoming / underneath page (`--progress` in `[-1, 0]`), `translateX(var(--progress) * 100%)` counter-translates the native scroll offset `-100% -> 0%`, pinning it stationary underneath the top page during both forward and backward swipes.
     - Further pages (`i + 2`, `i + 3`, …) are clamped at `--progress = -1`, keeping them translated `-100%` relative to their right-hand flex slot (i.e., waiting offscreen or behind without perturbing scroll snap). Because the immediate incoming page covers the viewport and sits at higher `z-index` than `i + 2`, no further page bleeds through.
     - Because the smaller-numbered page always has `--progress` equal to `next_page.--progress + 1`, deriving `z-index` from `--progress` guarantees smaller page numbers strictly stack on top of larger page numbers for arbitrary page counts without per-page CSS rules or HTML indices.
     - Per CSS View Timelines, `view(inline)` tracks untransformed layout boxes, so applying `transform` on `.page` does not perturb the `--progress` timeline.

3. **JS-Free Mode Switcher & Pure-CSS Debug Readout**
   - *Decision*: Place a native `<fieldset>` in `index.html` containing `<input type="radio" name="mode" value="slide" checked>`, `<input type="radio" name="mode" value="stack">`, and `<input type="checkbox" name="debug">`, wired solely through CSS `:has()` selectors (e.g. `body:has(input[name="mode"][value="stack"]:checked) .page`). Register an `<integer>` helper property `--progress-pct` (`syntax: '<integer>'`, `inherits: true`, `initial-value: 0`) set to `calc(var(--progress) * 100)` on `.page`, and render it via `counter-reset` + `::after { content: counter(...) }` when debug is checked.
   - *Rationale*: Provides accessible, zero-JS mode switching and live numerical readout. Future animation modes (including Phase 4 `curl`) simply add a new `<input type="radio">` and one CSS rule block.

4. **Single Source of Truth with Phase 4 (`OQ-02` Resolved)**
   - *Decision*: CSS `--progress` is the single source of truth for animation state. Phase 4 JS reads `--progress` on active/visible `.page` element(s) via CSSOM (`computedStyleMap().get('--progress')` / `getComputedStyle()`) rather than reading `book.scrollLeft`.
   - *Rationale*: Guarantees Phase 2 CSS transitions and Phase 4 WebGL curl deformation are driven by the exact same declarative scroll-timeline signal, while Phase 2 itself remains 100% JS-free.

## Risks / Trade-offs

- **[Risk] CSS `counter()` only accepts integers** → Mitigation: Multiply `--progress` by `100` into a registered `<integer>` custom property (`--progress-pct`) so the debug badge displays `-100` to `100` (representing `-1.00` to `1.00`).
- **[Risk] Mismatch between `book-scroller` `scroll-snap-align` and `view(inline)` midpoint** → Mitigation: Verify empirically with the debug badge that the snapped resting state reads `0`.
- **[Risk] CSSOM per-frame read overhead in Phase 4** → Mitigation: In Phase 4, read `--progress` via CSS Typed OM (`computedStyleMap().get('--progress')`) only for the active/adjacent visible pages rather than scanning the entire book.
- **[Risk] `stack` mode clipping or stacking-context leaks** → Mitigation: Set `isolation: isolate` on `.book`, keep `z-index` non-negative (`calc(100 + var(--progress-pct))`), and apply `transform` to `.page` (not `.page__content`) so card shadows and `view(inline)` layout geometry remain intact.

## Open Questions

Must be resolved with the human before implementation (recorded in `proposal.md` / `design.md`):

- **`OQ-02` (What does CSS `--progress` drive?)**: **Decided** — CSS `--progress` is the single source of truth for animation state: in Phase 2 it drives pure-CSS transition modes (`slide`, `stack`) and the pure-CSS debug readout; in Phase 4 JS reads `--progress` via CSSOM (`computedStyleMap()` / `getComputedStyle()`) to feed WebGL shader uniforms instead of reading `book.scrollLeft`.
- **`OQ-12` (Snap alignment `start` vs `center`)**: **Decided — `scroll-snap-align: center`**, matching `book-scroller`'s snap alignment so `--progress = 0` at the center-snapped position.
