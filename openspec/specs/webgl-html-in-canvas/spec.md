# webgl-html-in-canvas Specification

## Purpose

Renders live HTML page content as GPU textures on a densely tessellated, pixel-aligned plane inside a `<canvas content="drawable">` raw WebGL2 overlay using Chrome 158+'s HTML-in-Canvas API (`texElementSubImage2D`, `getElementImageDefaultSize`, `updateElementGeometry`, and `CanvasPaintEvent`) while preserving native CSS scrolling.

## Requirements

### Requirement: Viewport-fixed `<canvas content="drawable">` with WebGL2 context and DPR sizing

A `<canvas content="drawable">` element SHALL be fixed over the viewport with a raw WebGL2 rendering context. Its backing store SHALL be sized to `devicePixelRatio` (capped at `2`) and updated via `ResizeObserver`.

#### Scenario: Canvas resizes cleanly with viewport and devicePixelRatio

- **WHEN** the browser viewport is resized
- **THEN** `ResizeObserver` updates the canvas backing store dimensions scaled by capped `devicePixelRatio`, updates the WebGL viewport without visual distortion, and refreshes element geometry transforms

### Requirement: Single-DOM native scroll pass-through and hit-test geometry sync

The `<main class="book" drawable>` scroller and its pages SHALL live inside `<canvas content="drawable">`, with `drawable` on `.book` and each `<article class="page__content" drawable>`. The application SHALL synchronize `.book` and active `.page__content` hit-test geometry via `canvas.updateElementGeometry(el, { canvasTransform })` in canvas CSS pixel units so user input (trackpad, touch, wheel, keyboard, `:hover`, and button clicks) reaches `.book` and `.page__content` and produces the exact snap pagination and `--progress` behavior established in `book-scroller` and `css-scroll-state`.

#### Scenario: Native scroll, snap, and button interaction behave identically with WebGL overlay active

- **WHEN** the user scrolls, swipes, hovers, or clicks interactive controls over the viewport with the WebGL canvas active
- **THEN** `.book` scrolls and snaps one page per gesture identically to `book-scroller`, `view(inline)` updates `--progress`, and `.page__badge` receives `:hover` and click events

### Requirement: Upfront HTML-in-Canvas feature detection

Before initializing the renderer, the application SHALL feature-detect `content="drawable"` (`'content' in HTMLCanvasElement.prototype` and `canvas.content === 'drawable'`), `texElementSubImage2D`, `getElementImageDefaultSize`, and `updateElementGeometry` in Chrome 158+, and SHALL display a clear in-page diagnostic message (stating Chrome 158+ and `chrome://flags/#canvas-draw-element`) without throwing unhandled errors if any required feature is unavailable. No fallback renderer SHALL be included.

#### Scenario: Unsupported browser displays diagnostic banner cleanly

- **WHEN** the page loads in a browser or Chrome configuration without `content="drawable"`, `texElementSubImage2D`, `getElementImageDefaultSize`, or `updateElementGeometry`
- **THEN** an in-page requirement message is shown and the console contains zero uncaught exceptions

### Requirement: Event-driven live DOM texture upload via `texElementSubImage2D`

Each `<article class="page__content" drawable>` SHALL be backed by its own WebGL2 texture, pre-allocated via `gl.texImage2D` using `Math.ceil`-rounded `canvas.getElementImageDefaultSize(el)` dimensions and uploaded exclusively via `gl.texElementSubImage2D(gl.TEXTURE_2D, 0, 0, 0, el)` (with zero DOM-to-image polyfills). Re-uploads SHALL occur only inside the canvas `paint` (`CanvasPaintEvent`) handler for `.page__content` elements reported in `event.changedElements` (plus initial paint or resize when default size changes)—never every frame and never for unedited pages during scroll—and SHALL be sampled upright (`UNPACK_FLIP_Y_WEBGL = 1`) with premultiplied alpha (`UNPACK_PREMULTIPLY_ALPHA_WEBGL = 1`).

#### Scenario: Live DOM edits and CSS hover states update the WebGL texture on paint

- **WHEN** a user hovers an interactive element on a page or edits page text in Chrome DevTools
- **THEN** the canvas `paint` event fires with that `.page__content` in `event.changedElements`, `texElementSubImage2D` re-uploads only the changed page texture, and the WebGL render reflects the change within one frame while idling with zero paints when static

### Requirement: Binding-aligned tessellated plane and pixel-aligned projection

The page mesh SHALL be a plane in the XY-plane with the binding along the Y-axis at `x = 0` and the page extending to `+x`, tessellated densely enough for smooth curvature (default `64x64` segments), matching the `book-scroller` `.page__content` aspect ratio, and viewed through a camera/projection that aligns the flat snapped page (`progress = 0`) pixel-for-pixel (`+-1 px`) with its DOM layout position.

#### Scenario: Flat WebGL page overlays DOM layout pixel-for-pixel

- **WHEN** a page is at its flat, snapped resting position (`progress = 0`)
- **THEN** the rendered WebGL plane matches the underlying DOM `.page__content` bounds within `+-1 px` with upright, unstretched texture sampling
