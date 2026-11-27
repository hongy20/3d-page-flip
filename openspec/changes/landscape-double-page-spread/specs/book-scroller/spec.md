# Spec Delta

## ADDED Requirements

### Requirement: Landscape physical magazine double-page spread layout

On `@media (orientation: landscape)`, `.book` SHALL lay out pages as a physical magazine: the first spread displays Page 1 on the right half only; middle spreads display paired `(2, 3)` through `(16, 17)` side-by-side sharing a central spine; the last spread displays Page 18 on the left half only. In landscape `stack` mode, each two-page `.spread` SHALL transition as one unit via pure CSS. On `@media (orientation: portrait)`, single-page layout (`1..18`) SHALL remain unchanged.

#### Scenario: Initial landscape spread shows Page 1 on the right half

- **WHEN** the reader is viewed in landscape orientation at the initial scroll position
- **THEN** only Page 1 is visible, positioned on the right half of the central spine with the left half empty

#### Scenario: Interior landscape spreads show paired even-left and odd-right pages

- **WHEN** the reader is scrolled to any interior spread in landscape orientation
- **THEN** the even page renders on the left half and the next odd page renders on the right half, meeting cleanly at the central spine

#### Scenario: Final landscape spread shows Page 18 on the left half

- **WHEN** the reader is scrolled to the end in landscape orientation
- **THEN** only Page 18 is visible, positioned on the left half of the central spine with the right half empty

#### Scenario: Landscape stack mode transitions the full two-page spread as one unit

- **WHEN** `stack` mode is active in landscape orientation and the user swipes between spreads
- **THEN** each two-page `.spread` slides and rises from underneath as a single unit via pure CSS without JS scroll mutations

#### Scenario: Portrait orientation preserves single-page 1..18 layout

- **WHEN** the viewport is in portrait orientation
- **THEN** `.book` snaps across all 18 single pages (`1..18`) identically to the single-page layout
