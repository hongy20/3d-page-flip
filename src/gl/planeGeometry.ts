export const PAGE_ASPECT = 2115 / 2990;
export const DEFAULT_SEGMENTS = 64;

export interface PlaneMesh {
  readonly vao: WebGLVertexArrayObject;
  readonly indexCount: number;
  readonly width: number;
  readonly height: number;
  dispose(): void;
}

/**
 * Builds a tessellated XY-plane with binding along the Y-axis at `x = 0` (`x in [0, width]`).
 */
export function createPlaneMesh(
  gl: WebGL2RenderingContext,
  width = PAGE_ASPECT,
  height = 1,
  segmentsX = DEFAULT_SEGMENTS,
  segmentsY = DEFAULT_SEGMENTS,
): PlaneMesh {
  const cols = segmentsX + 1;
  const rows = segmentsY + 1;
  const vertices = new Float32Array(cols * rows * 4);

  let vOffset = 0;
  for (let iy = 0; iy < rows; iy += 1) {
    const v = iy / segmentsY;
    const y = v * height;
    for (let ix = 0; ix < cols; ix += 1) {
      const u = ix / segmentsX;
      const x = u * width;
      vertices[vOffset++] = x;
      vertices[vOffset++] = y;
      vertices[vOffset++] = u;
      vertices[vOffset++] = v;
    }
  }

  const indexCount = segmentsX * segmentsY * 6;
  const indices = new Uint16Array(indexCount);
  let iOffset = 0;
  for (let iy = 0; iy < segmentsY; iy += 1) {
    for (let ix = 0; ix < segmentsX; ix += 1) {
      const i00 = iy * cols + ix;
      const i10 = i00 + 1;
      const i01 = i00 + cols;
      const i11 = i01 + 1;
      indices[iOffset++] = i00;
      indices[iOffset++] = i10;
      indices[iOffset++] = i11;
      indices[iOffset++] = i00;
      indices[iOffset++] = i11;
      indices[iOffset++] = i01;
    }
  }

  const vao = gl.createVertexArray();
  const vbo = gl.createBuffer();
  const ibo = gl.createBuffer();
  if (!vao || !vbo || !ibo) {
    throw new Error('Failed to allocate WebGL2 plane buffers');
  }

  gl.bindVertexArray(vao);

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.bindVertexArray(null);

  return {
    vao,
    indexCount,
    width,
    height,
    dispose() {
      gl.deleteVertexArray(vao);
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
    },
  };
}
