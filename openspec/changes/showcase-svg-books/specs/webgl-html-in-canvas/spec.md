# Spec Delta

## ADDED Requirements

### Requirement: Live animated media updates inside HTML-in-Canvas page textures

When an active visible page contains animated embedded media (such as an APNG inside inline `<svg>`), the WebGL2 HTML-in-Canvas renderer SHALL reflect animation frames smoothly in the displayed page texture (including during 3D curl) while remaining idle with zero unnecessary paints on static pages.

#### Scenario: Embedded APNG animates on the active page without waking static pages

- **WHEN** a visitor views or curls a showcase page containing an embedded APNG in Chrome 157+
- **THEN** the APNG animation plays smoothly in the WebGL texture while static pages continue incurring zero idle paint uploads
