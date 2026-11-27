# Proposal

## Why

Currently `curl` mode always lifts the bottom-right corner using a single lower-apex cone. Extending `curl` mode with a cylindrical curl for middle swipes and an upside-down top-corner cone curl for top swipes makes the 3D turn respond naturally to where the user grabs the page.

## What Changes

- Update `AGENTS.md` non-negotiable constraints to allow (a) passive, read-only `pointerdown` Y-coordinate observation strictly for selecting the curl zone (`top`, `middle`, or `bottom`, never driving scroll or physics), and (b) extending the Hong, Card & Chen cone shader with Y-reflected top curl and isometric cylindrical middle curl.
- Add a passive, read-only vertical zone observer on `.book` that classifies swipe start Y into `top`, `middle`, or `bottom` (defaulting to `bottom` for keyboard/wheel navigation).
- Extend `src/shaders/cone.vert.glsl`, `src/gl/coneMath.ts`, and `src/gl/coneMath.test.ts` with top-corner Y-reflected cone curl and isometric cylindrical curl, preserving flat identity at `p = 0`, zero `NaN`/`Inf`, and isometric unit tests.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `cone-page-curl`: Add swipe-zone directional curl (`top` Y-reflected cone, `middle` isometric cylinder, `bottom` cone) and isometric/identity verification for the new deformation paths.

## Impact

- **Files affected**: `AGENTS.md`, `src/shaders/cone.vert.glsl`, `src/gl/coneMath.ts`, `src/gl/coneMath.test.ts`, `src/gl/renderer.ts`.
- **Dependencies**: None.
- **Open Questions**: `OQ-CURL-1` (discrete 3-zone switching vs continuous vertical blending between top-cone, cylinder, and bottom-cone).
