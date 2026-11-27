# Spec Delta

## ADDED Requirements

### Requirement: Spread-level scroll-driven `--progress` in landscape mode

On `@media (orientation: landscape)`, each magazine spread snap unit SHALL expose `--progress` in `[-1, 1]` via CSS `view(inline)` using the same sign convention (`-1` one spread-width right, `0` snapped, `+1` one spread-width left) and zero JS, while `@media (orientation: portrait)` retains per-page `--progress`.

#### Scenario: Landscape spreads report exact boundary `--progress` values

- **WHEN** a middle spread is settled at its snapped position in landscape orientation
- **THEN** the snapped spread has `--progress = 0`, its immediate right neighbor spread has `--progress = -1`, and its immediate left neighbor spread has `--progress = 1`

#### Scenario: Orientation changes switch between single-page and spread snapping with zero JS

- **WHEN** the viewport changes between portrait and landscape orientation
- **THEN** CSS media queries switch the snap units and `view(inline)` `--progress` timeline cleanly without JS scroll or style mutations
