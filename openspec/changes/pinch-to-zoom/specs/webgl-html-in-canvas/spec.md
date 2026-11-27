# Spec Delta

## ADDED Requirements

### Requirement: Zoomed WebGL view transform and hit-test geometry sync

When zoomed or panned (`scale > 1`), the WebGL2 renderer SHALL apply the zoom and pan transform cleanly around the gesture focal point without texture distortion and update `canvas.updateElementGeometry` so inline SVG links and page badges stay hit-test aligned.

#### Scenario: Zoomed WebGL page renders sharply with aligned interactive hit-testing

- **WHEN** a page is zoomed and panned (`scale > 1`) in `reader.html`
- **THEN** the rendered WebGL page matches the zoomed focal region cleanly and clickable badges or SVG links remain aligned with their visual positions
