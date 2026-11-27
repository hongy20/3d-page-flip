# Spec Delta

## ADDED Requirements

### Requirement: Block-axis `view(block)` timeline and vertical stack transition

When vertical page layout is active in portrait mode, each `.page` SHALL drive `--progress` over `[-1, 1]` via `view(block)` (`--page-view block`) with `-1` below, `0` centered, and `+1` above, and `stack` mode SHALL transition pages vertically along Y and Z purely in CSS.

#### Scenario: Vertical scroll updates `--progress` linearly via `view(block)`

- **WHEN** the user scrolls vertically in portrait vertical layout
- **THEN** the centered page has `--progress = 0`, the page below starts at `--progress = -1`, and the page above progresses toward `--progress = +1`

#### Scenario: Vertical `stack` mode slides pages upward with depth reveal

- **WHEN** `stack` mode is active in vertical portrait layout and the user swipes up to the next page
- **THEN** the outgoing page slides upward off the top while the next page rises forward along Z underneath purely via CSS animations
