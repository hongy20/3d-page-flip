export const HALF_PI = Math.PI / 2;
export const THETA_MIN = 0.25;
export const AY_START = -0.35;
export const AY_END = -15.0;
export const CYL_KAPPA_MAX = 2.0;
export const CYL_KAPPA_EPS = 1e-4;

export interface ConeParams {
  readonly theta: number;
  readonly Ay: number;
  readonly rho: number;
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
 * Maps normalized CSS `--progress` `p in [-1, 1]` to three-stage empirical cone
 * parameters `(theta, Ay, rho)`.
 */
export function coneParams(p: number): ConeParams {
  const t = Number.isFinite(p) ? clamp(Math.abs(p), 0, 1) : 0;
  const s = t * t * (3 - 2 * t);

  const rho = clamp(Math.PI * (0.2 * t + 0.8 * s), 0, Math.PI);
  const Ay = -(0.35 + 0.65 * t + 14.0 * t * t * t * t);
  const curlWave = t === 0 || t === 1 ? 0 : Math.sin(Math.PI * Math.pow(t, 0.75));
  const theta = clamp(HALF_PI - 0.82 * curlWave, THETA_MIN + 1e-4, HALF_PI);

  return { theta, Ay, rho };
}

/**
 * Maps normalized CSS `--progress` `p in [-1, 1]` to cylinder curvature `kappa >= 0`.
 */
export function cylKappa(p: number): number {
  const t = Number.isFinite(p) ? clamp(Math.abs(p), 0, 1) : 0;
  if (t === 0 || t === 1) {
    return 0;
  }
  return CYL_KAPPA_MAX * Math.sin(Math.PI * Math.pow(t, 0.75));
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
 * Smooth end-of-turn opacity fade for single-page Curl mode as `|p| -> 1`.
 */
export function turnOpacity(p: number): number {
  const t = Number.isFinite(p) ? clamp(Math.abs(p), 0, 1) : 0;
  if (t <= 0.85) {
    return 1;
  }
  return 1 - smoothstep(0.85, 1, t);
}
