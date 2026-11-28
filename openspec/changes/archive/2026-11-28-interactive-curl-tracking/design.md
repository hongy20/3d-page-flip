# Design

## Context

See [proposal.md](proposal.md). In `src/gl/renderer.ts`, `onPointerDown` currently ignores `pointerType === "mouse"` and captures `conicContribution` only once at gesture start, while `coneParams(p)` and `cylKappa(p)` advance on a nonlinear curve relative to pointer movement.

## Goals / Non-Goals

**Goals:**

- Anchor the curl corner at `pointerdown` and track vertical drag displacement continuously across mouse, touch, and pen via passive Pointer Events so the grabbed page point follows the pointer up and down up to the cone/cylinder geometric bending limit (`conicContribution` + `cornerBend`).
- Calibrate `coneParams(p)` and `cylKappa(p)` so the visible bending crease sweeps linearly across `[pageWidth, 0]` with CSS `--progress` (`OQ-CURL-1` resolved: Option 1 selected).
- Preserve native CSS `scroll-snap` pagination and isometric paper dimensions.

**Non-Goals:**

- Driving scroll offsets or snap momentum in JavaScript.
- Altering `slide` or `stack` transition modes.

## Decisions

1. **Grab-anchored passive Pointer Events (`pointerdown` / `pointermove` / `pointerup` / `pointercancel`) + inverse vertical point tracking**:
   - Track `activePointerId` on `.book`/`window` with `{ passive: true }` listeners across mouse, touch, and pen.
   - Note: on touchscreens, Chrome may fire `pointercancel` once native horizontal scroll takes over the touch gesture; supplement with passive `touchstart`/`touchmove`/`touchend`/`touchcancel` fallback when `pointercancel` interrupts a touch gesture so vertical tracking continues cleanly until release.
   - On `pointerdown`, capture page-local grab coordinates `(grabX, grabY)` (`grabY = 0` bottom, `1` top) and initial anchor `vStart = 1 - 2 * grabY` in `[-1, 1]` (`+1` bottom corner, `0` center cylinder, `-1` top corner).
   - During drag, compute upward vertical displacement `deltaYUp = (startClientY - currentClientY) / pageHeight`, apply smooth asymptotic paper resistance (`effDeltaY = sign(deltaYUp) * span * tanh(|deltaYUp| / 0.55)` against the cone's directional span from `yBase`), and solve a 1D signed control parameter `v` in `[-2, +2]` via bisection so the deformed grabbed point `V_y(grabX, grabY; v)` tracks `yBase + effDeltaY` monotonically up to the cone's geometric bending limit (`v = ±2`):
     - `conicContribution = clamp(v, -1, 1)`
     - `cornerBend = clamp(|v| - 1, 0, 1)`
   - `cornerBend` modulates `(Ay, theta)` in `coneParams(p, pageWidth, cornerBend)` by pulling `Ay` closer to `0` (`<= -0.015`) and deepening `theta` while enforcing `theta > THETA_MIN`, `beta <= 0.96 * pi`, exact Hong, Card & Chen isometry, and fading smoothly to `0` at `p = 0` and `p -> 1`.
2. **Selected bending-edge strategy (`OQ-CURL-1` resolved → Option 1)**:
   - **Option 1 (`--progress`-calibrated linear crease)**: Keep `--progress` as the sole horizontal driver and calibrate `(theta, Ay, rho, kappa)` so the visible crease/fold line sweeps across `[pageWidth, 0]` proportionally over `|p| in [0, 0.96]`, keeping the visible turning edge near mid-page at `|p| = 0.5`.
   - Selected over Option 2 (pointer-X-tracked crease) after Chrome comparison as simpler with zero release-easing state while keeping CSS `--progress` as the single horizontal animation source of truth.

## Risks / Trade-offs

- **Chrome `pointercancel` on touch pan** → Supplemented with passive `touchstart`/`touchmove`/`touchend`/`touchcancel` fallback so vertical tracking continues cleanly if Chrome cancels `pointermove` during native scroll.

## Open Questions

None (`OQ-CURL-1` resolved: Option 1 selected as simplest while preserving pure CSS `--progress` horizontal driving).
