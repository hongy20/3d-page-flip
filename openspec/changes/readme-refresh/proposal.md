# Proposal

## Why

Align `README.md` with the multi-page library and reader codebase, approachable GitHub `About` phrasing, and Chrome 157+'s unflagged HTML-in-Canvas release, while removing outdated flag instructions and academic curl-model citations.

## What Changes

- Rewrite `README.md` in an approachable, concise tone matching the GitHub `About` description: vanilla TypeScript with zero frameworks or runtime dependencies, a lightweight functional e-book reader (page turning, zoom in/out, etc.), spec-driven, vibe-coded, with minimal CI setup, and zero references to Hong–Card–Chen.
- Update browser requirements in `README.md` and the unsupported diagnostic banner in `src/gl/featureDetect.ts` to **Chrome 157+** (the minimum version shipping HTML-in-Canvas without flags) and remove all `chrome://flags/#canvas-draw-element` references.
- Update the repository structure and spec links in `README.md` (`index.html` library, `reader.html`, `public/books/malaga/`, `src/library.ts`, `src/library.css`, `src/books/catalog.ts`, `src/svgLoader.ts`, `.github/workflows/deploy.yml`, `book-library`, `public-demo-deployment`).
- Out of scope: modifying shader math, adding runtime dependencies, or changing CI workflow commands.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `project-tooling`: Refresh `README.md` tone, technical summary, Chrome 157+ requirement without flags, repository structure, and spec links.
- `webgl-html-in-canvas`: Update feature-detection banner and requirement copy from Chrome 158+ with experimental flag to Chrome 157+ without flags.

## Impact

- **Files affected**: `README.md`, `src/gl/featureDetect.ts`.
- **Dependencies**: None.
- **Unaffected**: `src/gl/renderer.ts`, `src/shaders/*`, `openspec/specs/` (until archived).
