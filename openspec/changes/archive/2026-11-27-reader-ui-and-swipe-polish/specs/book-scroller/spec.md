# Spec Delta

## ADDED Requirements

### Requirement: Bottom-centered page number badge

`.page__badge` SHALL be positioned horizontally centered along the bottom edge of `.page__content` while preserving hover/focus styling and clickability.

#### Scenario: Page number badge is centered at the bottom of each page

- **WHEN** a page renders
- **THEN** `.page__badge` is horizontally centered at the bottom edge of `.page__content` and remains clickable with hover/focus visual feedback

### Requirement: Native horizontal flex scroll-snap container with momentum multi-page swipe

`.book` SHALL be styled as `display: flex`, `overflow-x: auto`, `overflow-y: hidden`, `scroll-snap-type: x mandatory`, fill the viewport (`100dvh`), hide its scrollbar, and set `overscroll-behavior-x: none` (suppressing both browser back/forward history gestures and edge elastic bounce-back). Each `.page` SHALL be `flex: 0 0 100%` of the scroller width with `scroll-snap-align: center` and `scroll-snap-stop: normal`, centering its `.page__content` with reasonable surrounding padding so fast, strong swipes can traverse multiple pages via native momentum.

#### Scenario: Normal gesture snaps to the adjacent page

- **WHEN** the user performs a normal swipe, drag, `Shift+wheel`, or keyboard arrow navigation
- **THEN** `.book` scrolls using native momentum and settles center-snapped on the adjacent page without triggering browser back/forward history gestures

#### Scenario: Strong fast swipe advances multiple pages via native momentum

- **WHEN** the user performs a strong, fast horizontal swipe across `.book`
- **THEN** native CSS scroll momentum carries across intermediate pages before settling center-snapped on a further page with zero JS physics

## REMOVED Requirements

### Requirement: Native horizontal flex scroll-snap container

**Reason**: Superseded by `Native horizontal flex scroll-snap container with momentum multi-page swipe` to replace `scroll-snap-stop: always` with `scroll-snap-stop: normal`.
**Migration**: Update `.page` in `src/style.css` from `scroll-snap-stop: always` to `scroll-snap-stop: normal`.
