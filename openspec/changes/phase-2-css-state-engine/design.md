# Design: Phase 2, CSS State Engine

## Context

See `proposal.md` for motivation. Building on `book-scroller`'s `.book` and `.page` flex scroll-snap layout, Phase 2 binds each `.page` to a `view(inline)` scroll-driven animation timeline that drives a registered `@property --progress` from `-1` to `1`.

## Goals / Non-Goals

**Goals:**
- Provide an exact, linear `-1 -> 0 -> 1` progress signal per page purely in CSS.
- Render a zero-JS on-screen debug readout so the mapping and sign convention can be verified visually.
- Establish the canonical sign convention shared between `css-scroll-state` and Phase 4's `scrollLeft` uniform derivation (`cone-page-curl`).

**Non-Goals:**
- Driving WebGL uniforms from CSS `--progress` via `getComputedStyle` (`phase-4-cone-vertex-shader` mandates JS reads `scrollLeft` directly).
- WebGL context creation or HTML-in-Canvas texture upload (Phase 3).

## Decisions

1. **`view(inline)` Timeline and Range Mapping**
   - *Decision*: Attach `animation-timeline: view(inline)`, `animation-timing-function: linear`, and `animation-fill-mode: both` to `.page`.
   - *Rationale*: A `view(inline)` timeline spans the interval during which a `.page` intersects the horizontal scrollport. Because each `.page` is `100%` of the scroller width (`book-scroller`), the full `cover` (`entry 0%` to `exit 100%`) range naturally spans `-1` page-width (entering from right) through `0` (snapped) to `+1` page-width (exiting to left). This will be verified empirically in Chrome DevTools Animations panel and refined with explicit `animation-range` if needed.

2. **Pure-CSS Debug Readout**
   - *Decision*: Derive a registered `<integer>` custom property (e.g., `--progress-int: calc(var(--progress) * 100)`) rendered via `counter-reset` + `::after { content: counter(...) }` when a `.book--debug` class is present on `.book`.
   - *Rationale*: Displays live numerical progress on screen with zero JavaScript execution or event listeners.

3. **Architectural Alignment with Phase 4**
   - *Decision*: Keep `--progress` strictly in CSS for DOM-side state, while Phase 4 derives the identical signed progress `p` in `[-1, 1]` from `scrollLeft / pageWidth`.
   - *Rationale*: Both values derive linearly from the same horizontal scroll offset, so they agree by construction without paying a per-frame `getComputedStyle` layout/style-recalc tax in JS.

## Risks / Trade-offs

- **[Risk] CSS `counter()` only accepts integers** → Mitigation: Multiply `--progress` by `100` into a registered `<integer>` custom property (`--progress-pct`) so the debug badge displays `-100` to `100` (representing `-1.00` to `1.00`).
- **[Risk] Mismatch between `book-scroller` `scroll-snap-align` and `view(inline)` midpoint** → Mitigation: Verify empirically with the debug badge that the snapped resting state reads `0`.

## Open Questions

Must be resolved with the human before implementation (recorded in `proposal.md` / `design.md`):

- **`OQ-02` (What does CSS `--progress` drive?)**: Because the shader uses `scrollLeft`, `--progress` does not feed the GPU directly. Options:
  - `(a)` Hide/fade the flat DOM page during a turn;
  - `(b)` DOM-side shadow/vignette effects;
  - `(c)` Debug readout only;
  - `(d)` JS reads `--progress` via `getComputedStyle` instead of `scrollLeft` (note: contradicts `AGENTS.md`).
  - Status: **Open**.
- **`OQ-12` (Snap alignment `start` vs `center`)**: **Decided — `scroll-snap-align: center`**, matching `book-scroller`'s snap alignment so `--progress = 0` at the center-snapped position.
