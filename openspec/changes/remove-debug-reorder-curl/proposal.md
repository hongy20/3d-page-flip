# Proposal

## Why

Remove the initial `Debug` `--progress` overlay toggle from `.controls` to simplify the reader toolbar, and order transition modes progressively from flat CSS (`Slide`, `Stack`) to 3D WebGL (`Curl`) with `Slide` as the initial default.

## What Changes

- Remove the `Debug` checkbox and toolbar divider from `index.html`, plus the debug readout CSS (`@property --progress-pct`, `.controls__divider`, `.controls__option--toggle:has(:checked)`, and `body:has(input[name='debug']:checked)` rules) from `src/style.css`.
- Reorder the transition mode radio options in `index.html` to `Slide`, `Stack`, `Curl` (`Curl` last) with `Slide` checked by default on initial load.
- Update `readActiveMode()` fallback in `src/gl/renderer.ts` from `'curl'` to `'slide'` so fallback behavior matches the new default.
- Out of scope: changing `--progress` scroll-driven animation semantics, changing `slide`/`stack`/`curl` visual transitions or cone shader math, or adding JS control listeners.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `css-scroll-state`: Remove the pure-CSS debug readout requirement; update the transition modes requirement to specify `Slide`, `Stack`, `Curl` order with `slide` checked by default; remove debug references from the zero-JS requirement.

## Impact

- **Files affected**: `index.html`, `src/style.css`, `src/gl/renderer.ts`.
- **Dependencies**: None.
- **Unaffected**: `src/gl/coneMath.ts`, shaders, `scroll-snap-type` physics, and `--progress` timeline behavior.
