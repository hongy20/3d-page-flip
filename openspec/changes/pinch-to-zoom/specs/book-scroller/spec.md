# Spec Delta

## ADDED Requirements

### Requirement: Reader pinch-to-zoom with scroll lock and snap-to-1 reset

`reader.html` SHALL support zooming via 2-finger pinch (Pointer Events), `Ctrl+wheel`, and double-tap/double-click up to a maximum zoom (`4x`), disabling page turning while `scale > 1`, snapping back to `scale = 1` when released near `1` (`<= 1.08`) to re-enable native CSS scroll-snap turning, and disabling native browser zoom on `reader.html`.

#### Scenario: Zooming in disables page turning and enforces max zoom

- **WHEN** the user pinches out, `Ctrl+wheel` zooms in, or double-taps on `reader.html`
- **THEN** the page zooms up to at most `4x`, native browser zoom is suppressed, and page turning is locked while `scale > 1`

#### Scenario: Zooming out near 1 snaps back to 1 and re-enables page turning

- **WHEN** the user zooms out to `<= 1.08` and releases (or double-taps while zoomed in)
- **THEN** zoom snaps cleanly to `scale = 1` with zero pan offset and native CSS `scroll-snap` page turning is re-enabled

### Requirement: Bounded panning while zoomed in

While `scale > 1`, dragging with a single pointer or pan gesture SHALL pan across the zoomed page(s) with pan offsets clamped to meaningful bounds around visible page content so the user cannot pan excessively outside the page area.

#### Scenario: Panning is bounded to visible page edges

- **WHEN** the user drags to pan while zoomed in (`scale > 1`)
- **THEN** the view pans smoothly with the drag and clamps before leaving the visible page bounds

## MODIFIED Requirements

### Requirement: Zero-JS navigation physics and no DOM movement

All page-turn dragging, touch tracking, momentum, and snapping at `scale === 1` SHALL come exclusively from native CSS scrolling. The codebase SHALL NOT use JS animation libraries or mutate DOM element positions or scroll offsets (`style.transform`, `left`, `scrollLeft`, `scrollTo()`), and SHALL NOT register pointer, touch, or wheel listeners for page-turn navigation; scoped listeners MAY handle zoom and bounded pan when zooming or zoomed in.

#### Scenario: Static inspection confirms zero navigation listeners or DOM movement

- **WHEN** `src/` is searched for page-turn navigation handlers or DOM position/scroll mutations (`style.transform`, `scrollLeft`, `scrollTo`)
- **THEN** zero page-turn navigation mutations are found and page turning at `scale = 1` uses native CSS `scroll-snap` only
