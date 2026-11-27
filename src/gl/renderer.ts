import coneVertSource from "../shaders/cone.vert.glsl?raw";
import pageFragSource from "../shaders/page.frag.glsl?raw";
import { createPageModelMatrix, createPerspectiveViewMatrix, multiplyMat4 } from "./camera";
import { HALF_PI, coneParams, turnOpacity } from "./coneMath";
import { createGeometrySync } from "./geometrySync";
import { createPlaneMesh } from "./planeGeometry";
import { createPageTextureManager } from "./textures";
import type { CanvasPaintEvent, DrawableCanvasElement, HtmlInCanvasWebGL2Context } from "./types";

export type Vec3 = readonly [number, number, number];

export const DEFAULT_LIGHT_POS: Vec3 = [-0.6, 1.0, 3.0];

export interface BookRendererOptions {
  readonly lightPos?: Vec3;
}

export interface BookRendererHandle {
  setLightPos(pos: Vec3): void;
  getLightPos(): Vec3;
  dispose(): void;
}

type ReaderMode = "curl" | "slide" | "stack";

const EPS = 1e-4;
const PROGRESS_CHANGE_EPS = 1e-5;
const LIGHT_CHANGE_EPS = 1e-5;

function compileShader(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Failed to create WebGL2 shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? "Unknown shader compile error";
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
    throw new Error("Failed to create WebGL2 program");
  }
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? "Unknown program link error";
    gl.deleteProgram(program);
    throw new Error(info);
  }
  return program;
}

function rectsIntersect(a: DOMRect, b: DOMRect): boolean {
  return a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom;
}

/** Reads CSS `--progress` via CSSOM without writing styles or scroll state. */
function readPageProgress(pageEl: HTMLElement): number {
  const typedEl = pageEl as HTMLElement & {
    computedStyleMap?: () => { get(property: string): unknown };
  };
  const rawTyped = typedEl.computedStyleMap?.().get("--progress") as
    | { value?: number }
    | null
    | undefined;
  if (rawTyped && typeof rawTyped.value === "number" && Number.isFinite(rawTyped.value)) {
    return rawTyped.value;
  }
  const parsed = parseFloat(getComputedStyle(pageEl).getPropertyValue("--progress"));
  return Number.isFinite(parsed) ? parsed : 0;
}

function readActiveMode(): ReaderMode {
  const checked = document.querySelector<HTMLInputElement>('input[name="mode"]:checked');
  if (checked?.value === "slide" || checked?.value === "stack") {
    return checked.value;
  }
  return "curl";
}

/**
 * Initializes the event-driven WebGL2 HTML-in-Canvas renderer.
 * Uploads textures solely inside `paint` events and draws only when state changes.
 */
export function initBookRenderer(
  canvas: DrawableCanvasElement,
  gl: HtmlInCanvasWebGL2Context,
  book: HTMLElement,
  pages: ReadonlyArray<HTMLElement>,
  options?: BookRendererOptions,
): BookRendererHandle {
  const program = createProgram(gl, coneVertSource, pageFragSource);
  const uMvp = gl.getUniformLocation(program, "u_mvp");
  const uModel = gl.getUniformLocation(program, "u_model");
  const uPageTex = gl.getUniformLocation(program, "u_pageTex");
  const uOpacity = gl.getUniformLocation(program, "u_opacity");
  const uTheta = gl.getUniformLocation(program, "u_theta");
  const uAy = gl.getUniformLocation(program, "u_Ay");
  const uRho = gl.getUniformLocation(program, "u_rho");
  const uZBias = gl.getUniformLocation(program, "u_zBias");
  const uLightPos = gl.getUniformLocation(program, "u_lightPos");

  const mesh = createPlaneMesh(gl);
  const textureManager = createPageTextureManager(canvas, gl, pages);
  const geometrySync = createGeometrySync(canvas);
  const pageEntries = pages.map((content) => ({
    page: content.closest<HTMLElement>(".page") ?? content,
    frame: content.closest<HTMLElement>(".page__frame") ?? content,
    content,
  }));

  let lightPos: Vec3 = options?.lightPos ?? DEFAULT_LIGHT_POS;
  let needsResizeTextureCheck = true;
  let textureDirty = true;
  let resizeDirty = true;
  let lightDirty = true;
  let lastMode: ReaderMode | null = null;
  let lastLayoutSignature = "";
  let settleFramesRemaining = 0;
  let rafId: number | null = null;
  let disposed = false;

  const progressScratch = new Float64Array(pageEntries.length);
  const lastProgress = new Float64Array(pageEntries.length).fill(Number.NaN);
  const mvpScratch = new Float32Array(16);

  function drawPageMesh(
    mvp: Float32Array,
    model: Float32Array,
    texture: WebGLTexture,
    opacity: number,
    theta: number,
    Ay: number,
    rho: number,
    zBias: number,
  ): void {
    gl.uniformMatrix4fv(uMvp, false, mvp);
    gl.uniformMatrix4fv(uModel, false, model);
    gl.uniform1f(uOpacity, opacity);
    gl.uniform1f(uTheta, theta);
    gl.uniform1f(uAy, Ay);
    gl.uniform1f(uRho, rho);
    gl.uniform1f(uZBias, zBias);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
  }

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
    resizeDirty = true;
    return true;
  }

  function renderFrame(): void {
    rafId = null;
    if (disposed) {
      return;
    }

    const canvasRect = canvas.getBoundingClientRect();
    if (
      canvasRect.width <= 0 ||
      canvasRect.height <= 0 ||
      canvas.width <= 0 ||
      canvas.height <= 0
    ) {
      return;
    }

    const mode = readActiveMode();
    const modeChanged = mode !== lastMode;

    let progressChanged = false;
    for (let i = 0; i < pageEntries.length; i += 1) {
      const p = readPageProgress(pageEntries[i].page);
      progressScratch[i] = p;
      if (Number.isNaN(lastProgress[i]) || Math.abs(p - lastProgress[i]) > PROGRESS_CHANGE_EPS) {
        progressChanged = true;
      }
    }

    let layoutSignature = "";
    let centeredRect: DOMRect | null = null;
    const flatVisiblePages: Array<{
      index: number;
      content: HTMLElement;
      rect: DOMRect;
      opacity: number;
    }> = [];

    if (mode === "curl") {
      const sampleRect = pageEntries[0].frame.getBoundingClientRect();
      const centeredLeft = canvasRect.left + (canvasRect.width - sampleRect.width) * 0.5;
      const centeredTop = canvasRect.top + (canvasRect.height - sampleRect.height) * 0.5;
      centeredRect = new DOMRect(centeredLeft, centeredTop, sampleRect.width, sampleRect.height);
      layoutSignature = `curl:${canvasRect.width.toFixed(1)}x${canvasRect.height.toFixed(1)}:${sampleRect.width.toFixed(2)}x${sampleRect.height.toFixed(2)}`;
    } else {
      const sigParts: string[] = [mode];
      for (let i = 0; i < pageEntries.length; i += 1) {
        const { content, frame } = pageEntries[i];
        const rect = frame.getBoundingClientRect();
        const opacity = parseFloat(getComputedStyle(frame).opacity);
        if (opacity > 0.001 && rectsIntersect(rect, canvasRect)) {
          flatVisiblePages.push({ index: i, content, rect, opacity });
          sigParts.push(
            `${i}@${rect.left.toFixed(2)},${rect.top.toFixed(2)},${rect.width.toFixed(2)},${rect.height.toFixed(2)},${opacity.toFixed(3)}`,
          );
        }
      }
      layoutSignature = sigParts.join("|");
    }

    const layoutChanged = layoutSignature !== lastLayoutSignature;
    const shouldDraw =
      textureDirty || resizeDirty || lightDirty || modeChanged || progressChanged || layoutChanged;

    if (!shouldDraw) {
      if (settleFramesRemaining > 0) {
        settleFramesRemaining -= 1;
        scheduleRender();
      }
      return;
    }

    textureDirty = false;
    resizeDirty = false;
    lightDirty = false;
    lastMode = mode;
    lastLayoutSignature = layoutSignature;
    lastProgress.set(progressScratch);

    if (progressChanged || layoutChanged) {
      settleFramesRemaining = 2;
      scheduleRender();
    }

    geometrySync.syncBook(book);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(program);
    gl.bindVertexArray(mesh.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(uPageTex, 0);
    gl.uniform3f(uLightPos, lightPos[0], lightPos[1], lightPos[2]);

    const vpMatrix = createPerspectiveViewMatrix(canvasRect.width, canvasRect.height);

    if (mode === "curl" && centeredRect) {
      let settledIdx = -1;
      let turningIdx = -1;
      let underIdx = -1;

      for (let i = 0; i < pageEntries.length; i += 1) {
        const p = progressScratch[i];
        if (Math.abs(p) <= EPS) {
          settledIdx = i;
        } else if (p > EPS && p < 1 - EPS) {
          turningIdx = i;
        } else if (p < -EPS && p > -1 + EPS) {
          underIdx = i;
        }
      }

      const activeIdx =
        settledIdx !== -1
          ? settledIdx
          : turningIdx !== -1 && (underIdx === -1 || progressScratch[turningIdx] < 0.5)
            ? turningIdx
            : underIdx;

      for (let i = 0; i < pageEntries.length; i += 1) {
        const { content } = pageEntries[i];
        if (i === activeIdx) {
          const cs = getComputedStyle(content);
          const cssWidth = parseFloat(cs.width);
          const cssHeight = parseFloat(cs.height);
          geometrySync.syncPage(content, centeredRect, canvasRect, cssWidth, cssHeight);
        } else {
          geometrySync.hideElement(content);
        }
      }

      const centeredModel = createPageModelMatrix(
        centeredRect,
        canvasRect,
        mesh.width,
        mesh.height,
      );
      multiplyMat4(vpMatrix, centeredModel, mvpScratch);

      if (turningIdx !== -1 || underIdx !== -1) {
        const baseIdx = underIdx !== -1 ? underIdx : settledIdx;
        if (baseIdx !== -1) {
          const baseTex = textureManager.getTexture(pageEntries[baseIdx].content);
          if (baseTex) {
            drawPageMesh(mvpScratch, centeredModel, baseTex, 1, HALF_PI, -1.0, 0, -0.002);
          }
        }
        if (turningIdx !== -1) {
          const turnTex = textureManager.getTexture(pageEntries[turningIdx].content);
          if (turnTex) {
            const p = progressScratch[turningIdx];
            const { theta, Ay, rho } = coneParams(p);
            drawPageMesh(mvpScratch, centeredModel, turnTex, turnOpacity(p), theta, Ay, rho, 0);
          }
        }
      } else if (settledIdx !== -1) {
        const settledTex = textureManager.getTexture(pageEntries[settledIdx].content);
        if (settledTex) {
          drawPageMesh(mvpScratch, centeredModel, settledTex, 1, HALF_PI, -1.0, 0, 0);
        }
      }
    } else {
      const visibleSet = new Set(flatVisiblePages.map((entry) => entry.index));
      for (let i = 0; i < pageEntries.length; i += 1) {
        if (!visibleSet.has(i)) {
          geometrySync.hideElement(pageEntries[i].content);
        }
      }

      for (const { content, rect } of flatVisiblePages) {
        const cs = getComputedStyle(content);
        const cssWidth = parseFloat(cs.width);
        const cssHeight = parseFloat(cs.height);
        geometrySync.syncPage(content, rect, canvasRect, cssWidth, cssHeight);
      }

      for (let i = flatVisiblePages.length - 1; i >= 0; i -= 1) {
        const { content, rect, opacity } = flatVisiblePages[i];
        const texture = textureManager.getTexture(content);
        if (!texture) {
          continue;
        }
        const modelMatrix = createPageModelMatrix(rect, canvasRect, mesh.width, mesh.height);
        multiplyMat4(vpMatrix, modelMatrix, mvpScratch);
        drawPageMesh(mvpScratch, modelMatrix, texture, opacity, HALF_PI, -1.0, 0, 0);
      }
    }

    gl.bindVertexArray(null);
  }

  function scheduleRender(): void {
    if (disposed || rafId !== null) {
      return;
    }
    rafId = requestAnimationFrame(renderFrame);
  }

  function onPaint(event: Event): void {
    const paintEvent = event as CanvasPaintEvent;
    const uploaded = textureManager.syncOnPaint(
      paintEvent.changedElements,
      needsResizeTextureCheck,
    );
    needsResizeTextureCheck = false;
    if (uploaded > 0) {
      textureDirty = true;
    }
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
  canvas.addEventListener("paint", onPaint);

  canvas.requestPaint?.();
  scheduleRender();

  return {
    setLightPos(pos) {
      if (!Number.isFinite(pos[0]) || !Number.isFinite(pos[1]) || !Number.isFinite(pos[2])) {
        return;
      }
      if (
        Math.abs(pos[0] - lightPos[0]) <= LIGHT_CHANGE_EPS &&
        Math.abs(pos[1] - lightPos[1]) <= LIGHT_CHANGE_EPS &&
        Math.abs(pos[2] - lightPos[2]) <= LIGHT_CHANGE_EPS
      ) {
        return;
      }
      lightPos = [pos[0], pos[1], pos[2]];
      lightDirty = true;
      scheduleRender();
    },

    getLightPos() {
      return lightPos;
    },

    dispose() {
      disposed = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      resizeObserver.disconnect();
      canvas.removeEventListener("paint", onPaint);
      textureManager.dispose();
      mesh.dispose();
      gl.deleteProgram(program);
    },
  };
}
