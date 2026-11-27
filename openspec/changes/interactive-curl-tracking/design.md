# Design

## Context

See [proposal.md](proposal.md). In `src/gl/renderer.ts`, `onPointerDown` currently ignores `pointerType === "mouse"` and captures `conicContribution` only once at gesture start, while `coneParams(p)` and `cylKappa(p)` advance on a nonlinear curve relative to pointer movement.

## Goals / Non-Goals

**Goals:**

- Update `conicContribution` continuously during active pointer drag across mouse, touch, and pen via passive Pointer Events.
- Allow live comparison of two bending-edge tracking options in Chrome (`OQ-CURL-1`) before finalizing one.
- Preserve native CSS `scroll-snap` pagination and isometric paper dimensions.

**Non-Goals:**

- Driving scroll offsets or snap momentum in JavaScript.
- Altering `slide` or `stack` transition modes.

## Decisions

1. **Unified passive Pointer Events (`pointerdown` / `pointermove` / `pointerup` / `pointercancel`)**:
   - Track `activePointerId` on `.book` with `{ passive: true }` listeners across mouse, touch, and pen.
   - Note: on touchscreens, Chrome may fire `pointercancel` once native horizontal scroll takes over the touch gesture; verify touchscreen behavior in Chrome and fall back to passive `touchmove` tracking only if Chrome cancels `pointermove` during native scroll.
2. **Two evaluable bending-edge strategies (`OQ-CURL-1`)**:
   - **Option 1 (`--progress`-calibrated linear crease)**: Keep `--progress` as the sole horizontal driver and tune `(theta, Ay, rho, kappa)` so the visible crease/fold line sweeps across `[pageWidth, 0]` linearly with scroll progress `p`.
   - **Option 2 (Pointer-X-tracked crease)**: Sample pointer `clientX` relative to the active page rect during drag to align the fold position directly with the pointer/finger, easing smoothly back to `--progress` on `pointerup`/`pointercancel` while native `scroll-snap` settles.
   - Provide a temporary dev-only toggle or query parameter (e.g. `?crease=progress|pointer`) during implementation review, then remove the unselected code path before archiving.

## Risks / Trade-offs

- **Chrome `pointercancel` on touch pan** → Verify in Chrome DevTools / touch device; supplement with passive `touchmove` if `pointercancel` interrupts vertical tracking mid-swipe.
- **Discontinuity on pointer release in Option 2** → Smoothly decay any pointer-X delta toward zero over release/settle frames so the page never snaps abruptly.

## Open Questions

- `OQ-CURL-1`: Evaluate Option 1 (`--progress`-linear crease) vs Option 2 (pointer-X-tracked crease) interactively in Chrome and lock in the preferred behavior before finalizing `tasks.md` 2.1.
