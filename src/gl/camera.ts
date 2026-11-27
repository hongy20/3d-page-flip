export const DEFAULT_FOV_Y = (35 * Math.PI) / 180;

/**
 * Column-major `Perspective * Translate(0, 0, -f)` matrix so any `z = 0` point
 * maps directly to `NDC = (x / aspect, y)`.
 */
export function createPerspectiveViewMatrix(
  viewportWidth: number,
  viewportHeight: number,
  fovY = DEFAULT_FOV_Y,
  near = 0.1,
  far = 20.0,
): Float32Array {
  const aspect = viewportWidth / viewportHeight;
  const f = 1 / Math.tan(fovY / 2);
  const camZ = f;
  const p10 = (far + near) / (near - far);
  const p14 = (2 * far * near) / (near - far);

  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = p10;
  out[11] = -1;
  out[14] = -camZ * p10 + p14;
  out[15] = camZ;
  return out;
}

/**
 * Column-major model matrix placing `[0, meshWidth] x [0, meshHeight]` at `z = 0`
 * to match `pageRect` inside `canvasRect` pixel-for-pixel.
 */
export function createPageModelMatrix(
  pageRect: DOMRect,
  canvasRect: DOMRect,
  meshWidth: number,
  meshHeight: number,
): Float32Array {
  const vw = canvasRect.width;
  const vh = canvasRect.height;
  const aspect = vw / vh;
  const left = pageRect.left - canvasRect.left;
  const top = pageRect.top - canvasRect.top;

  const ndcLeft = (left / vw) * 2 - 1;
  const ndcBottom = 1 - ((top + pageRect.height) / vh) * 2;

  const tx = ndcLeft * aspect;
  const ty = ndcBottom;
  const sx = (2 * pageRect.width) / (vh * meshWidth);
  const sy = (2 * pageRect.height) / (vh * meshHeight);
  const sz = sy;

  const out = new Float32Array(16);
  out[0] = sx;
  out[5] = sy;
  out[10] = sz;
  out[12] = tx;
  out[13] = ty;
  out[15] = 1;
  return out;
}

/** Multiplies two column-major 4x4 matrices (`a * b`). */
export function multiplyMat4(
  a: Float32Array,
  b: Float32Array,
  out = new Float32Array(16),
): Float32Array {
  for (let col = 0; col < 4; col += 1) {
    const b0 = b[col * 4];
    const b1 = b[col * 4 + 1];
    const b2 = b[col * 4 + 2];
    const b3 = b[col * 4 + 3];
    for (let row = 0; row < 4; row += 1) {
      out[col * 4 + row] =
        a[row] * b0 + a[4 + row] * b1 + a[8 + row] * b2 + a[12 + row] * b3;
    }
  }
  return out;
}
