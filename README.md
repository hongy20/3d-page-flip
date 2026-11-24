# WebBook 3D

Proof of concept: a browser e-book reader that does 3D page curls driven entirely by
native CSS scrolling and rendered live via Chrome's HTML-in-Canvas API.

> **Status:** specification phase. No code yet. Specifications are managed with OpenSpec under [`openspec/`](openspec/).

## OpenSpec Changes (Phases)

1. [`phase-1-scaffolding`](openspec/changes/phase-1-scaffolding/proposal.md) — Project scaffolding & native CSS scroll-snap book container
2. [`phase-2-css-state-engine`](openspec/changes/phase-2-css-state-engine/proposal.md) — CSS `@property --progress` & scroll-driven animation timelines
3. [`phase-3-webgl-html-in-canvas`](openspec/changes/phase-3-webgl-html-in-canvas/proposal.md) — WebGL2 overlay & live HTML-in-Canvas (`<canvas layoutsubtree>` + `texElementImage2D`)
4. [`phase-4-cone-vertex-shader`](openspec/changes/phase-4-cone-vertex-shader/proposal.md) — Cone page-curl vertex shader (Hong, Card & Chen) & `scrollLeft` uniform wiring

AI agents: read [`AGENTS.md`](AGENTS.md) first.
