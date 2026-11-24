# Spec Delta: webgl-html-in-canvas

## Purpose

Renders live HTML page content as GPU textures on a densely tessellated, pixel-aligned plane inside a `<canvas layoutsubtree>` WebGL2 overlay using Chrome 157+'s HTML-in-Canvas API (`texElementImage2D` and `paint` events) while preserving native CSS scrolling.

## ADDED Requirements

### Requirement: Viewport-fixed `<canvas layoutsubtree>` with WebGL2 context and DPR sizing
A `<canvas layoutsubtree>` element SHALL be fixed over the viewport with a WebGL2 rendering context (`OQ-01`). Its backing store SHALL be sized to `devicePixelRatio` (capped, e.g., at `2`) and updated via `ResizeObserver`.

#### Scenario: Canvas resizes cleanly with viewport and devicePixelRatio
- **WHEN** the browser viewport is resized
- **THEN** `ResizeObserver` updates the canvas backing store dimensions scaled by capped `devicePixelRatio` and updates the WebGL viewport without visual distortion

### Requirement: Non-blocking native scroll pass-through
The `<canvas layoutsubtree>` overlay SHALL NOT block native scrolling; user input (trackpad, touch, wheel, keyboard) SHALL still reach `.book` and produce the exact snap pagination behavior established in `book-scroller` (via `pointer-events`, stacking, or scroller placement inside the canvas subtree per `OQ-03`).

#### Scenario: Native scroll and snap behave identically with WebGL overlay active
- **WHEN** the user scrolls or swipes over the viewport with the WebGL canvas active
- **THEN** `.book` scrolls and snaps one page per gesture identically to `book-scroller`

### Requirement: Upfront HTML-in-Canvas feature detection
Before initializing the renderer, the application SHALL feature-detect `layoutsubtree` and `texElementImage2D` in Chrome 157+, and SHALL display a clear in-page diagnostic message (e.g., stating Chrome 157+ and required flag) without throwing unhandled errors if either feature is unavailable. No fallback renderer SHALL be included.

#### Scenario: Unsupported browser displays diagnostic banner cleanly
- **WHEN** the page loads in a browser or Chrome configuration without `layoutsubtree` or `texElementImage2D`
- **THEN** an in-page requirement message is shown and the console contains zero uncaught exceptions

### Requirement: Event-driven live DOM texture upload via `texElementImage2D`
Page content elements to be textured SHALL be direct children of `<canvas layoutsubtree>`, uploaded exclusively via `gl.texElementImage2D(...)` (with zero DOM-to-image polyfills), and re-uploaded only inside the canvas `paint` event handler for elements that changed—never every frame. At minimum, the current page and the page being revealed SHALL have textures (`OQ-05`), sampled with upright orientation and consistent premultiplied-alpha handling.

#### Scenario: Live DOM edits and CSS hover states update the WebGL texture on paint
- **WHEN** a user hovers an interactive element on a page or edits page text in Chrome DevTools
- **THEN** the canvas `paint` event fires, `texElementImage2D` re-uploads only the changed page texture, and the WebGL render reflects the change within one frame while idling when static

### Requirement: Binding-aligned tessellated plane and pixel-aligned projection
The page mesh SHALL be a plane in the XY-plane with the binding along the Y-axis at `x = 0` and the page extending to `+x`, tessellated densely enough for smooth curvature (default `64x64` segments), matching the `book-scroller` page aspect ratio, and viewed through a camera/projection that aligns the flat snapped page (`progress = 0`) pixel-for-pixel (`+-1 px`) with its DOM layout position.

#### Scenario: Flat WebGL page overlays DOM layout pixel-for-pixel
- **WHEN** a page is at its flat, snapped resting position (`progress = 0`)
- **THEN** the rendered WebGL plane matches the underlying DOM page bounds within `+-1 px` with upright, unstretched texture sampling
