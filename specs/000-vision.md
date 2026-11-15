# 000: Vision & Scope

Status: Draft

## Idea

Browser e-book readers usually pick one of two options. They give you flat, instant page swaps.
Or they fake page curls with JS animation libraries that fight the platform: custom touch
tracking, hand-tuned momentum, and screenshots of the DOM.

**WebBook 3D** shows a third way: let the browser do what it is already good at.

- **Native scrolling** handles input, momentum, and snapping, with OS-correct feel on
  trackpad, touch, mouse wheel, and keyboard.
- **CSS Scroll-Driven Animations** turn scroll position into declarative state.
- **HTML-in-Canvas** puts the live, selectable, accessible DOM directly onto a GPU
  texture, with no rasterisation hacks.
- **A physically motivated cone deformation** (Hong, Card & Chen) curls the page
  without stretching the paper.

## Goals

| ID | Goal |
|----|------|
| VIS-01 | Show a convincing 3D page-curl driven only by native scroll input. |
| VIS-02 | Show that page content stays live HTML, not a static image, while it's being deformed. |
| VIS-03 | Show a clean separation: CSS owns state and physics, JS only bridges scroll position to the GPU, and the GPU owns visuals. |
| VIS-04 | Be smooth: steady 60 fps during page turns on a mid-range laptop in Chrome 157+. |
| VIS-05 | Be extensible: page content is ordinary HTML/SVG authored without knowing about the renderer. |

## Scope (PoC)

- A single-page view (one page visible at a time), turning horizontally.
- A fixed, small book (e.g. 4–8 hard-coded pages of HTML/SVG content).
- Page-curl rendering for the page currently being turned.
- Chrome 157+ desktop and Android Chrome.

## Non-goals (PoC)

- Two-page spreads, book covers, page thickness, or a visible book block.
- Loading real e-book formats (EPUB, PDF), pagination or reflow of long text.
- Cross-browser support or a non-WebGL fallback renderer (see open questions).
- Lighting or shadows beyond what's needed to read the curl (nice-to-have, not required).
- Reading-state persistence, bookmarks, a TOC, or settings UI.
- Production hardening: CI/CD, analytics, i18n.

## Success criteria

1. Swiping or scrolling the book turns pages with native snap behaviour, and the
   rendered page visibly curls in 3D, tracking the finger or trackpad 1:1.
2. Code review finds zero navigation event listeners, zero animation libraries, and zero JS
   DOM movement (`ARCH-01`..`ARCH-03`).
3. Changing a page's HTML (e.g. a CSS hover, a text edit in DevTools) shows up in the
   curled render without a reload.
4. The paper does not stretch: page edge lengths are preserved under deformation (`SHD-07`).
