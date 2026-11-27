# Spec Delta

## ADDED Requirements

### Requirement: Horizontal top-hinge 3D page curl in vertical layout

When `curl` mode is active in vertical portrait layout, the vertex shader and CPU reference port SHALL deform the turning page around a horizontal hinge along the top edge (`y = pageHeight`), rotating upward/downward with shaded blank-paper back faces and horizontal pointer-driven cone/cylinder blending while preserving paper isometry and `p = 0` identity.

#### Scenario: Vertical `curl` lifts and flips pages over the horizontal top hinge

- **WHEN** the user swipes upward or downward in vertical `curl` mode
- **THEN** the turning page curls around its top horizontal hinge with warm blank-paper reverse shading over the stationary page underneath

#### Scenario: Top-hinge curl CPU reference passes flat identity and isometric checks

- **WHEN** the unit test suite evaluates the top-hinge vertical curl reference port across `p` and `conicContribution` in `[-1, 1]`
- **THEN** all vertices are finite, `p = 0` equals the flat plane `P`, and isometric invariants hold within floating-point tolerance
