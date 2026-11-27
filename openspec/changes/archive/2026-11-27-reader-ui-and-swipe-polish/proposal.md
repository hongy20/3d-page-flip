# Proposal

## Why

Center the page number indicator along the bottom edge for cleaner visual balance and allow strong, fast swipes to flip across multiple pages using native CSS scroll momentum.

## What Changes

- Move `.page__badge` from the bottom-right corner to horizontally centered along the bottom edge of `.page__content` in `src/style.css`.
- Change `.page` in `src/style.css` from `scroll-snap-stop: always` to `scroll-snap-stop: normal` so normal swipes snap to the adjacent page while fast, strong swipes glide past intermediate pages via native momentum.
- Out of scope: JS gesture or momentum handling, changing `--progress` sign convention, or changing double-page spread layout.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `book-scroller`: Add bottom-centered page badge positioning and replace `scroll-snap-stop: always` with `scroll-snap-stop: normal` to allow momentum multi-page swiping.

## Impact

- **Files affected**: `src/style.css`.
- **Dependencies**: None.
- **Unaffected**: `index.html`, `src/`, `--progress` scroll-driven state, and WebGL shader math.
