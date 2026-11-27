/** Pixel dimensions returned by `canvas.getElementImageDefaultSize(el)`. */
export interface ElementImageSize {
  readonly width: number;
  readonly height: number;
}

/** Hit-test / paint transform options for `canvas.updateElementGeometry(el, options)`. */
export interface ElementGeometryOptions {
  canvasTransform: DOMMatrix;
}

/** Experimental Chrome `paint` event dispatched on `<canvas content="drawable">`. */
export interface CanvasPaintEvent extends Event {
  readonly changedElements?: ReadonlyArray<Element>;
}

/** `<canvas content="drawable">` element with Chrome 158+ HTML-in-Canvas methods. */
export interface DrawableCanvasElement extends HTMLCanvasElement {
  content: string;
  getElementImageDefaultSize(element: Element): ElementImageSize;
  updateElementGeometry(element: Element, options: ElementGeometryOptions): void;
  requestPaint?: () => void;
}

/** WebGL2 context extended with `texElementSubImage2D` from HTML-in-Canvas. */
export interface HtmlInCanvasWebGL2Context extends WebGL2RenderingContext {
  texElementSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    element: Element,
  ): void;
}
