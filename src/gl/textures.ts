import type { DrawableCanvasElement, HtmlInCanvasWebGL2Context } from './types';

interface PageTextureEntry {
  texture: WebGLTexture;
  width: number;
  height: number;
  uploaded: boolean;
}

export interface PageTextureManager {
  syncOnPaint(changedElements: ReadonlyArray<Element> | undefined, checkResize: boolean): number;
  getTexture(el: HTMLElement): WebGLTexture | null;
  dispose(): void;
}

/**
 * Manages one WebGL2 texture per `.page__content`, uploading strictly inside `paint` events.
 */
export function createPageTextureManager(
  canvas: DrawableCanvasElement,
  gl: HtmlInCanvasWebGL2Context,
  pages: ReadonlyArray<HTMLElement>,
): PageTextureManager {
  const entries = new Map<HTMLElement, PageTextureEntry>();

  function createConfiguredTexture(): WebGLTexture {
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error('Failed to allocate WebGL2 page texture');
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  return {
    syncOnPaint(changedElements, checkResize) {
      const changedSet = new Set(changedElements ?? []);
      let pixelStoreConfigured = false;
      let uploadedCount = 0;

      for (const el of pages) {
        let entry = entries.get(el);
        const isChanged = changedSet.has(el);
        const needsCheck = !entry?.uploaded || isChanged || checkResize;
        if (!needsCheck) {
          continue;
        }

        const size = canvas.getElementImageDefaultSize(el);
        const width = Math.ceil(size.width);
        const height = Math.ceil(size.height);
        if (width <= 0 || height <= 0) {
          continue;
        }

        if (entry?.uploaded && !isChanged && entry.width === width && entry.height === height) {
          continue;
        }

        if (!pixelStoreConfigured) {
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
          pixelStoreConfigured = true;
        }

        const isNew = !entry;
        if (!entry) {
          entry = {
            texture: createConfiguredTexture(),
            width: 0,
            height: 0,
            uploaded: false,
          };
          entries.set(el, entry);
        } else {
          gl.bindTexture(gl.TEXTURE_2D, entry.texture);
        }

        if (isNew || entry.width !== width || entry.height !== height) {
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            width,
            height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
          );
          entry.width = width;
          entry.height = height;
        }

        gl.texElementSubImage2D(gl.TEXTURE_2D, 0, 0, 0, el);
        entry.uploaded = true;
        uploadedCount += 1;
      }

      return uploadedCount;
    },

    getTexture(el) {
      return entries.get(el)?.texture ?? null;
    },

    dispose() {
      for (const entry of entries.values()) {
        gl.deleteTexture(entry.texture);
      }
      entries.clear();
    },
  };
}
