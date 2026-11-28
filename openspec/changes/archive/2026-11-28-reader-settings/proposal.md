# Proposal

## Why

Moving transition mode selection out of the cramped floating reader bar into a dedicated settings page unclutters the reading screen, lets visitors choose both transition mode and portrait page layout with browser persistence, and clearly explains why any unsupported option is disabled.

## What Changes

- Add a dedicated `settings.html` page (`src/settings.ts`, `src/settings.css`) registered in `vite.config.ts` alongside `index.html` and `reader.html`, reachable from both the library and reader via native `<a href="./settings.html">` links.
- Replace the `Slide / Stack / Curl` radio group in `reader.html` `.controls` with a `Settings` link/button (keeping `← Library` and `Settings`).
- Persist reader preferences in `localStorage` via a shared `src/settingsStore.ts` module:
  - Transition mode: `slide` (default), `stack`, `curl`.
  - Portrait layout direction: `horizontal` (default), `vertical`.
- Feature-detect capability support on `settings.html` (e.g., HTML-in-Canvas/WebGL2 for `curl`, CSS `view()` timelines for `stack`/`curl`, and landscape orientation where portrait-only `vertical` layout is inactive), disable unsupported options, and display an accessible explanation for why each disabled option is unavailable.
- Out of scope: cloud/account sync, per-book preferences, or modifying curl math.

## Capabilities

### New Capabilities

- `reader-settings`: Dedicated `settings.html` configuration page, `localStorage` preference persistence with defaults, and disabled-option feature explanations.

### Modified Capabilities

- `book-library`: Include `settings.html` in the multi-page Vite production build and link to settings from `index.html`.
- `book-scroller`: Replace `.controls` transition mode radios in `reader.html` with a `Settings` link.
- `css-scroll-state`: Read persisted transition mode (`slide` default, `stack`, `curl`) and layout direction (`horizontal` default, `vertical`) via declarative attributes (`data-mode`, `data-layout`) while keeping pure-CSS transitions and zero JS scroll listeners.

## Impact

- **Files created/affected**: `settings.html`, `src/settings.ts`, `src/settings.css`, `src/settingsStore.ts`, `src/settingsStore.test.ts`, `vite.config.ts`, `index.html`, `reader.html`, `src/main.ts`, `src/style.css`, `src/gl/renderer.ts`.
- **Dependencies**: None.
- **Unaffected**: `src/books/catalog.ts`, `src/shaders/*`, `src/gl/coneMath.ts`.
