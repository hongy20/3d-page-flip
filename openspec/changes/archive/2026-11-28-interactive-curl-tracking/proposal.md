# Proposal

## Why

Currently `conicContribution` is sampled only once on `pointerdown` for touch input, and the curl crease moves on a fixed progress curve rather than tracking the user's pointer, making vertical curl adjustments and drag alignment feel disconnected.

## What Changes

- Replace the touch-only `pointerdown` check with passive, read-only Pointer Events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`, with passive touch fallback if Chrome cancels `pointermove` during native scroll) on `.book` that anchor the initial curl corner at `pointerdown` (`startX`, `startY`) and track vertical pointer displacement so the grabbed point on the page follows the user's finger up and down as closely as the cone + cylinder models allow (`conicContribution` in `[-1, 1]` plus deeper `cornerBend` in `[0, 1]` up to the cone's geometric bending limit), with zero JS scroll or DOM movement.
- Lock in **Option 1 (`--progress`-calibrated linear crease)** (`OQ-CURL-1` resolved as simplest while keeping CSS `--progress` as the sole horizontal driver): calibrate `(theta, Ay, rho, kappa)` so the visible bending crease sweeps proportionally across the page width `[pageWidth, 0]` over `|p| in [0, 0.96]`, keeping the turning edge centered near halfway across at `|p| = 0.5`.
- Update `AGENTS.md` constraint wording to permit passive, read-only Pointer Events (`pointerdown`/`pointermove`/`pointerup`/`pointercancel`, plus passive touch fallback during native scroll) for curl shape tracking without driving scroll or DOM physics.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `cone-page-curl`: Grab-anchored Pointer Events vertical tracking (`conicContribution` + `cornerBend`) across mouse, touch, and pen so grabbed page points follow finger movement up to the cone/cylinder geometric limit, plus `--progress`-calibrated linear horizontal bending-edge tracking (Option 1 selected).

## Impact

- **Files affected**: `src/gl/renderer.ts`, `src/gl/coneMath.ts`, `src/gl/coneMath.test.ts`, `src/shaders/cone.vert.glsl`, `AGENTS.md`.
- **Dependencies**: None.
- **Unaffected**: `index.html`, `src/style.css`, CSS `--progress` scroll-driven state, and native `scroll-snap` pagination.
