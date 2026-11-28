import coneVertSource from "../shaders/cone.vert.glsl?raw";
import pageFragSource from "../shaders/page.frag.glsl?raw";
import { createPageModelMatrix, createPerspectiveViewMatrix, multiplyMat4 } from "./camera";
import {
  HALF_PI,
  coneParams,
  cylKappa,
  pointerXToConicContribution,
  pointerYToConicContribution,
  solveVerticalCurlControl,
  turnOpacity,
} from "./coneMath";
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
const CONIC_CHANGE_EPS = 1e-5;
const PENDING_CONIC_TTL_MS = 300;

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
  const mode = document.body.dataset.mode;
  if (mode === "curl" || mode === "stack") {
    return mode;
  }
  return "slide";
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
  const uConicContribution = gl.getUniformLocation(program, "u_conicContribution");
  const uCylKappa = gl.getUniformLocation(program, "u_cylKappa");
  const uPageWidth = gl.getUniformLocation(program, "u_pageWidth");
  const uPageHeight = gl.getUniformLocation(program, "u_pageHeight");
  const uVertical = gl.getUniformLocation(program, "u_vertical");
  const uZBias = gl.getUniformLocation(program, "u_zBias");
  const uLightPos = gl.getUniformLocation(program, "u_lightPos");

  const mesh = createPlaneMesh(gl);
  const textureManager = createPageTextureManager(canvas, gl, pages);
  const geometrySync = createGeometrySync(canvas);
  const portraitMediaQuery = window.matchMedia("(orientation: portrait)");
  const pageEntries = pages.map((content) => ({
    page: content.closest<HTMLElement>(".page") ?? content,
    frame: content.closest<HTMLElement>(".page__frame") ?? content,
    content,
  }));

  function isVerticalLayoutActive(): boolean {
    return document.body.dataset.layout === "vertical" && portraitMediaQuery.matches;
  }

  let lightPos: Vec3 = options?.lightPos ?? DEFAULT_LIGHT_POS;
  let activeConicContribution = 1;
  let lastConicContribution = 1;
  let activeCornerBend = 0;
  let lastCornerBend = 0;
  let pendingConicContribution: number | null = null;
  let pendingCornerBend = 0;
  let pendingConicTimestamp = 0;
  let activeTurnPage = -1;
  let activePointerId: number | null = null;
  let activeTouchId: number | null = null;
  let isPointerDragging = false;
  let grabStartClientX = 0;
  let grabStartClientY = 0;
  let activePointerClientX = 0;
  let activePointerClientY = 0;
  let grabNormX = 1;
  let grabNormY = 0;
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
    conicContribution: number,
    cylKappaValue: number,
    zBias: number,
  ): void {
    gl.uniformMatrix4fv(uMvp, false, mvp);
    gl.uniformMatrix4fv(uModel, false, model);
    gl.uniform1f(uOpacity, opacity);
    gl.uniform1f(uTheta, theta);
    gl.uniform1f(uAy, Ay);
    gl.uniform1f(uRho, rho);
    gl.uniform1f(uConicContribution, conicContribution);
    gl.uniform1f(uCylKappa, cylKappaValue);
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

  function renderFrame(now = performance.now()): void {
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
    const isVertical = isVerticalLayoutActive();
    const modeChanged = mode !== lastMode;

    let progressChanged = false;
    for (let i = 0; i < pageEntries.length; i += 1) {
      const p = readPageProgress(pageEntries[i].page);
      progressScratch[i] = p;
      if (Number.isNaN(lastProgress[i]) || Math.abs(p - lastProgress[i]) > PROGRESS_CHANGE_EPS) {
        progressChanged = true;
      }
    }

    let settledIdx = -1;
    let turningIdx = -1;
    let underIdx = -1;
    if (mode === "curl") {
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

      if (turningIdx !== -1) {
        const hasFreshPendingConic =
          pendingConicContribution !== null &&
          (isPointerDragging || now - pendingConicTimestamp <= PENDING_CONIC_TTL_MS);

        if (activeTurnPage === -1) {
          activeConicContribution = hasFreshPendingConic ? (pendingConicContribution ?? 1) : 1;
          activeCornerBend = hasFreshPendingConic ? pendingCornerBend : 0;
          pendingConicContribution = null;
          pendingCornerBend = 0;
          activeTurnPage = turningIdx;
        } else if (turningIdx !== activeTurnPage) {
          if (hasFreshPendingConic) {
            activeConicContribution = pendingConicContribution ?? activeConicContribution;
            activeCornerBend = pendingCornerBend;
          }
          pendingConicContribution = null;
          pendingCornerBend = 0;
          activeTurnPage = turningIdx;
        }
      } else if (underIdx === -1) {
        activeTurnPage = -1;
        activeCornerBend = 0;
        if (
          pendingConicContribution !== null &&
          !isPointerDragging &&
          now - pendingConicTimestamp > PENDING_CONIC_TTL_MS
        ) {
          pendingConicContribution = null;
          pendingCornerBend = 0;
        }
      }
    } else {
      activeTurnPage = -1;
      activeCornerBend = 0;
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
      layoutSignature = `curl:${isVertical ? "v" : "h"}:${canvasRect.width.toFixed(1)}x${canvasRect.height.toFixed(1)}:${sampleRect.width.toFixed(2)}x${sampleRect.height.toFixed(2)}`;
    } else {
      const sigParts: string[] = [mode, isVertical ? "v" : "h"];
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

    if (
      mode === "curl" &&
      turningIdx !== -1 &&
      isPointerDragging &&
      centeredRect &&
      centeredRect.width > 0 &&
      centeredRect.height > 0
    ) {
      const solved = solveDragControl(progressScratch[turningIdx], centeredRect, isVertical);
      activeConicContribution = solved.conicContribution;
      activeCornerBend = solved.cornerBend;
    }

    const conicChanged =
      Math.abs(activeConicContribution - lastConicContribution) > CONIC_CHANGE_EPS ||
      Math.abs(activeCornerBend - lastCornerBend) > CONIC_CHANGE_EPS;

    const layoutChanged = layoutSignature !== lastLayoutSignature;
    const shouldDraw =
      textureDirty ||
      resizeDirty ||
      lightDirty ||
      modeChanged ||
      progressChanged ||
      conicChanged ||
      layoutChanged;

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
    lastConicContribution = activeConicContribution;
    lastCornerBend = activeCornerBend;
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
    gl.uniform1f(uPageWidth, mesh.width);
    gl.uniform1f(uPageHeight, mesh.height);
    gl.uniform1f(uVertical, isVertical ? 1 : 0);
    gl.uniform3f(uLightPos, lightPos[0], lightPos[1], lightPos[2]);

    const sweepLength = isVertical ? mesh.height : mesh.width;
    const hingeSpan = isVertical ? mesh.width : mesh.height;

    const vpMatrix = createPerspectiveViewMatrix(canvasRect.width, canvasRect.height);

    if (mode === "curl" && centeredRect) {
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
            drawPageMesh(mvpScratch, centeredModel, baseTex, 1, HALF_PI, -1.0, 0, 1, 0, -0.002);
          }
        }
        if (turningIdx !== -1) {
          const turnTex = textureManager.getTexture(pageEntries[turningIdx].content);
          if (turnTex) {
            const p = progressScratch[turningIdx];
            const { theta, Ay, rho } = coneParams(p, sweepLength, activeCornerBend, hingeSpan);
            drawPageMesh(
              mvpScratch,
              centeredModel,
              turnTex,
              turnOpacity(p),
              theta,
              Ay,
              rho,
              activeConicContribution,
              cylKappa(p, sweepLength, hingeSpan),
              0,
            );
          }
        }
      } else if (settledIdx !== -1) {
        const settledTex = textureManager.getTexture(pageEntries[settledIdx].content);
        if (settledTex) {
          drawPageMesh(mvpScratch, centeredModel, settledTex, 1, HALF_PI, -1.0, 0, 1, 0, 0);
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
        drawPageMesh(mvpScratch, modelMatrix, texture, opacity, HALF_PI, -1.0, 0, 1, 0, 0);
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

  function getCenteredPageRect(): {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
  } {
    const canvasRect = canvas.getBoundingClientRect();
    const sampleRect = pageEntries[0].frame.getBoundingClientRect();
    return {
      left: canvasRect.left + (canvasRect.width - sampleRect.width) * 0.5,
      top: canvasRect.top + (canvasRect.height - sampleRect.height) * 0.5,
      width: sampleRect.width,
      height: sampleRect.height,
    };
  }

  function solveDragControl(
    p: number,
    pageRect: { readonly width: number; readonly height: number },
    vertical: boolean,
  ) {
    if (vertical) {
      const grabU = (1 - grabNormY) * mesh.height;
      const grabV = (1 - grabNormX) * mesh.width;
      const deltaV =
        pageRect.width > 0
          ? ((grabStartClientX - activePointerClientX) / pageRect.width) * mesh.width
          : 0;
      return solveVerticalCurlControl(p, grabU, grabV, deltaV, mesh.height, mesh.width);
    }
    const deltaYUp =
      pageRect.height > 0 ? (grabStartClientY - activePointerClientY) / pageRect.height : 0;
    return solveVerticalCurlControl(
      p,
      grabNormX * mesh.width,
      grabNormY * mesh.height,
      deltaYUp,
      mesh.width,
      mesh.height,
    );
  }

  function beginDrag(clientX: number, clientY: number): void {
    const pageRect = getCenteredPageRect();
    const vertical = isVerticalLayoutActive();
    isPointerDragging = true;
    grabStartClientX = clientX;
    grabStartClientY = clientY;
    activePointerClientX = clientX;
    activePointerClientY = clientY;
    grabNormX =
      pageRect.width > 0 ? Math.min(1, Math.max(0, (clientX - pageRect.left) / pageRect.width)) : 1;
    grabNormY =
      pageRect.height > 0
        ? Math.min(1, Math.max(0, 1 - (clientY - pageRect.top) / pageRect.height))
        : 0;

    const initialConic = vertical
      ? pointerXToConicContribution(clientX, pageRect.left, pageRect.width)
      : pointerYToConicContribution(clientY, pageRect.top, pageRect.height);
    if (activeTurnPage !== -1) {
      scheduleRender();
    } else {
      pendingConicContribution = initialConic;
      pendingCornerBend = 0;
      pendingConicTimestamp = performance.now();
    }
  }

  function moveDrag(clientX: number, clientY: number): void {
    activePointerClientX = clientX;
    activePointerClientY = clientY;
    if (activeTurnPage !== -1) {
      scheduleRender();
    } else {
      const pageRect = getCenteredPageRect();
      const solved = solveDragControl(0, pageRect, isVerticalLayoutActive());
      pendingConicContribution = solved.conicContribution;
      pendingCornerBend = solved.cornerBend;
      pendingConicTimestamp = performance.now();
    }
  }

  function endDrag(): void {
    if (!isPointerDragging) {
      return;
    }
    isPointerDragging = false;
    activePointerId = null;
    activeTouchId = null;
  }

  function onPointerDown(event: PointerEvent): void {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    activePointerId = event.pointerId;
    if (event.pointerType !== "touch") {
      activeTouchId = null;
    }
    beginDrag(event.clientX, event.clientY);
  }

  function onPointerMove(event: PointerEvent): void {
    if (activePointerId !== event.pointerId) {
      return;
    }
    if (event.pointerType === "mouse" && event.buttons === 0) {
      endDrag();
      return;
    }
    moveDrag(event.clientX, event.clientY);
  }

  function onPointerUp(event: PointerEvent): void {
    if (activePointerId !== event.pointerId) {
      return;
    }
    endDrag();
  }

  function onPointerCancel(event: PointerEvent): void {
    if (activePointerId !== event.pointerId) {
      return;
    }
    if (event.pointerType === "touch" && activeTouchId !== null) {
      activePointerId = null;
      return;
    }
    endDrag();
  }

  function onTouchStart(event: TouchEvent): void {
    if (activeTouchId !== null || event.changedTouches.length === 0) {
      return;
    }
    const touch = event.changedTouches[0];
    activeTouchId = touch.identifier;
    if (!isPointerDragging) {
      beginDrag(touch.clientX, touch.clientY);
    }
  }

  function onTouchMove(event: TouchEvent): void {
    if (activeTouchId === null || activePointerId !== null) {
      return;
    }
    for (let i = 0; i < event.changedTouches.length; i += 1) {
      const touch = event.changedTouches[i];
      if (touch.identifier === activeTouchId) {
        moveDrag(touch.clientX, touch.clientY);
        return;
      }
    }
  }

  function onTouchEndOrCancel(event: TouchEvent): void {
    if (activeTouchId === null) {
      return;
    }
    for (let i = 0; i < event.changedTouches.length; i += 1) {
      if (event.changedTouches[i].identifier === activeTouchId) {
        endDrag();
        return;
      }
    }
  }

  function onNonPointerNavigation(): void {
    if (!isPointerDragging && activePointerId === null && activeTouchId === null) {
      pendingConicContribution = null;
      pendingCornerBend = 0;
    }
  }

  function onOrientationChange(): void {
    pendingConicContribution = null;
    pendingCornerBend = 0;
    resizeDirty = true;
    canvas.requestPaint?.();
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
  portraitMediaQuery.addEventListener("change", onOrientationChange);
  canvas.addEventListener("paint", onPaint);
  book.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  window.addEventListener("pointercancel", onPointerCancel, { passive: true });
  book.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("touchend", onTouchEndOrCancel, { passive: true });
  window.addEventListener("touchcancel", onTouchEndOrCancel, { passive: true });
  book.addEventListener("wheel", onNonPointerNavigation, { passive: true });
  window.addEventListener("keydown", onNonPointerNavigation, { passive: true });

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
      portraitMediaQuery.removeEventListener("change", onOrientationChange);
      canvas.removeEventListener("paint", onPaint);
      book.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      book.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEndOrCancel);
      window.removeEventListener("touchcancel", onTouchEndOrCancel);
      book.removeEventListener("wheel", onNonPointerNavigation);
      window.removeEventListener("keydown", onNonPointerNavigation);
      textureManager.dispose();
      mesh.dispose();
      gl.deleteProgram(program);
    },
  };
}
