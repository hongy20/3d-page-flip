# Spec Delta

## MODIFIED Requirements

### Requirement: Upfront HTML-in-Canvas feature detection

Before initializing the renderer, the application SHALL feature-detect `content="drawable"` (`'content' in HTMLCanvasElement.prototype` and `canvas.content === 'drawable'`), `texElementSubImage2D`, `getElementImageDefaultSize`, and `updateElementGeometry` in Chrome 157+, and SHALL display a clear in-page diagnostic message stating Chrome 157+ without experimental flag instructions and without throwing unhandled errors if any required feature is unavailable. No fallback renderer SHALL be included.

#### Scenario: Unsupported browser displays diagnostic banner cleanly

- **WHEN** the page loads in a browser or Chrome version without `content="drawable"`, `texElementSubImage2D`, `getElementImageDefaultSize`, or `updateElementGeometry`
- **THEN** an in-page Chrome 157+ requirement message (with no flag instructions) is shown and the console contains zero uncaught exceptions
