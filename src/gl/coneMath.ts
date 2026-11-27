export const HALF_PI = Math.PI / 2;
export const THETA_MIN = 0.25;
export const AY_START = -0.35;
export const AY_END = -15.0;

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

  const cosRho = Math.cos(rho);
  const sinRho = Math.sin(rho);
  const Vx = Tx * cosRho - Tz * sinRho;
  const Vy = Ty;
  const Vz = Tx * sinRho + Tz * cosRho;

  return [Vx, Vy, Vz];
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
 * Smooth end-of-turn opacity fade for single-page Curl mode as `|p| -> 1`.
 */
export function turnOpacity(p: number): number {
  const t = Number.isFinite(p) ? clamp(Math.abs(p), 0, 1) : 0;
  if (t <= 0.85) {
    return 1;
  }
  return 1 - smoothstep(0.85, 1, t);
}
