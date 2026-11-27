# Proposal

## Why

Currently `curl` mode always lifts the bottom-right corner using a single lower-apex cone. Extending `curl` mode with a continuous `conicContribution` blend across an upside-down top-corner cone (`-1`), an isometric cylinder (`0`), and the bottom-corner cone (`+1`)—following Microsoft's Project Austin Part 2 page-curling model (`https://devblogs.microsoft.com/cppblog/project-austin-part-2-of-6-page-curling/`)—makes the 3D turn respond naturally to the exact vertical position where the user grabs the page.

## What Changes

- Update `AGENTS.md` non-negotiable constraints to allow (a) passive, read-only `pointerdown` Y-coordinate observation strictly for computing `conicContribution` in `[-1, 1]` (never driving scroll or physics), and (b) extending the Hong, Card & Chen cone shader with Y-reflected top cone, isometric cylindrical curl, and continuous `conicContribution` blending.
- Add a passive, read-only vertical observer on `.book` that maps swipe start Y to continuous `conicContribution` in `[-1, 1]` (`-1` top-corner Y-reflected cone, `0` middle isometric cylinder, `+1` bottom-corner cone, defaulting to `+1` for keyboard/wheel navigation).
- Extend `src/shaders/cone.vert.glsl`, `src/gl/coneMath.ts`, and `src/gl/coneMath.test.ts` with top-corner Y-reflected cone curl, isometric cylindrical curl, and continuous `conicContribution` blending, preserving flat identity at `p = 0`, zero `NaN`/`Inf`, and isometric unit tests.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `cone-page-curl`: Add continuous directional curl blending (`conicContribution` in `[-1, 1]` across top Y-reflected cone, middle isometric cylinder, and bottom cone) and isometric/identity verification for the new deformation paths.

## Impact

- **Files affected**: `AGENTS.md`, `src/shaders/cone.vert.glsl`, `src/gl/coneMath.ts`, `src/gl/coneMath.test.ts`, `src/gl/renderer.ts`.
- **Dependencies**: None.
- **Open Questions**: `OQ-CURL-1` resolved (**continuous** `conicContribution` in `[-1, 1]`); no blocking open questions remain.
