import type { DrawableCanvasElement } from "./types";

type AffineTuple = readonly [number, number, number, number, number, number];

const IDENTITY_TRANSFORM: AffineTuple = [1, 0, 0, 1, 0, 0];
const OFFSCREEN_TRANSFORM: AffineTuple = [1, 0, 0, 1, -100000, -100000];
const EPSILON = 1e-3;

export interface GeometrySync {
  syncBook(book: HTMLElement): void;
  syncPage(
    el: HTMLElement,
    pageRect: DOMRect,
    canvasRect: DOMRect,
    cssWidth: number,
    cssHeight: number,
  ): void;
  hideElement(el: HTMLElement): void;
}

/**
 * Synchronizes `drawable` element hit-test transforms in canvas CSS pixels,
 * caching the last affine matrix per element to avoid redundant `paint` triggers.
 */
export function createGeometrySync(canvas: DrawableCanvasElement): GeometrySync {
  const cached = new WeakMap<Element, Float64Array>();

  function applyTransform(el: HTMLElement, next: AffineTuple): void {
    const prev = cached.get(el);
    if (
      prev &&
      Math.abs(prev[0] - next[0]) < EPSILON &&
      Math.abs(prev[1] - next[1]) < EPSILON &&
      Math.abs(prev[2] - next[2]) < EPSILON &&
      Math.abs(prev[3] - next[3]) < EPSILON &&
      Math.abs(prev[4] - next[4]) < EPSILON &&
      Math.abs(prev[5] - next[5]) < EPSILON
    ) {
      return;
    }

    const stored = prev ?? new Float64Array(6);
    stored[0] = next[0];
    stored[1] = next[1];
    stored[2] = next[2];
    stored[3] = next[3];
    stored[4] = next[4];
    stored[5] = next[5];
    cached.set(el, stored);

    canvas.updateElementGeometry(el, {
      canvasTransform: new DOMMatrix([next[0], next[1], next[2], next[3], next[4], next[5]]),
    });
  }

  return {
    syncBook(book) {
      applyTransform(book, IDENTITY_TRANSFORM);
    },

    syncPage(el, pageRect, canvasRect, cssWidth, cssHeight) {
      const tx = pageRect.left - canvasRect.left;
      const ty = pageRect.top - canvasRect.top;
      const sx = cssWidth > 0 ? pageRect.width / cssWidth : 1;
      const sy = cssHeight > 0 ? pageRect.height / cssHeight : 1;

      applyTransform(el, [sx, 0, 0, sy, tx, ty]);
    },

    hideElement(el) {
      applyTransform(el, OFFSCREEN_TRANSFORM);
    },
  };
}
