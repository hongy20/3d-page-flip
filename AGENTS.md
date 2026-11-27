# AGENTS.md

Instructions for any AI coding agent working in this repository.

## Project

**WebBook 3D**: a proof-of-concept browser e-book reader. Native CSS scroll provides
all page-navigation physics; a WebGL overlay renders the live HTML pages (via
Chrome's HTML-in-Canvas API) deformed by the cone page-curl model of Hong, Card & Chen.

Start with [`openspec/`](openspec/) (`openspec/changes/` for proposed changes and `openspec/specs/` for synced specs).

## Workflow: spec-driven (OpenSpec)

1. **Specs are the source of truth.** All behaviour is defined in `openspec/` (`openspec/specs/` and `openspec/changes/`). Code that
   isn't traceable to an OpenSpec capability requirement should not exist.
2. **Pure bug fixes vs. behaviour changes.**
   - **Pure bug fixes** that restore already-specified behaviour in `openspec/specs/` may fix code directly without a spec change.
   - **Any behaviour or requirement change** must follow the full OpenSpec lifecycle below (`propose` → review/approval → `apply` → `sync`/`archive`):
     1. **Propose (`openspec propose` / `openspec new change "<name>"`)**: Create `proposal.md`, delta specs under `openspec/changes/<name>/specs/<capability>/spec.md`, `design.md` (when technical tradeoffs or architecture matter), and `tasks.md`. Planning only — **zero code edits** and **never edit `openspec/specs/` directly**.
     2. **Review & approval**: Stop after creating the change artifacts and wait for the human to review and approve before editing project code.
     3. **Apply (`openspec apply`)**: Implement `tasks.md` and verify all acceptance criteria.
     4. **Sync & archive (`openspec archive`, or `openspec sync` to merge early)**: Merge delta specs into `openspec/specs/`, validate with `openspec validate --specs`, and move the change into `openspec/changes/archive/YYYY-MM-DD-<name>/`.
3. **Change the spec first.** If implementation reveals the spec is wrong or incomplete,
   stop, propose a spec change under `openspec/changes/`, and get it approved before changing code.
4. **Open questions block.** Any open questions (`OQ-*`) noted in the OpenSpec changes
   must not be decided silently by an agent. Ask the human.
5. **One change at a time.** Finish and verify a change's acceptance criteria before starting the next.
6. **Verify, don't assert.** A task is done only when its acceptance criteria are
   demonstrated (command output, test result, or a described manual check in Chrome).

## Non-negotiable constraints

- **No JS physics.** Never use animation libraries (GSAP, Framer Motion, spring libs),
  never add `touchstart`/`touchmove`/`pointermove`/`wheel` listeners for navigation,
  never move DOM elements with JS. Navigation = `scroll-snap-type` only.
- **JS reads CSS `--progress`, nothing else, for animation state.** CSS Scroll-Driven Animations (`view(inline)`) are the single source of truth for per-page `--progress`. JS reads `--progress` (e.g. via `computedStyleMap()` / `getComputedStyle()`) solely to convert it into shader uniforms. It never writes scroll position or styles to animate.
- **No DOM-to-image polyfills.** Never use `html2canvas`, `dom-to-image`, or SVG
  `foreignObject` rasterisation. Use `<canvas content="drawable">` + `texElementSubImage2D`.
- **Cone model math is fixed.** The vertex shader implements exactly the formulas
  in `openspec/specs/cone-page-curl/spec.md`. Do not substitute cylinder or other curl models.

## Conventions

- Language: TypeScript (strict). Build tool: Vite.
- Target browser: Chrome 157+ only. Don't add polyfills for other browsers.
- Keep dependencies minimal; every runtime dependency needs a spec justification.
- Follow the repo's existing style; make surgical changes only.
