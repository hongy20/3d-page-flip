# Design: Phase 1, Project Scaffolding

## Context

See `proposal.md` for motivation (`VIS-01`..`VIS-05`). Phase 1 (`specs/010-scaffolding.md`) builds the baseline repository layout defined in `specs/001-architecture.md`: a zero-JS-physics horizontal book scroller in Vite + strict TypeScript where native CSS `scroll-snap-type: x mandatory` handles all user input and pagination.

## Goals / Non-Goals

**Goals:**
- Establish the target repository structure (`index.html`, `src/main.ts`, `src/style.css`, `tsconfig.json`, `package.json`, `.gitignore`).
- Author `N >= 4` sample pages of rich HTML/SVG content that remain decoupled from future `<canvas layoutsubtree>` reparenting in Phase 3 (`OQ-03`).
- Guarantee one-page-per-gesture native snapping across touch, trackpad, wheel, and keyboard without any JS event listeners.

**Non-Goals:**
- CSS `@property --progress` or `view(inline)` scroll timelines (deferred to Phase 2).
- Any WebGL or `<canvas layoutsubtree>` integration (deferred to Phase 3).

## Decisions

1. **Renderer-Agnostic Page Markup (`SCF-03`, `SCF-07`)**
   - *Decision*: Separate the scroll-snap item (`.page`) from the visual page sheet (`.page__content`). Avoid CSS selectors on `.page__content` that rely on `.book > .page` ancestry beyond layout positioning.
   - *Rationale*: Phase 3 (`OQ-03`) may require placing page content inside `<canvas layoutsubtree>`. Keeping `.page__content` self-contained prevents CSS breakage when the DOM hierarchy is adapted for `texElementImage2D`.

2. **Interactive & Vector Sample Content (`VIS-02`, `VIS-05`)**
   - *Decision*: Include at least 4 distinct sample pages containing semantic HTML typography, at least one inline SVG illustration, and interactive CSS states (such as `:hover` highlights).
   - *Rationale*: Provides an immediate testbed for Phase 3's live HTML-in-Canvas `paint` event texture re-uploads without needing to rewrite page content later.

3. **Strict Zero-JS Entrypoint (`SCF-08`, `ARCH-01`..`ARCH-03`)**
   - *Decision*: `src/main.ts` contains only `import './style.css';`.
   - *Rationale*: Proves that 100% of pagination feel, momentum, and accessibility (`ARCH-16`) come from the browser's scrolling engine.

## Risks / Trade-offs

- **[Risk] Trackpad momentum skips multiple pages in one flick** → Mitigation: Set `scroll-snap-stop: always` on `.page` (`SCF-05`) so each gesture settles on the adjacent page.
- **[Risk] Horizontal swipe triggers browser back/forward navigation** → Mitigation: Set `overscroll-behavior-x: contain` on `.book` (`SCF-06`).
- **[Risk] Choice of `scroll-snap-align` affects downstream math** → Mitigation: Whichever alignment (`start` vs `center`, `OQ-12`) is chosen in Phase 1 defines `--progress = 0` in Phase 2 and `scrollLeft` normalization in Phase 4. Pick once and keep consistent across all phases.

## Open Questions

Preserved from `specs/open-questions.md` (must be confirmed with human before or during implementation, per `AGENTS.md`):

- **`OQ-11` (Single page or two-page spread for the PoC?)**: Affects `000` scope. Currently scoped as a single-page view (`flex: 0 0 100%`). Status: **Open**.
- **`OQ-12` (Snap alignment `start` vs `center`?)**: Affects `SCF-05` and `CSS-03`. `start` matches 100%-wide pages naturally. Status: **Open**.
