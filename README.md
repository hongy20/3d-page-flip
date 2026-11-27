# Dropp

A browser e-book reader proof of concept where native CSS scrolling drives all pagination physics and a WebGL2 HTML-in-Canvas overlay renders live HTML/SVG pages deformed by the Hong, Card & Chen cone page-curl model.

## What It Does

- **Zero-JS scroll physics**: Horizontal pagination (`scroll-snap-type: x mandatory`) uses native browser touch, trackpad, wheel, and keyboard scrolling.
- **Declarative CSS scroll state**: Each page exposes a normalized `--progress` custom property in `[-1, 1]` via CSS `view(inline)` scroll-driven timelines, powering pure-CSS `Slide` and `Stack` modes as well as WebGL uniforms.
- **Live HTML-in-Canvas 3D curl**: `<canvas content="drawable">` uploads live DOM page elements via `texElementSubImage2D` onto a `64x64` tessellated plane deformed with the Hong, Card & Chen cone vertex shader (`Curl` mode).

## Browser Requirements

- **Chrome 158+** with `chrome://flags/#canvas-draw-element` enabled.

## Local Setup

Requires **Node.js 24 LTS** (see [`.nvmrc`](.nvmrc)):

```sh
nvm use
npm install
npm run dev
```

Available scripts:

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc`) and build production assets to `dist/`
- `npm test` — run unit tests (`vitest`)
- `npm run lint` — run `oxlint`
- `npm run format` / `npm run format:check` — format or check formatting with `oxfmt`

## Repository Structure

```text
├── .github/workflows/ci.yml  # CI checks (lint, format, test, build)
├── index.html                # Scrollable book container, controls, and drawable canvas
├── public/pages/             # Static vector book pages (page_1.svg .. page_18.svg)
├── src/
│   ├── main.ts               # Entry point
│   ├── style.css             # Layout, scroll-snap, view(inline) timelines, modes
│   ├── gl/                   # WebGL2 renderer, HTML-in-Canvas texture/geometry sync, cone math
│   └── shaders/              # GLSL ES 3.00 cone vertex & fragment shaders
└── openspec/
    ├── specs/                # Synced capability specifications
    └── changes/              # Proposed and archived OpenSpec changes
```

## Specifications

All behavior is specified under [`openspec/`](openspec/):

- [`openspec/specs/`](openspec/specs/) — synced capability specs:
  - [`book-scroller`](openspec/specs/book-scroller/spec.md)
  - [`css-scroll-state`](openspec/specs/css-scroll-state/spec.md)
  - [`webgl-html-in-canvas`](openspec/specs/webgl-html-in-canvas/spec.md)
  - [`cone-page-curl`](openspec/specs/cone-page-curl/spec.md)
  - [`project-tooling`](openspec/specs/project-tooling/spec.md)

AI agents: read [`AGENTS.md`](AGENTS.md) first.
