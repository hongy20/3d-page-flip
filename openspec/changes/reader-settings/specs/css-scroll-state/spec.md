# Spec Delta

## ADDED Requirements

### Requirement: Persisted transition modes (`slide`, `stack`, and `curl`) configured via settings

The reader SHALL support `slide` (default), `stack`, and `curl` transition modes configured in `settings.html` (`localStorage`) and applied declaratively via `data-mode` on `<body>`, so CSS selectors drive all `slide` and `stack` transitions with zero scroll or mode-switching listeners inside `reader.html`.

#### Scenario: Slide mode is selected by default

- **WHEN** the reader loads initially without a saved mode preference
- **THEN** `data-mode="slide"` is applied by default

#### Scenario: Forward swipe in `stack` mode

- **WHEN** `stack` mode is saved and active and the user swipes forward from page `i` to page `i + 1`
- **THEN** page `i` renders on top of page `i + 1` and slides out to the left while page `i + 1` stays horizontally centered underneath and rises forward along the z-axis from behind until settled

#### Scenario: Backward swipe in `stack` mode

- **WHEN** `stack` mode is saved and active and the user swipes backward from page `i + 1` to page `i`
- **THEN** page `i` renders on top of page `i + 1` and slides in from the left over page `i + 1`, which stays horizontally centered and recedes back along the z-axis behind page `i`

#### Scenario: Persisted mode applies declaratively to reader CSS and renderer

- **WHEN** a visitor selects `slide`, `stack`, or `curl` in `settings.html` and opens `reader.html`
- **THEN** `reader.html` applies the saved `data-mode` attribute on `<body>` so CSS transitions and the WebGL renderer reflect the selected mode immediately

## REMOVED Requirements

### Requirement: Extensible transition modes (`slide`, `stack`, and `curl`) with JS-free switching

**Reason**: Superseded by `Persisted transition modes (slide, stack, and curl) configured via settings` because mode selection moves out of `reader.html` `.controls` radios into the dedicated `settings.html` page.
**Migration**: Move mode selection from `reader.html` `.controls` radios to `settings.html`, link `.controls` to `./settings.html`, and switch `src/style.css` and `src/gl/renderer.ts` from `:has(input[name="mode"]...)` to `body[data-mode="..."]`.
