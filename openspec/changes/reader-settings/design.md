# Design

## Context

See [proposal.md](proposal.md). Currently transition modes (`Slide`, `Stack`, `Curl`) live as a radio group inside `reader.html` `.controls` with no persistence across reloads and no portrait layout setting.

## Goals / Non-Goals

**Goals:**

- Dedicated `settings.html` entrypoint matching the multi-page Vite architecture (`index.html`, `reader.html`, `settings.html`).
- Safe, typed `localStorage` persistence (`slide` + `horizontal` defaults).
- Clear disabled-state explanations when browser features (HTML-in-Canvas, WebGL2, CSS `view()`) or viewport orientation (landscape) make an option unsupported or inactive.

**Non-Goals:**

- Implementing vertical page layout physics itself (`vertical-page-layout` owns the CSS/GL vertical mode; `reader-settings` stores and applies `data-layout` cleanly).
- Cloud sync or per-book settings.

## Decisions

1. **Shared `src/settingsStore.ts`**:
   - Export `ReaderSettings` (`{ mode: "slide" | "stack" | "curl"; portraitLayout: "horizontal" | "vertical" }`), `DEFAULT_SETTINGS = { mode: "slide", portraitLayout: "horizontal" }`, `readSettings()`, and `writeSettings(partial)`.
   - Guard all `localStorage` access in `try/catch` and validate stored strings against allowed enum values so corrupted storage or private-browsing restrictions fall back cleanly to defaults.
2. **Return link navigation (`?return=...`)**:
   - `reader.html` links to `./settings.html?return=<encoded-relative-path>` (e.g., `./reader.html?book=malaga`) and `index.html` links to `./settings.html`. `settings.html` validates `return` to accept only relative `./...` paths (rejecting external URLs), falling back to `./`.
3. **Feature capability checks & explanations on `settings.html`**:
   - Probe HTML-in-Canvas + WebGL2 (reusing `detectHtmlInCanvas` on an offscreen/probe canvas or feature-check helper) → if unsupported, disable `curl` and explain that Chrome 157+ HTML-in-Canvas / WebGL2 is required.
   - Probe `CSS.supports("animation-timeline", "view()")` → if unsupported, disable `stack` and `curl` and explain that CSS Scroll-Driven Animations (`view()`) are required.
   - Check `(orientation: portrait)` via `matchMedia` (updating on resize/orientation change) → when in landscape, disable (or mark inactive) `vertical` with a clear explanation that vertical layout applies only in portrait single-page mode (landscape uses double-page horizontal spread).
   - If the currently persisted `mode` is unsupported in the current browser, keep the stored value or safely fall back to `"slide"` at runtime in `reader.html` so the reader never crashes.
4. **Declarative `data-mode` and `data-layout` attributes on `<body>`**:
   - Replace `body:has(input[name="mode"]...)` selectors in `src/style.css` and `readActiveMode()` in `src/gl/renderer.ts` with `body[data-mode="..."]` and `body[data-layout="..."]`, applied on `reader.html` load by `src/main.ts` (before renderer init).

## Risks / Trade-offs

- **Saved `curl` opened in an unsupported browser** → `reader.html` still runs `detectHtmlInCanvas`; if HTML-in-Canvas is missing, `showUnsupportedMessage` behaves consistently, while `settings.html` prevents selecting unsupported options beforehand.
- **Unscoped SVG `a` styles bleeding into `.controls__settings`** → Reuse the same scoped link styling pattern as `.controls__back`.
