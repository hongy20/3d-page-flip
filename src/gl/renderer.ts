import flatVertSource from '../shaders/flat.vert.glsl?raw';
import pageFragSource from '../shaders/page.frag.glsl?raw';
import { createPageModelMatrix, createPerspectiveViewMatrix, multiplyMat4 } from './camera';
import { createGeometrySync } from './geometrySync';
import { createPlaneMesh } from './planeGeometry';
import { createPageTextureManager } from './textures';
import type {
  CanvasPaintEvent,
  DrawableCanvasElement,
  HtmlInCanvasWebGL2Context,
} from './types';

function compileShader(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Failed to create WebGL2 shader');
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? 'Unknown shader compile error';
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertSource: string,
  fragSource: string,
): WebGLProgram {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSource);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSource);
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    throw new Error('Failed to create WebGL2 program');
  }
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? 'Unknown program link error';
    gl.deleteProgram(program);
    throw new Error(info);
  }
  return program;
}

function rectsIntersect(a: DOMRect, b: DOMRect): boolean {
  return a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom;
}

/**
 * Initializes the event-driven WebGL2 HTML-in-Canvas renderer.
 * Uploads textures solely inside `paint` events and draws only on demand.
 */
export function initBookRenderer(
  canvas: DrawableCanvasElement,
  gl: HtmlInCanvasWebGL2Context,
  book: HTMLElement,
  pages: ReadonlyArray<HTMLElement>,
): () => void {
  const program = createProgram(gl, flatVertSource, pageFragSource);
  const uMvp = gl.getUniformLocation(program, 'u_mvp');
  const uPageTex = gl.getUniformLocation(program, 'u_pageTex');
  const uOpacity = gl.getUniformLocation(program, 'u_opacity');

  const mesh = createPlaneMesh(gl);
  const textureManager = createPageTextureManager(canvas, gl, pages);
  const geometrySync = createGeometrySync(canvas);
  const pageEntries = pages.map((content) => ({
    content,
    frame: content.closest<HTMLElement>('.page__frame') ?? content,
  }));

  let needsResizeTextureCheck = true;
  let rafId: number | null = null;
  const mvpScratch = new Float32Array(16);

  function updateCanvasSize(): boolean {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return false;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.max(1, Math.round(rect.width * dpr));
    const targetH = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width === targetW && canvas.height === targetH) {
      return false;
    }
    canvas.width = targetW;
    canvas.height = targetH;
    gl.viewport(0, 0, targetW, targetH);
    needsResizeTextureCheck = true;
    return true;
  }

  function renderFrame(): void {
    rafId = null;

    const canvasRect = canvas.getBoundingClientRect();
    if (canvasRect.width <= 0 || canvasRect.height <= 0 || canvas.width <= 0 || canvas.height <= 0) {
      return;
    }

    geometrySync.syncBook(book);

    const visiblePages: Array<{ el: HTMLElement; rect: DOMRect; opacity: number }> = [];
    for (const { content, frame } of pageEntries) {
      const rect = frame.getBoundingClientRect();
      const opacity = parseFloat(getComputedStyle(frame).opacity);
      if (opacity > 0.001 && rectsIntersect(rect, canvasRect)) {
        const cs = getComputedStyle(content);
        const cssWidth = parseFloat(cs.width);
        const cssHeight = parseFloat(cs.height);
        geometrySync.syncPage(content, rect, canvasRect, cssWidth, cssHeight);
        visiblePages.push({ el: content, rect, opacity });
      } else {
        geometrySync.hideElement(content);
      }
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(program);
    gl.bindVertexArray(mesh.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(uPageTex, 0);

    const vpMatrix = createPerspectiveViewMatrix(canvasRect.width, canvasRect.height);

    for (let i = visiblePages.length - 1; i >= 0; i -= 1) {
      const { el, rect, opacity } = visiblePages[i];
      const texture = textureManager.getTexture(el);
      if (!texture) {
        continue;
      }
      const modelMatrix = createPageModelMatrix(rect, canvasRect, mesh.width, mesh.height);
      multiplyMat4(vpMatrix, modelMatrix, mvpScratch);
      gl.uniformMatrix4fv(uMvp, false, mvpScratch);
      gl.uniform1f(uOpacity, opacity);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
    }

    gl.bindVertexArray(null);
  }

  function scheduleRender(): void {
    if (rafId !== null) {
      return;
    }
    rafId = requestAnimationFrame(renderFrame);
  }

  function onPaint(event: Event): void {
    const paintEvent = event as CanvasPaintEvent;
    textureManager.syncOnPaint(paintEvent.changedElements, needsResizeTextureCheck);
    needsResizeTextureCheck = false;
    scheduleRender();
  }

  updateCanvasSize();

  const resizeObserver = new ResizeObserver(() => {
    if (updateCanvasSize()) {
      canvas.requestPaint?.();
      scheduleRender();
    }
  });
  resizeObserver.observe(canvas);
  canvas.addEventListener('paint', onPaint);

  canvas.requestPaint?.();
  scheduleRender();

  return () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    resizeObserver.disconnect();
    canvas.removeEventListener('paint', onPaint);
    textureManager.dispose();
    mesh.dispose();
    gl.deleteProgram(program);
  };
}
