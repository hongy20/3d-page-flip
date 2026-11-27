# Dropp

A lightweight, functional browser e-book reader built with vanilla TypeScript and zero frameworks, featuring realistic 3D page-curl animation powered by native CSS scroll-snap and Chrome HTML-in-Canvas WebGL2.

## Overview

- **Vanilla TypeScript, no frameworks**: Built directly on standard browser APIs, CSS, and WebGL2 with zero runtime dependencies.
- **Lightweight functional reader**: Browse a static book library, turn pages smoothly across `Slide`, `Stack`, and 3D `Curl` modes, navigate native inline SVG links, and zoom/pan cleanly (see [`openspec/`](openspec/) for planned and active features).
- **Spec-driven & vibe-coded**: All behavior is authored and tracked through [OpenSpec](openspec/) specifications with a minimal CI setup (`oxlint`, `oxfmt`, `vitest`, TypeScript + Vite build, and automated GitHub Pages deployment).

## Browser Requirements

- **Chrome 157+** (ships HTML-in-Canvas enabled by default; no flags required).

## Local Setup

Requires **Node.js 26 LTS** (see [`.nvmrc`](.nvmrc)):

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
├── .github/workflows/
│   ├── ci.yml                # CI checks (lint, format, test, build)
│   └── deploy.yml            # GitHub Pages build & deployment
├── index.html                # Book library shelf landing page
├── reader.html               # E-book reader scroller & drawable WebGL canvas
├── public/books/malaga/      # Static vector book pages (page_1.svg .. page_18.svg)
├── src/
│   ├── books/catalog.ts      # Static book catalog manifest & lookup
│   ├── library.ts            # Library shelf entry point
│   ├── library.css           # Library shelf styling
│   ├── main.ts               # Reader entry point
│   ├── style.css             # Reader layout, scroll-snap, view(inline) timelines, modes
│   ├── svgLoader.ts          # Base-aware inline SVG loader & ID/style scoping
│   ├── gl/                   # WebGL2 renderer, HTML-in-Canvas texture/geometry sync, curl math
│   └── shaders/              # GLSL ES 3.00 curl vertex & fragment shaders
└── openspec/
    ├── specs/                # Synced capability specifications
    └── changes/              # Proposed and archived OpenSpec changes
```

## Specifications

All behavior is specified under [`openspec/`](openspec/):

- [`openspec/specs/`](openspec/specs/) — synced capability specs:
  - [`book-library`](openspec/specs/book-library/spec.md)
  - [`book-scroller`](openspec/specs/book-scroller/spec.md)
  - [`css-scroll-state`](openspec/specs/css-scroll-state/spec.md)
  - [`webgl-html-in-canvas`](openspec/specs/webgl-html-in-canvas/spec.md)
  - [`cone-page-curl`](openspec/specs/cone-page-curl/spec.md)
  - [`project-tooling`](openspec/specs/project-tooling/spec.md)
  - [`public-demo-deployment`](openspec/specs/public-demo-deployment/spec.md)
