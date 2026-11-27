# Proposal: Stack Mode Z-Axis Depth Effect

## Why

Currently, in `stack` transition mode, the underneath page (`i + 1`) remains completely flat and static while the top page (`i`) slides out/in from the left. Adding a subtle z-axis depth effect — rising forward from behind on forward swipes and receding back behind on backward swipes — reinforces the physical stacked-card metaphor purely in CSS without affecting scroll-snap or `--progress`.

## What Changes

- Update `stack` mode's underneath-page transition behavior so that while remaining horizontally centered, the underneath page rises forward along the z-axis from behind (with subtle depth dimming) on forward swipes until settled, and recedes back along the z-axis behind the incoming top page on backward swipes.
- Preserve zero JavaScript, intact `slide` mode, exact `--progress` semantics, symmetric `scroll-snap-align: center` behavior, and compositor-thread execution.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `css-scroll-state`: Update the `stack` mode transition requirement and forward/backward swipe scenarios to specify the z-axis rise/recede depth behavior of the centered underneath page.

## Impact

- **Files affected**: `src/style.css` (`@keyframes stack-pin` and `@keyframes stack-reveal`).
- **Dependencies**: None (native CSS `transform` `perspective()` / `translateZ()` and `opacity` driven by `--page-view`).
- **Unaffected**: `index.html`, `src/main.ts`, `slide` mode, `scroll-snap-type` targets, and `view(inline)` `--progress` values.
