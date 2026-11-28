# Spec Delta

## ADDED Requirements

### Requirement: Vertical single-page flex scroll-snap layout in portrait

When vertical page layout is active in portrait/single-page mode, `.book` SHALL lay out pages vertically (`flex-direction: column`, `overflow-y: auto`, `overflow-x: hidden`, `scroll-snap-type: y mandatory`, `overscroll-behavior-y: none`) with each `.page` snapping center-aligned via native vertical scroll physics; in landscape orientation, `.book` SHALL remain horizontal.

#### Scenario: Vertical swipe snaps between pages in portrait mode

- **WHEN** vertical layout is active in portrait orientation and the user swipes up or down
- **THEN** `.book` scrolls vertically with native momentum and settles center-snapped on the target page with zero JS scroll physics

#### Scenario: Landscape orientation enforces horizontal layout

- **WHEN** the viewport is in landscape orientation while vertical layout is selected
- **THEN** `.book` keeps horizontal pagination and ignores vertical single-page stacking
