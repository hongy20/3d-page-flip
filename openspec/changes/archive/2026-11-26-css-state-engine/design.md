# Design: CSS State Engine

## Context

See `proposal.md` for motivation. Building on `book-scroller`'s `.book` and `.page` flex scroll-snap layout, this change binds each `.page` to a `view(inline)` scroll-driven animation timeline that drives a registered `@property --progress` from `-1` to `1`. That declarative state powers extensible pure-CSS transition modes (`slide` and `stack`) and a pure-CSS debug readout, and establishes CSS `--progress` as the single source of truth consumed by `cone-vertex-shader`.

## Goals / Non-Goals

**Goals:**

- Provide an exact, linear `-1 -> 0 -> 1` progress signal per page purely in CSS, including boundary cases (first page `[0, 1]`, last page `[-1, 0]`) and single-page books (`N = 1` resolving to `0`).
- Support extensible pure-CSS transition modes (`slide` default and `stack`) switched via JS-free HTML form controls and `:has()`.
- Render a zero-JS on-screen debug readout so the mapping and sign convention can be verified visually.
- Establish CSS `--progress` as the single canonical animation state shared between CSS transitions and WebGL uniforms.

**Non-Goals:**

- Any JavaScript execution for `--progress`, transition modes, or debug toggling in this change (`src/main.ts` remains stylesheet-import-only).
- WebGL context creation or HTML-in-Canvas texture upload (`webgl-html-in-canvas`), or reading `--progress` in JS for WebGL uniforms (`cone-vertex-shader`).

## Decisions

1. **`view(inline)` Timeline, Range Mapping, and Boundary / Single-Page Behavior**
   - _Decision_: Attach `animation-timeline: view(inline)`, `animation-timing-function: linear`, and `animation-fill-mode: both` to `.page` across the full `cover` (`entry 0%` to `exit 100%`) range.
   - _Rationale_: Because each `.page` is `100%` of the scroller width (`book-scroller`), the `cover` range naturally spans `-1` page-width (entering from right) through `0` (centered/snapped at `50%`) to `+1` page-width (exiting to left):
     - **First page** (in a multi-page book): initially centered at `scrollLeft = 0`, which corresponds to `50%` of its `view(inline)` timeline, so `--progress` starts at `0` and ranges over `[0, 1]` (never `-1`).
     - **Last page** (in a multi-page book): enters from `-1` and stops centered at max scroll (`50%` of its `view(inline)` timeline), so `--progress` ranges over `[-1, 0]` and ends at `0` (never `1`).
     - **Single-page book (`N = 1`)**: `.book` has zero scrollable overflow, so per CSS Scroll-Driven Animations semantics the `view(inline)` timeline is inactive; the animation does not apply and `--progress` resolves cleanly to `@property`'s `initial-value: 0`.
   - This will be verified empirically in Chrome DevTools Animations panel and refined with explicit `animation-range` if needed.

2. **Stacked-Page Transition Mode (`stack`) in Pure CSS**
   - _Decision_: When `stack` mode is active, apply `position: sticky; right: 0;`, `z-index: calc(sibling-count() - sibling-index());`, and `opacity: clamp(0, calc((var(--progress) + 1) * 10000), 1);` on `.page` with `isolation: isolate` on `.book`.
   - _Rationale_:
     - `position: sticky; right: 0;` keeps any page still to the right of its snapped position pinned natively at the right edge of `.book` on the compositor thread—with zero main-thread lag/jitter, intact `scroll-snap-align: center` snap targets at `0, W, 2W, ...`, and no composited `ScrollTimeline` transform animation that interferes with Chromium DevTools elastic-overscroll bounce-back.
     - For the outgoing / top page (`--progress` in `[0, 1]`), its static slot is already at or past `right: 0`, so sticky is inactive and it scrolls natively—sliding out to the left on a forward swipe and sliding back in from the left on a backward swipe.
     - For the immediate incoming / underneath page (`--progress` in `[-1, 0]`), `right: 0` pins it stationary underneath the top page during both forward and backward swipes until its slot aligns with the viewport.
     - `z-index: calc(sibling-count() - sibling-index())` assigns static, non-negative, strictly decreasing z-indices for arbitrary page counts (Chrome 138+) without main-thread scroll recalculation, ensuring smaller page numbers always stack on top of larger ones.
     - `opacity: clamp(0, calc((var(--progress) + 1) * 10000), 1)` hides pages clamped at `--progress = -1` (`i + 2`, `i + 3`, …) so multiple stacked box-shadows never bleed into letterbox margins behind page `i + 1`.
     - Per CSS View Timelines, `view(inline)` tracks the hypothetical static position of `position: sticky` elements, so `--progress` remains exact without perturbing timeline geometry.

3. **JS-Free Mode Switcher & Pure-CSS Debug Readout**
   - _Decision_: Place a native `<fieldset>` in `index.html` containing `<input type="radio" name="mode" value="slide" checked>`, `<input type="radio" name="mode" value="stack">`, and `<input type="checkbox" name="debug">`, wired solely through CSS `:has()` selectors (e.g. `body:has(input[name="mode"][value="stack"]:checked) .page`). Register an `<integer>` helper property `--progress-pct` (`syntax: '<integer>'`, `inherits: true`, `initial-value: 0`) set to `calc(var(--progress) * 100)` on `.page`, and render it via `counter-reset` + `::after { content: counter(...) }` when debug is checked.
   - _Rationale_: Provides accessible, zero-JS mode switching and live numerical readout. Future animation modes (including `curl` in `cone-vertex-shader`) simply add a new `<input type="radio">` and one CSS rule block.

4. **Single Source of Truth with WebGL (`OQ-02` Resolved)**
   - _Decision_: CSS `--progress` is the single source of truth for animation state. `cone-vertex-shader` JS reads `--progress` on active/visible `.page` element(s) via CSSOM (`computedStyleMap().get('--progress')` / `getComputedStyle()`) rather than reading `book.scrollLeft`.
   - _Rationale_: Guarantees CSS transitions and WebGL curl deformation are driven by the exact same declarative scroll-timeline signal, while `css-state-engine` itself remains 100% JS-free.

## Risks / Trade-offs

- **[Risk] CSS `counter()` only accepts integers** → Mitigation: Multiply `--progress` by `100` into a registered `<integer>` custom property (`--progress-pct`) so the debug badge displays `-100` to `100` (representing `-1.00` to `1.00`).
- **[Risk] Mismatch between `book-scroller` `scroll-snap-align` and `view(inline)` midpoint** → Mitigation: Verify empirically with the debug badge that the snapped resting state reads `0`.
- **[Risk] CSSOM per-frame read overhead in `cone-vertex-shader`** → Mitigation: In `cone-vertex-shader`, read `--progress` via CSS Typed OM (`computedStyleMap().get('--progress')`) only for the active/adjacent visible pages rather than scanning the entire book.
- **[Risk] `stack` mode clipping, shadow buildup, or stacking-context leaks** → Mitigation: Set `isolation: isolate` on `.book`, use `position: sticky; right: 0;` on `.page` (so snap targets and `view(inline)` static geometry remain intact without composited transform animations), use `z-index: calc(sibling-count() - sibling-index())` for static non-negative stacking order, and cull `--progress = -1` pages via `opacity`.

## Open Questions

Must be resolved with the human before implementation (recorded in `proposal.md` / `design.md`):

- **`OQ-02` (What does CSS `--progress` drive?)**: **Decided** — CSS `--progress` is the single source of truth for animation state: in `css-state-engine` it drives pure-CSS transition modes (`slide`, `stack`) and the pure-CSS debug readout; in `cone-vertex-shader` JS reads `--progress` via CSSOM (`computedStyleMap()` / `getComputedStyle()`) to feed WebGL shader uniforms instead of reading `book.scrollLeft`.
- **`OQ-12` (Snap alignment `start` vs `center`)**: **Decided — `scroll-snap-align: center`**, matching `book-scroller`'s snap alignment so `--progress = 0` at the center-snapped position.
