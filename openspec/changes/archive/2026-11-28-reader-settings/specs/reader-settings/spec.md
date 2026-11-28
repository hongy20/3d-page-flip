# Spec Delta

## Purpose

Provides a dedicated settings page (`settings.html`), browser-persisted reader preferences (`localStorage`), and feature-availability explanations for disabled options across Dropp.

## ADDED Requirements

### Requirement: Dedicated multi-page settings entrypoint and navigation

`settings.html` SHALL be served and built as a Vite multi-page entrypoint alongside `index.html` and `reader.html`, reachable via native links from both the library and reader with a native return link back to the originating page or library.

#### Scenario: Visitor opens settings from the library or reader and navigates back

- **WHEN** a visitor clicks the `Settings` link from `index.html` or `reader.html`
- **THEN** the browser navigates to `settings.html` and provides a native return link back without broken relative paths

### Requirement: Persisted reader preferences with defaults

`settings.html` SHALL let visitors choose transition mode (`slide`, `stack`, `curl`; default `slide`) and portrait layout direction (`horizontal`, `vertical`; default `horizontal`), persisting selections in `localStorage` and falling back safely to defaults when storage is empty, invalid, or unavailable.

#### Scenario: Selected settings persist across browser reloads

- **WHEN** a visitor selects a transition mode and portrait layout direction in `settings.html` and reloads or opens `reader.html`
- **THEN** the reader applies the persisted preferences and defaults cleanly to `slide` and `horizontal` when no stored preference exists

### Requirement: Feature detection and explanations for disabled settings

`settings.html` SHALL evaluate browser and viewport support for each option (HTML-in-Canvas/WebGL2 for `curl`, CSS `view()` scroll-driven animations for `stack`/`curl`, and portrait orientation applicability for `vertical`), disable any unsupported option, and show a clear accessible explanation (`aria-describedby`) of why it is disabled.

#### Scenario: Unsupported browser or viewport disables inapplicable options with explanation

- **WHEN** `settings.html` loads in a browser lacking HTML-in-Canvas/WebGL2 or CSS `view()` timelines, or in a landscape viewport where portrait-only vertical layout does not apply
- **THEN** the affected setting control is disabled and paired with an accessible explanation describing why it is disabled
