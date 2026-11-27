# Spec Delta

## ADDED Requirements

### Requirement: Double-sided paired textures in landscape spread curl mode

When `curl` mode is active in `@media (orientation: landscape)`, the turning leaf SHALL curl across the central spine (`x = 0`) with the outgoing right page texture on its front face and the paired incoming left page texture (horizontally mirrored in UV space so text reads left-to-right once landed) on its back face (`!gl_FrontFacing`), while the stationary left and revealed right pages render flat underneath. Portrait single-page `curl` mode SHALL continue to render warm blank paper on the back face.

#### Scenario: Flipping forward from Page 1 shows Page 2 on the curled back face and Page 3 revealed on the right

- **WHEN** the user flips forward from Page 1 in landscape `curl` mode
- **THEN** the turning leaf shows Page 1 on its front face, Page 2 (readable when landed on the left) on its curled back face, and Page 3 stationary on the right half underneath

#### Scenario: Flipping forward from an interior spread shows the next even page on the curled back face

- **WHEN** the user flips forward from spread `(2k, 2k+1)` to `(2k+2, 2k+3)` in landscape `curl` mode
- **THEN** page `2k` stays flat on the left, page `2k+3` renders flat on the right underneath, and the turning leaf displays page `2k+1` on the front and page `2k+2` on the curled back face

#### Scenario: Flipping backward curls the left page back across the spine with its paired odd page on the reverse face

- **WHEN** the user flips backward from spread `(2k+2, 2k+3)` to `(2k, 2k+1)` in landscape `curl` mode
- **THEN** the turning leaf rotates back from left to right with page `2k+1` on the front and page `2k+2` on the back face

#### Scenario: Portrait single-page curl retains warm blank-paper back face

- **WHEN** the user turns a page in portrait `curl` mode
- **THEN** the reverse side of the curled page renders the warm blank-paper tone without a paired back-page texture
