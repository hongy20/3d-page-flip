# Spec Delta

## MODIFIED Requirements

### Requirement: Native horizontal flex scroll-snap container with momentum multi-page swipe

`.book` SHALL be styled as `display: flex`, `overflow-x: auto`, `overflow-y: hidden`, `scroll-snap-type: x mandatory`, fill the viewport (`100dvh`), hide its scrollbar, and set both `overscroll-behavior-x: none` and `overscroll-behavior-y: none` (including on `html, body` so browser back/forward history gestures, edge elastic bounce-back, and Android pull-to-refresh or vertical overscroll are suppressed during horizontal turns). Each `.page` SHALL be `flex: 0 0 100%` of the scroller width with `scroll-snap-align: center` and `scroll-snap-stop: normal`, centering its `.page__content` with reasonable surrounding padding so fast, strong swipes can traverse multiple pages via native momentum.

#### Scenario: Normal gesture snaps to the adjacent page

- **WHEN** the user performs a normal swipe, drag, `Shift+wheel`, or keyboard arrow navigation
- **THEN** `.book` scrolls using native momentum and settles center-snapped on the adjacent page without triggering browser back/forward history gestures

#### Scenario: Strong fast swipe advances multiple pages via native momentum

- **WHEN** the user performs a strong, fast horizontal swipe across `.book`
- **THEN** native CSS scroll momentum carries across intermediate pages before settling center-snapped on a further page with zero JS physics

#### Scenario: Downward drag mid-horizontal-turn does not trigger pull-to-refresh or vertical overscroll

- **WHEN** the user drags horizontally on a mobile touch device in horizontal layout and pulls their finger downward during the turn
- **THEN** vertical overscroll and pull-to-refresh remain suppressed so curl tracking continues uninterrupted
