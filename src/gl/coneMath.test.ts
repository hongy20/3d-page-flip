import { describe, expect, it } from 'vitest';
import {
  AY_END,
  AY_START,
  HALF_PI,
  THETA_MIN,
  coneParams,
  deformVertexCone,
  turnOpacity,
} from './coneMath';
import { PAGE_ASPECT } from './planeGeometry';

function sampleGrid(steps = 12): Array<readonly [number, number]> {
  const points: Array<readonly [number, number]> = [];
  for (let iy = 0; iy <= steps; iy += 1) {
    const py = iy / steps;
    for (let ix = 0; ix <= steps; ix += 1) {
      const px = (ix / steps) * PAGE_ASPECT;
      points.push([px, py]);
    }
  }
  return points;
}

describe('deformVertexCone', () => {
  const grid = sampleGrid(12);

  it('preserves exact isometric distance |V - A| = R across (theta, Ay, rho) sweeps', () => {
    const thetas = [0.3, 0.7, 1.1, HALF_PI];
    const ays = [AY_START, -1.5, AY_END, -100, -1000];
    const rhos = [0, 0.5, HALF_PI, 2.4, Math.PI];

    for (const theta of thetas) {
      for (const Ay of ays) {
        for (const rho of rhos) {
          for (const [px, py] of grid) {
            const [vx, vy, vz] = deformVertexCone(px, py, theta, Ay, rho);
            expect(Number.isFinite(vx)).toBe(true);
            expect(Number.isFinite(vy)).toBe(true);
            expect(Number.isFinite(vz)).toBe(true);

            const expectedR = Math.hypot(px, py - Ay);
            const actualR = Math.hypot(vx, vy - Ay, vz);
            expect(actualR).toBeCloseTo(expectedR, 11);
          }
        }
      }
    }
  });

  it('matches flat identity at (theta = pi/2, rho = 0) and left-side flat at (theta = pi/2, rho = pi)', () => {
    for (const Ay of [AY_START, -2.0, AY_END]) {
      for (const [px, py] of grid) {
        const [rx, ry, rz] = deformVertexCone(px, py, HALF_PI, Ay, 0);
        expect(rx).toBeCloseTo(px, 12);
        expect(ry).toBeCloseTo(py, 12);
        expect(rz).toBeCloseTo(0, 12);

        const [lx, ly, lz] = deformVertexCone(px, py, HALF_PI, Ay, Math.PI);
        expect(lx).toBeCloseTo(-px, 12);
        expect(ly).toBeCloseTo(py, 12);
        expect(lz).toBeCloseTo(0, 12);
      }
    }
  });
});

describe('coneParams', () => {
  const grid = sampleGrid(10);

  it('returns flat resting identity at p = 0', () => {
    const params = coneParams(0);
    expect(params.theta).toBe(HALF_PI);
    expect(params.rho).toBe(0);
    expect(params.Ay).toBe(AY_START);
    expect(params.Ay).toBeLessThan(0);
  });

  it('enforces domain invariants, finite vertices, and beta < pi across [-1, 1] and edge inputs', () => {
    const samples: number[] = [];
    for (let i = -50; i <= 50; i += 1) {
      samples.push(i / 50);
    }
    samples.push(-2, 2, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);

    for (const p of samples) {
      const { theta, Ay, rho } = coneParams(p);
      expect(Ay).toBeLessThan(0);
      expect(theta).toBeGreaterThan(THETA_MIN);
      expect(theta).toBeLessThanOrEqual(HALF_PI);
      expect(rho).toBeGreaterThanOrEqual(0);
      expect(rho).toBeLessThanOrEqual(Math.PI);

      const sinTheta = Math.sin(theta);
      for (const [px, py] of grid) {
        const R = Math.hypot(px, py - Ay);
        const alpha = Math.asin(Math.min(1, Math.max(-1, px / R)));
        const beta = alpha / sinTheta;
        expect(beta).toBeLessThan(Math.PI);

        const [vx, vy, vz] = deformVertexCone(px, py, theta, Ay, rho);
        expect(Number.isFinite(vx)).toBe(true);
        expect(Number.isFinite(vy)).toBe(true);
        expect(Number.isFinite(vz)).toBe(true);
      }
    }
  });

  it('follows the three-stage lift, curl, and uncurl trajectory symmetrically', () => {
    let prevAy = Number.POSITIVE_INFINITY;
    let prevRho = -1;
    let minTheta = HALF_PI;

    for (let i = 0; i <= 100; i += 1) {
      const p = i / 100;
      const pos = coneParams(p);
      const neg = coneParams(-p);

      expect(neg.theta).toBeCloseTo(pos.theta, 12);
      expect(neg.Ay).toBeCloseTo(pos.Ay, 12);
      expect(neg.rho).toBeCloseTo(pos.rho, 12);

      expect(pos.Ay).toBeLessThanOrEqual(prevAy);
      expect(pos.rho).toBeGreaterThanOrEqual(prevRho);
      prevAy = pos.Ay;
      prevRho = pos.rho;
      if (pos.theta < minTheta) {
        minTheta = pos.theta;
      }
    }

    expect(minTheta).toBeLessThan(HALF_PI - 0.5);
    const mid = coneParams(0.4);
    expect(mid.theta).toBeLessThan(HALF_PI);
    expect(mid.Ay).toBeLessThan(AY_START);

    const end = coneParams(1);
    expect(end.theta).toBeCloseTo(HALF_PI, 12);
    expect(end.rho).toBeCloseTo(Math.PI, 12);
    expect(end.Ay).toBeCloseTo(AY_END, 12);
  });
});

describe('turnOpacity', () => {
  it('stays 1 until 0.85 and fades monotonically to 0 at 1', () => {
    expect(turnOpacity(0)).toBe(1);
    expect(turnOpacity(0.5)).toBe(1);
    expect(turnOpacity(0.85)).toBe(1);
    expect(turnOpacity(0.925)).toBeGreaterThan(0);
    expect(turnOpacity(0.925)).toBeLessThan(1);
    expect(turnOpacity(1)).toBe(0);
    expect(turnOpacity(-1)).toBe(0);
  });
});
