import type { DrawableCanvasElement, HtmlInCanvasWebGL2Context } from './types';

export type FeatureDetectResult =
  | { supported: true; canvas: DrawableCanvasElement; gl: HtmlInCanvasWebGL2Context }
  | { supported: false; missing: string[] };

/**
 * Checks upfront for Chrome 158+ HTML-in-Canvas and WebGL2 capabilities without throwing.
 */
export function detectHtmlInCanvas(canvas: HTMLCanvasElement): FeatureDetectResult {
  const missing: string[] = [];

  const hasDrawableContent =
    'content' in HTMLCanvasElement.prototype &&
    (canvas as Partial<DrawableCanvasElement>).content === 'drawable';
  if (!hasDrawableContent) {
    missing.push('<canvas content="drawable">');
  }

  const hasTexElement =
    typeof WebGL2RenderingContext !== 'undefined' &&
    typeof (WebGL2RenderingContext.prototype as Partial<HtmlInCanvasWebGL2Context>)
      .texElementSubImage2D === 'function';
  if (!hasTexElement) {
    missing.push('WebGL2RenderingContext.texElementSubImage2D');
  }

  const hasDefaultSize =
    typeof (HTMLCanvasElement.prototype as Partial<DrawableCanvasElement>)
      .getElementImageDefaultSize === 'function';
  if (!hasDefaultSize) {
    missing.push('HTMLCanvasElement.getElementImageDefaultSize');
  }

  const hasUpdateGeometry =
    typeof (HTMLCanvasElement.prototype as Partial<DrawableCanvasElement>)
      .updateElementGeometry === 'function';
  if (!hasUpdateGeometry) {
    missing.push('HTMLCanvasElement.updateElementGeometry');
  }

  if (missing.length > 0) {
    return { supported: false, missing };
  }

  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true });
  if (!gl) {
    return { supported: false, missing: ['WebGL2 rendering context'] };
  }

  return {
    supported: true,
    canvas: canvas as DrawableCanvasElement,
    gl: gl as HtmlInCanvasWebGL2Context,
  };
}

/**
 * Renders an accessible in-page diagnostic banner when HTML-in-Canvas is unavailable.
 */
export function showUnsupportedMessage(missing: string[]): void {
  const aside = document.createElement('aside');
  aside.className = 'unsupported';
  aside.setAttribute('role', 'alert');

  const card = document.createElement('div');
  card.className = 'unsupported__card';

  const heading = document.createElement('h1');
  heading.textContent = 'Chrome 158+ HTML-in-Canvas Required';

  const message = document.createElement('p');
  message.append(
    'WebBook 3D requires Chrome 158+ with ',
    createCode('chrome://flags/#canvas-draw-element'),
    ' enabled. Missing capabilities:',
  );

  const list = document.createElement('ul');
  for (const item of missing) {
    const li = document.createElement('li');
    li.textContent = item;
    list.append(li);
  }

  card.append(heading, message, list);
  aside.append(card);
  document.body.append(aside);
}

function createCode(text: string): HTMLElement {
  const code = document.createElement('code');
  code.textContent = text;
  return code;
}
