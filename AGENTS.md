# AGENTS.md

Instructions for any AI coding agent working in this repository.

## Project

**WebBook 3D**: a proof-of-concept browser e-book reader. Native CSS scroll provides
all page-navigation physics; a WebGL overlay renders the live HTML pages (via
Chrome's HTML-in-Canvas API) deformed by the cone page-curl model of Hong, Card & Chen.

Start with [`openspec/`](openspec/) (`openspec/changes/` for proposed phases and `openspec/specs/` for synced specs).

## Workflow: spec-driven (OpenSpec)

1. **Specs are the source of truth.** All behaviour is defined in `openspec/` (`openspec/specs/` and `openspec/changes/`). Code that
   isn't traceable to an OpenSpec capability requirement should not exist.
2. **No implementation without an approved spec.** Only implement an OpenSpec change after
   the human has reviewed and approved it.
3. **Change the spec first.** If implementation reveals the spec is wrong or incomplete,
   stop, propose a spec change under `openspec/`, and get it approved before changing code.
4. **Open questions block.** Any open questions (`OQ-*`) noted in the OpenSpec changes
   must not be decided silently by an agent. Ask the human.
5. **One phase at a time.** Phases are sequential (`phase-1-scaffolding` → `phase-2-css-state-engine` → `phase-3-webgl-html-in-canvas` → `phase-4-cone-vertex-shader`). Finish and
   verify a phase's acceptance criteria before starting the next.
6. **Verify, don't assert.** A task is done only when its acceptance criteria are
   demonstrated (command output, test result, or a described manual check in Chrome).

## Non-negotiable constraints

- **No JS physics.** Never use animation libraries (GSAP, Framer Motion, spring libs),
  never add `touchstart`/`touchmove`/`pointermove`/`wheel` listeners for navigation,
  never move DOM elements with JS. Navigation = `scroll-snap-type` only.
- **JS reads `scrollLeft`, nothing else, for animation state.** It converts that value
  into shader uniforms. It never writes scroll position or styles to animate.
- **No DOM-to-image polyfills.** Never use `html2canvas`, `dom-to-image`, or SVG
  `foreignObject` rasterisation. Use `<canvas layoutsubtree>` + `texElementImage2D`.
- **Cone model math is fixed.** The vertex shader implements exactly the formulas
  in `openspec/changes/phase-4-cone-vertex-shader/`. Do not substitute cylinder or other curl models.

## Conventions

- Language: TypeScript (strict). Build tool: Vite.
- Target browser: Chrome 157+ only. Don't add polyfills for other browsers.
- Keep dependencies minimal; every runtime dependency needs a spec justification.
- Follow the repo's existing style; make surgical changes only.
