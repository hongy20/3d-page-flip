# AGENTS.md

Instructions for any AI coding agent working in this repository.

## Project

**WebBook 3D**: a proof-of-concept browser e-book reader. Native CSS scroll provides
all page-navigation physics; a WebGL overlay renders the live HTML pages (via
Chrome's HTML-in-Canvas API) deformed by the cone page-curl model of Hong, Card & Chen.

Start with [`specs/README.md`](specs/README.md).

## Workflow: spec-driven

1. **Specs are the source of truth.** All behaviour is defined in `specs/`. Code that
   isn't traceable to a spec requirement ID (e.g. `ARCH-03`, `SHD-05`) should not exist.
2. **No implementation without an approved spec.** Only implement a spec whose
   `Status:` is `Approved`. `Draft` specs are for discussion only.
3. **Change the spec first.** If implementation reveals the spec is wrong or incomplete,
   stop, propose a spec change, and get it approved before changing code.
4. **Open questions block.** Anything listed in `specs/open-questions.md` as `Open`
   must not be decided silently by an agent. Ask the human.
5. **One phase at a time.** Phases are sequential (see `specs/README.md`). Finish and
   verify a phase's acceptance criteria before starting the next.
6. **Verify, don't assert.** A task is done only when its acceptance criteria are
   demonstrated (command output, test result, or a described manual check in Chrome).

## Non-negotiable constraints (summary; the full text is in `specs/001-architecture.md`)

- **No JS physics.** Never use animation libraries (GSAP, Framer Motion, spring libs),
  never add `touchstart`/`touchmove`/`pointermove`/`wheel` listeners for navigation,
  never move DOM elements with JS. Navigation = `scroll-snap-type` only.
- **JS reads `scrollLeft`, nothing else, for animation state.** It converts that value
  into shader uniforms. It never writes scroll position or styles to animate.
- **No DOM-to-image polyfills.** Never use `html2canvas`, `dom-to-image`, or SVG
  `foreignObject` rasterisation. Use `<canvas layoutsubtree>` + `texElementImage2D`.
- **Cone model math is fixed.** The vertex shader implements exactly the formulas
  in `specs/040-cone-vertex-shader.md`. Do not substitute cylinder or other curl models.

## Conventions

- Language: TypeScript (strict). Build tool: Vite.
- Target browser: Chrome 157+ only (see `ARCH-08`). Don't add polyfills for other browsers.
- Keep dependencies minimal; every runtime dependency needs a spec justification.
- Follow the repo's existing style; make surgical changes only.
