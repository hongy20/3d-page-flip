import { PAGE_ASPECT } from "./planeGeometry";

export const HALF_PI = Math.PI / 2;
export const THETA_MIN = 0.25;
export const AY_START = -0.35;
export const AY_END = -15.0;
export const CYL_KAPPA_MAX = 2.0;
export const CYL_KAPPA_EPS = 1e-4;
export const CREASE_SWEEP_END = 0.96;
export const MAX_VERTICAL_CURL_CONTROL = 2;
export const VERTICAL_RESISTANCE_SCALE = 0.55;

export interface ConeParams {
  readonly theta: number;
  readonly Ay: number;
  readonly rho: number;
}

export interface VerticalCurlControl {
  readonly conicContribution: number;
  readonly cornerBend: number;
}

export type Vec3Tuple = readonly [number, number, number];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function rotateYNegRho(tx: number, ty: number, tz: number, rho: number): Vec3Tuple {
  const cosRho = Math.cos(rho);
  const sinRho = Math.sin(rho);
  return [tx * cosRho - tz * sinRho, ty, tx * sinRho + tz * cosRho];
}

function coneLocal(px: number, py: number, theta: number, Ay: number): Vec3Tuple {
  const dy = py - Ay;
  const R = Math.hypot(px, dy);
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  const ratio = clamp(px / R, -1, 1);
  const alpha = Math.asin(ratio);
  const beta = alpha / sinTheta;
  const r = R * sinTheta;
  const oneMinusCosBeta = 1 - Math.cos(beta);

  const Tx = r * Math.sin(beta);
  // Cancellation-safe R + Ay = py + px^2 / (R + (py - Ay)).
  const Ty = py + (px * px) / (R + dy) - r * oneMinusCosBeta * sinTheta;
  const Tz = r * oneMinusCosBeta * cosTheta;
  return [Tx, Ty, Tz];
}

function cylinderLocal(px: number, py: number, kappa: number): Vec3Tuple {
  const k = Number.isFinite(kappa) ? Math.max(0, kappa) : 0;
  const phi = k * px;
  let Tx: number;
  let Tz: number;

  if (k > CYL_KAPPA_EPS) {
    const sinHalfPhi = Math.sin(0.5 * phi);
    Tx = Math.sin(phi) / k;
    Tz = (2 * sinHalfPhi * sinHalfPhi) / k;
  } else {
    Tx = px * (1 - (phi * phi) / 6);
    Tz = 0.5 * px * phi;
  }

  return [Tx, py, Tz];
}

/**
 * Pure CPU reference port of the Hong, Card & Chen (2004) isometric cone page-curl
 * model composed with binding-axis Y-rotation (`R_y(-rho)`).
 */
export function deformVertexCone(
  px: number,
  py: number,
  theta: number,
  Ay: number,
  rho: number,
): Vec3Tuple {
  const [Tx, Ty, Tz] = coneLocal(px, py, theta, Ay);
  return rotateYNegRho(Tx, Ty, Tz, rho);
}

/**
 * Vertically reflected Hong, Card & Chen cone curl for lifting from the upper outer corner.
 */
export function deformVertexTopCone(
  px: number,
  py: number,
  theta: number,
  Ay: number,
  rho: number,
  pageHeight = 1,
): Vec3Tuple {
  const [vx, vy, vz] = deformVertexCone(px, pageHeight - py, theta, Ay, rho);
  return [vx, pageHeight - vy, vz];
}

/**
 * Cancellation-safe isometric cylinder curl (Project Austin Part 2) composed with `R_y(-rho)`.
 */
export function deformVertexCylinder(
  px: number,
  py: number,
  kappa: number,
  rho: number,
): Vec3Tuple {
  const [Tx, Ty, Tz] = cylinderLocal(px, py, kappa);
  return rotateYNegRho(Tx, Ty, Tz, rho);
}

/**
 * Continuous directional curl blend between Y-reflected top cone (`-1`),
 * isometric cylinder (`0`), and bottom cone (`+1`).
 */
export function deformVertexCurl(
  px: number,
  py: number,
  theta: number,
  Ay: number,
  rho: number,
  kappa: number,
  conicContribution: number,
  pageHeight = 1,
): Vec3Tuple {
  const c = Number.isFinite(conicContribution) ? clamp(conicContribution, -1, 1) : 1;
  const cyl = deformVertexCylinder(px, py, kappa, rho);
  const cone =
    c < 0
      ? deformVertexTopCone(px, py, theta, Ay, rho, pageHeight)
      : deformVertexCone(px, py, theta, Ay, rho);
  const w = Math.abs(c);
  return [
    cyl[0] + (cone[0] - cyl[0]) * w,
    cyl[1] + (cone[1] - cyl[1]) * w,
    cyl[2] + (cone[2] - cyl[2]) * w,
  ];
}

/**
 * Top-hinge (`y = pageHeight`) Hong, Card & Chen cone curl lifting the lower-right corner.
 */
export function deformVertexTopHingeCone(
  px: number,
  py: number,
  theta: number,
  Ay: number,
  rho: number,
  pageWidth = PAGE_ASPECT,
  pageHeight = 1,
): Vec3Tuple {
  const [tx, ty, tz] = deformVertexCone(pageHeight - py, pageWidth - px, theta, Ay, rho);
  return [pageWidth - ty, pageHeight - tx, tz];
}

/**
 * Horizontally reflected top-hinge cone curl lifting the lower-left corner.
 */
export function deformVertexTopHingeLeftCone(
  px: number,
  py: number,
  theta: number,
  Ay: number,
  rho: number,
  pageWidth = PAGE_ASPECT,
  pageHeight = 1,
): Vec3Tuple {
  const [tx, ty, tz] = deformVertexTopCone(
    pageHeight - py,
    pageWidth - px,
    theta,
    Ay,
    rho,
    pageWidth,
  );
  return [pageWidth - ty, pageHeight - tx, tz];
}

/**
 * Top-hinge (`y = pageHeight`) isometric cylinder curl rolling the page upward/downward.
 */
export function deformVertexTopHingeCylinder(
  px: number,
  py: number,
  kappa: number,
  rho: number,
  pageWidth = PAGE_ASPECT,
  pageHeight = 1,
): Vec3Tuple {
  const [tx, ty, tz] = deformVertexCylinder(pageHeight - py, pageWidth - px, kappa, rho);
  return [pageWidth - ty, pageHeight - tx, tz];
}

/**
 * Continuous top-hinge curl blend between lower-left cone (`-1`), horizontal cylinder (`0`),
 * and lower-right cone (`+1`) for vertical page layout.
 */
export function deformVertexVerticalCurl(
  px: number,
  py: number,
  theta: number,
  Ay: number,
  rho: number,
  kappa: number,
  conicContribution: number,
  pageWidth = PAGE_ASPECT,
  pageHeight = 1,
): Vec3Tuple {
  const [tx, ty, tz] = deformVertexCurl(
    pageHeight - py,
    pageWidth - px,
    theta,
    Ay,
    rho,
    kappa,
    conicContribution,
    pageWidth,
  );
  return [pageWidth - ty, pageHeight - tx, tz];
}

const CREASE_SAMPLES = 24;
const SOLVE_ITERS = 20;

/**
 * Returns the maximum world-space X coordinate along a horizontal scanline (`py`)
 * of the cone-deformed page, representing the visible bending crease edge.
 */
export function maxConeCreaseX(
  theta: number,
  Ay: number,
  rho: number,
  pageWidth = PAGE_ASPECT,
  py = 0.5,
): number {
  let maxX = Number.NEGATIVE_INFINITY;
  for (let i = 0; i <= CREASE_SAMPLES; i += 1) {
    const px = (i / CREASE_SAMPLES) * pageWidth;
    const [vx] = deformVertexCone(px, py, theta, Ay, rho);
    if (vx > maxX) {
      maxX = vx;
    }
  }
  return maxX;
}

/**
 * Returns the maximum world-space X coordinate of the cylinder-deformed page,
 * representing the visible bending crease edge.
 */
export function maxCylCreaseX(kappa: number, rho: number, pageWidth = PAGE_ASPECT): number {
  if (rho >= HALF_PI) {
    return 0;
  }
  if (kappa <= CYL_KAPPA_EPS) {
    return pageWidth * Math.cos(rho);
  }
  if (kappa * pageWidth + rho <= HALF_PI) {
    return (Math.sin(kappa * pageWidth + rho) - Math.sin(rho)) / kappa;
  }
  return (1 - Math.sin(rho)) / kappa;
}

/**
 * Normalized world-space target crease position in `[0, 1]` over `[0, CREASE_SWEEP_END]`,
 * gently eased so perspective foreshortening keeps the turning edge near mid-page at `|p| = 0.5`.
 */
export function targetCreaseNorm(t: number): number {
  if (t <= 0) {
    return 1;
  }
  if (t >= CREASE_SWEEP_END) {
    return 0;
  }
  return 1 - Math.pow(t / CREASE_SWEEP_END, 1.18);
}

function rhoCurve(t: number): number {
  if (t <= 0) {
    return 0;
  }
  if (t >= 1) {
    return Math.PI;
  }
  if (t < CREASE_SWEEP_END) {
    const u = t / CREASE_SWEEP_END;
    const flatRho = Math.acos(clamp(targetCreaseNorm(t), 0, 1));
    return flatRho * (0.05 + 0.95 * Math.pow(u, 1.9));
  }
  const u = (t - CREASE_SWEEP_END) / (1 - CREASE_SWEEP_END);
  return HALF_PI + HALF_PI * (u * u * (3 - 2 * u));
}

function solveBaseConeParams(t: number, pageWidth: number, hingeSpan = 1): ConeParams {
  const Ay = -(0.35 + 0.15 * t + 14.5 * Math.pow(t, 8));
  const rho = rhoCurve(t);
  let theta = HALF_PI;

  if (t > 0 && t < CREASE_SWEEP_END) {
    const midSpan = hingeSpan * 0.5;
    const targetX = pageWidth * targetCreaseNorm(t);
    const maxAlpha = Math.asin(clamp(pageWidth / Math.hypot(pageWidth, -Ay), -1, 1));
    const minSafeTheta = Math.max(
      THETA_MIN + 1e-4,
      Math.asin(Math.min(1, maxAlpha / (0.88 * Math.PI))),
    );
    if (maxConeCreaseX(HALF_PI, Ay, rho, pageWidth, midSpan) <= targetX) {
      theta = HALF_PI;
    } else if (maxConeCreaseX(minSafeTheta, Ay, rho, pageWidth, midSpan) >= targetX) {
      theta = minSafeTheta;
    } else {
      let lo = minSafeTheta;
      let hi = HALF_PI;
      for (let it = 0; it < SOLVE_ITERS; it += 1) {
        const mid = 0.5 * (lo + hi);
        if (maxConeCreaseX(mid, Ay, rho, pageWidth, midSpan) < targetX) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      theta = 0.5 * (lo + hi);
    }
  }

  return { theta, Ay, rho };
}

function applyCornerBend(
  base: ConeParams,
  t: number,
  pageWidth: number,
  cornerBend: number,
): ConeParams {
  const rawBend = Number.isFinite(cornerBend) ? clamp(cornerBend, 0, 1) : 0;
  const bend = rawBend * (1 - smoothstep(0.85, 1, t));
  if (bend <= 0 || t === 0 || t === 1) {
    return base;
  }

  const Ay = Math.min(-0.04, base.Ay * Math.pow(0.28, bend));
  const maxAlpha = Math.asin(clamp(pageWidth / Math.hypot(pageWidth, -Ay), -1, 1));
  const safeMinTheta = Math.max(
    THETA_MIN + 1e-4,
    Math.asin(Math.min(1, maxAlpha / (0.94 * Math.PI))),
  );
  const theta = clamp(
    base.theta - 0.16 * bend * (1 - smoothstep(0.75, 1, t)),
    safeMinTheta,
    HALF_PI,
  );
  return { theta, Ay, rho: base.rho };
}

/**
 * Maps normalized CSS `--progress` `p in [-1, 1]` to three-stage empirical cone
 * parameters `(theta, Ay, rho)` calibrated so the visible crease sweeps proportionally
 * across `[pageWidth, 0]` over `|p| in [0, CREASE_SWEEP_END]` while keeping deep
 * paper curl early, with optional `cornerBend in [0, 1]` tightening the grabbed corner.
 */
export function coneParams(
  p: number,
  pageWidth = PAGE_ASPECT,
  cornerBend = 0,
  hingeSpan = 1,
): ConeParams {
  const t = Number.isFinite(p) ? clamp(Math.abs(p), 0, 1) : 0;
  const safeWidth = Number.isFinite(pageWidth) && pageWidth > 0 ? pageWidth : PAGE_ASPECT;
  const safeHingeSpan = Number.isFinite(hingeSpan) && hingeSpan > 0 ? hingeSpan : 1;
  return applyCornerBend(
    solveBaseConeParams(t, safeWidth, safeHingeSpan),
    t,
    safeWidth,
    cornerBend,
  );
}

/**
 * Maps normalized CSS `--progress` `p in [-1, 1]` to cylinder curvature `kappa >= 0`
 * aligned with the calibrated crease trajectory.
 */
export function cylKappa(p: number, pageWidth = PAGE_ASPECT, hingeSpan = 1): number {
  const t = Number.isFinite(p) ? clamp(Math.abs(p), 0, 1) : 0;
  if (t === 0 || t >= CREASE_SWEEP_END) {
    return 0;
  }
  const safeWidth = Number.isFinite(pageWidth) && pageWidth > 0 ? pageWidth : PAGE_ASPECT;
  const safeHingeSpan = Number.isFinite(hingeSpan) && hingeSpan > 0 ? hingeSpan : 1;
  const { theta, Ay, rho } = coneParams(t, safeWidth, 0, safeHingeSpan);
  const targetX = maxConeCreaseX(theta, Ay, rho, safeWidth, safeHingeSpan * 0.5);
  const flatX = safeWidth * Math.cos(rho);
  if (targetX >= flatX - 1e-5) {
    return 0;
  }
  let lo = 0;
  let hi = CYL_KAPPA_MAX;
  for (let it = 0; it < SOLVE_ITERS; it += 1) {
    const mid = 0.5 * (lo + hi);
    if (maxCylCreaseX(mid, rho, safeWidth) > targetX) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return 0.5 * (lo + hi);
}

/**
 * Maps a pointer gesture's vertical start coordinate inside a page rect to
 * `conicContribution in [-1, 1]` (`-1` top edge, `0` center, `+1` bottom edge).
 */
export function pointerYToConicContribution(
  clientY: number,
  rectTop: number,
  rectHeight: number,
): number {
  if (
    !Number.isFinite(clientY) ||
    !Number.isFinite(rectTop) ||
    !Number.isFinite(rectHeight) ||
    rectHeight <= 0
  ) {
    return 1;
  }
  const yNorm = clamp((clientY - rectTop) / rectHeight, 0, 1);
  return 2 * yNorm - 1;
}

/**
 * Maps a pointer gesture's horizontal start coordinate inside a page rect to
 * `conicContribution in [-1, 1]` (`-1` left edge, `0` center, `+1` right edge)
 * for vertical top-hinge curl.
 */
export function pointerXToConicContribution(
  clientX: number,
  rectLeft: number,
  rectWidth: number,
): number {
  if (
    !Number.isFinite(clientX) ||
    !Number.isFinite(rectLeft) ||
    !Number.isFinite(rectWidth) ||
    rectWidth <= 0
  ) {
    return 1;
  }
  const xNorm = clamp((clientX - rectLeft) / rectWidth, 0, 1);
  return 2 * xNorm - 1;
}

const VERTICAL_SOLVE_ITERS = 18;

function evalCurlYAtControl(
  px: number,
  py: number,
  t: number,
  base: ConeParams,
  v: number,
  pageWidth: number,
  pageHeight: number,
): number {
  const c = clamp(v, -1, 1);
  const bend = clamp(Math.abs(v) - 1, 0, 1);
  const { theta, Ay } = applyCornerBend(base, t, pageWidth, bend);
  const coneY =
    c < 0
      ? pageHeight - coneLocal(px, pageHeight - py, theta, Ay)[1]
      : coneLocal(px, py, theta, Ay)[1];
  return py + (coneY - py) * Math.abs(c);
}

/**
 * Solves `(conicContribution, cornerBend)` so a grabbed page-local point `(grabX, grabY)`
 * tracks transverse pointer displacement `deltaYUp` monotonically as closely as the
 * cone and cylinder models allow, saturating at the cone's geometric bending limit.
 */
export function solveVerticalCurlControl(
  p: number,
  grabX: number,
  grabY: number,
  deltaYUp: number,
  pageWidth = PAGE_ASPECT,
  pageHeight = 1,
): VerticalCurlControl {
  const t = Number.isFinite(p) ? clamp(Math.abs(p), 0, 1) : 0;
  const safeWidth = Number.isFinite(pageWidth) && pageWidth > 0 ? pageWidth : PAGE_ASPECT;
  const safeHeight = Number.isFinite(pageHeight) && pageHeight > 0 ? pageHeight : 1;
  const safeGrabY = Number.isFinite(grabY) ? clamp(grabY, 0, safeHeight) : 0;
  const safeDeltaY = Number.isFinite(deltaYUp) ? deltaYUp : 0;
  const pxRef = Math.max(
    Number.isFinite(grabX) ? clamp(grabX, 0, safeWidth) : safeWidth,
    0.25 * safeWidth,
  );
  const vStart = 1 - 2 * (safeGrabY / safeHeight);
  const base = solveBaseConeParams(t, safeWidth, safeHeight);
  const resistanceScale = VERTICAL_RESISTANCE_SCALE * safeHeight;

  const yMin = evalCurlYAtControl(
    pxRef,
    safeGrabY,
    t,
    base,
    -MAX_VERTICAL_CURL_CONTROL,
    safeWidth,
    safeHeight,
  );
  const yMax = evalCurlYAtControl(
    pxRef,
    safeGrabY,
    t,
    base,
    MAX_VERTICAL_CURL_CONTROL,
    safeWidth,
    safeHeight,
  );

  let v: number;
  if (Math.abs(safeDeltaY) <= 1e-9) {
    v = vStart;
  } else if (yMax - yMin <= 1e-4) {
    const vSpan =
      safeDeltaY >= 0 ? MAX_VERTICAL_CURL_CONTROL - vStart : vStart + MAX_VERTICAL_CURL_CONTROL;
    v = clamp(
      vStart + Math.sign(safeDeltaY) * vSpan * Math.tanh(Math.abs(safeDeltaY) / resistanceScale),
      -MAX_VERTICAL_CURL_CONTROL,
      MAX_VERTICAL_CURL_CONTROL,
    );
  } else {
    const yBase = evalCurlYAtControl(pxRef, safeGrabY, t, base, vStart, safeWidth, safeHeight);
    const span = safeDeltaY >= 0 ? yMax - yBase : yBase - yMin;
    const effDeltaY =
      span > 1e-6
        ? Math.sign(safeDeltaY) * span * Math.tanh(Math.abs(safeDeltaY) / resistanceScale)
        : 0;
    const yTarget = yBase + effDeltaY;
    if (yTarget <= yMin) {
      v = -MAX_VERTICAL_CURL_CONTROL;
    } else if (yTarget >= yMax) {
      v = MAX_VERTICAL_CURL_CONTROL;
    } else {
      let lo = -MAX_VERTICAL_CURL_CONTROL;
      let hi = MAX_VERTICAL_CURL_CONTROL;
      for (let it = 0; it < VERTICAL_SOLVE_ITERS; it += 1) {
        const mid = 0.5 * (lo + hi);
        if (evalCurlYAtControl(pxRef, safeGrabY, t, base, mid, safeWidth, safeHeight) < yTarget) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      v = 0.5 * (lo + hi);
    }
  }

  return {
    conicContribution: clamp(v, -1, 1),
    cornerBend: clamp(Math.abs(v) - 1, 0, 1),
  };
}

/**
 * Smooth end-of-turn opacity fade for single-page Curl mode as `|p| -> 1`.
 */
export function turnOpacity(p: number): number {
  const t = Number.isFinite(p) ? clamp(Math.abs(p), 0, 1) : 0;
  if (t <= 0.85) {
    return 1;
  }
  return 1 - smoothstep(0.85, 1, t);
}
