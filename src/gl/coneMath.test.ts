import { describe, expect, it } from "vitest";
import {
  AY_END,
  AY_START,
  CYL_KAPPA_EPS,
  CYL_KAPPA_MAX,
  HALF_PI,
  THETA_MIN,
  coneParams,
  cylKappa,
  deformVertexCone,
  deformVertexCurl,
  deformVertexCylinder,
  deformVertexTopCone,
  pointerYToConicContribution,
  turnOpacity,
} from "./coneMath";
import { PAGE_ASPECT } from "./planeGeometry";

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

describe("deformVertexCone", () => {
  const grid = sampleGrid(12);

  it("preserves exact isometric distance |V - A| = R across (theta, Ay, rho) sweeps", () => {
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

  it("matches flat identity at (theta = pi/2, rho = 0) and left-side flat at (theta = pi/2, rho = pi)", () => {
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

describe("coneParams", () => {
  const grid = sampleGrid(10);

  it("returns flat resting identity at p = 0", () => {
    const params = coneParams(0);
    expect(params.theta).toBe(HALF_PI);
    expect(params.rho).toBe(0);
    expect(params.Ay).toBe(AY_START);
    expect(params.Ay).toBeLessThan(0);
  });

  it("enforces domain invariants, finite vertices, and beta < pi across [-1, 1] and edge inputs", () => {
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

  it("follows the three-stage lift, curl, and uncurl trajectory symmetrically", () => {
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

describe("turnOpacity", () => {
  it("stays 1 until 0.85 and fades monotonically to 0 at 1", () => {
    expect(turnOpacity(0)).toBe(1);
    expect(turnOpacity(0.5)).toBe(1);
    expect(turnOpacity(0.85)).toBe(1);
    expect(turnOpacity(0.925)).toBeGreaterThan(0);
    expect(turnOpacity(0.925)).toBeLessThan(1);
    expect(turnOpacity(1)).toBe(0);
    expect(turnOpacity(-1)).toBe(0);
  });
});

describe("cylKappa", () => {
  it("returns 0 at rest, completion, and non-finite inputs, and peaks symmetrically mid-turn", () => {
    expect(cylKappa(0)).toBe(0);
    expect(cylKappa(1)).toBe(0);
    expect(cylKappa(-1)).toBe(0);
    expect(cylKappa(2)).toBe(0);
    expect(cylKappa(-2)).toBe(0);
    expect(cylKappa(Number.NaN)).toBe(0);
    expect(cylKappa(Number.POSITIVE_INFINITY)).toBe(0);
    expect(cylKappa(Number.NEGATIVE_INFINITY)).toBe(0);

    let maxKappa = 0;
    for (let i = 1; i < 100; i += 1) {
      const p = i / 100;
      const kPos = cylKappa(p);
      const kNeg = cylKappa(-p);
      expect(kNeg).toBeCloseTo(kPos, 12);
      expect(kPos).toBeGreaterThan(0);
      if (kPos > maxKappa) {
        maxKappa = kPos;
      }
    }

    expect(maxKappa).toBeCloseTo(CYL_KAPPA_MAX, 2);
    expect(maxKappa * PAGE_ASPECT).toBeLessThanOrEqual(2.2);
    expect(maxKappa * PAGE_ASPECT).toBeLessThan(Math.PI);
  });
});

describe("deformVertexTopCone", () => {
  const grid = sampleGrid(12);

  it("preserves exact isometric distance |V - A_top| = |P - A_top| across (theta, Ay, rho) sweeps", () => {
    const thetas = [0.3, 0.7, 1.1, HALF_PI];
    const ays = [AY_START, -1.5, AY_END, -100];
    const rhos = [0, 0.5, HALF_PI, 2.4, Math.PI];

    for (const theta of thetas) {
      for (const Ay of ays) {
        const apexY = 1 - Ay;
        for (const rho of rhos) {
          for (const [px, py] of grid) {
            const [vx, vy, vz] = deformVertexTopCone(px, py, theta, Ay, rho);
            expect(Number.isFinite(vx)).toBe(true);
            expect(Number.isFinite(vy)).toBe(true);
            expect(Number.isFinite(vz)).toBe(true);

            const expectedR = Math.hypot(px, py - apexY);
            const actualR = Math.hypot(vx, vy - apexY, vz);
            expect(actualR).toBeCloseTo(expectedR, 11);
          }
        }
      }
    }
  });

  it("matches flat identity at (theta = pi/2, rho = 0) and lifts the top-right corner mid-turn", () => {
    for (const [px, py] of grid) {
      const [rx, ry, rz] = deformVertexTopCone(px, py, HALF_PI, AY_START, 0);
      expect(rx).toBeCloseTo(px, 12);
      expect(ry).toBeCloseTo(py, 12);
      expect(rz).toBeCloseTo(0, 12);

      const [lx, ly, lz] = deformVertexTopCone(px, py, HALF_PI, AY_START, Math.PI);
      expect(lx).toBeCloseTo(-px, 12);
      expect(ly).toBeCloseTo(py, 12);
      expect(lz).toBeCloseTo(0, 12);
    }

    const { theta, Ay, rho } = coneParams(0.35);
    const topCorner = deformVertexTopCone(PAGE_ASPECT, 1, theta, Ay, rho);
    const bottomCorner = deformVertexTopCone(PAGE_ASPECT, 0, theta, Ay, rho);
    expect(topCorner[2]).toBeGreaterThan(bottomCorner[2]);
  });
});

describe("deformVertexCylinder", () => {
  const grid = sampleGrid(12);

  it("produces finite vertices, flat identity, and smooth continuity across CYL_KAPPA_EPS", () => {
    const kappas = [0, 1e-6, CYL_KAPPA_EPS, CYL_KAPPA_EPS + 1e-6, 0.5, 1.5, CYL_KAPPA_MAX];
    const rhos = [0, 0.5, HALF_PI, 2.4, Math.PI];

    for (const kappa of kappas) {
      for (const rho of rhos) {
        for (const [px, py] of grid) {
          const [vx, vy, vz] = deformVertexCylinder(px, py, kappa, rho);
          expect(Number.isFinite(vx)).toBe(true);
          expect(Number.isFinite(vy)).toBe(true);
          expect(Number.isFinite(vz)).toBe(true);
          expect(vy).toBeCloseTo(py, 12);
        }
      }
    }

    for (const [px, py] of grid) {
      const [rx, ry, rz] = deformVertexCylinder(px, py, 0, 0);
      expect(rx).toBeCloseTo(px, 12);
      expect(ry).toBeCloseTo(py, 12);
      expect(rz).toBeCloseTo(0, 12);

      const [lx, ly, lz] = deformVertexCylinder(px, py, 0, Math.PI);
      expect(lx).toBeCloseTo(-px, 12);
      expect(ly).toBeCloseTo(py, 12);
      expect(lz).toBeCloseTo(0, 12);

      const below = deformVertexCylinder(px, py, CYL_KAPPA_EPS - 1e-8, 0.7);
      const above = deformVertexCylinder(px, py, CYL_KAPPA_EPS + 1e-8, 0.7);
      expect(above[0]).toBeCloseTo(below[0], 7);
      expect(above[1]).toBeCloseTo(below[1], 12);
      expect(above[2]).toBeCloseTo(below[2], 7);
    }
  });

  it("preserves exact cylinder radius and horizontal arc length (isometry)", () => {
    const kappas = [0.2, 0.9, 1.5, CYL_KAPPA_MAX];
    const rhos = [0, 0.4, HALF_PI, 2.5, Math.PI];

    for (const k of kappas) {
      const radius = 1 / k;
      for (const rho of rhos) {
        const cosRho = Math.cos(rho);
        const sinRho = Math.sin(rho);
        const cx = -sinRho * radius;
        const cz = cosRho * radius;

        for (const [px, py] of grid) {
          const [vx, vy, vz] = deformVertexCylinder(px, py, k, rho);
          const distToAxis = Math.hypot(vx - cx, vy - py, vz - cz);
          expect(distToAxis).toBeCloseTo(radius, 11);
        }
      }
    }

    const segments = 400;
    const py = 0.5;
    for (const k of [0, 0.5, CYL_KAPPA_MAX]) {
      for (const rho of [0, 1.1, Math.PI]) {
        let arcLength = 0;
        let prev = deformVertexCylinder(0, py, k, rho);
        for (let i = 1; i <= segments; i += 1) {
          const px = (i / segments) * PAGE_ASPECT;
          const next = deformVertexCylinder(px, py, k, rho);
          arcLength += Math.hypot(next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]);
          prev = next;
        }
        expect(arcLength).toBeCloseTo(PAGE_ASPECT, 4);
      }
    }
  });
});

describe("deformVertexCurl", () => {
  const grid = sampleGrid(10);

  it("returns flat identity at p = 0 across all conicContribution values", () => {
    const { theta, Ay, rho } = coneParams(0);
    const kappa = cylKappa(0);

    for (const c of [-1, -0.5, 0, 0.5, 1]) {
      for (const [px, py] of grid) {
        const [vx, vy, vz] = deformVertexCurl(px, py, theta, Ay, rho, kappa, c);
        expect(vx).toBeCloseTo(px, 12);
        expect(vy).toBeCloseTo(py, 12);
        expect(vz).toBeCloseTo(0, 12);
      }
    }
  });

  it("matches top-cone at -1, cylinder at 0, bottom-cone at +1, and blends smoothly", () => {
    const pSamples = [-1, -0.7, -0.35, 0, 0.35, 0.7, 1, -2, 2, Number.NaN];
    const conicSamples = [-1, -0.6, -1e-6, 0, 1e-6, 0.6, 1];

    for (const p of pSamples) {
      const { theta, Ay, rho } = coneParams(p);
      const kappa = cylKappa(p);

      for (const [px, py] of grid) {
        const top = deformVertexTopCone(px, py, theta, Ay, rho);
        const cyl = deformVertexCylinder(px, py, kappa, rho);
        const bot = deformVertexCone(px, py, theta, Ay, rho);

        const atNeg1 = deformVertexCurl(px, py, theta, Ay, rho, kappa, -1);
        const atZero = deformVertexCurl(px, py, theta, Ay, rho, kappa, 0);
        const atPos1 = deformVertexCurl(px, py, theta, Ay, rho, kappa, 1);

        expect(atNeg1[0]).toBeCloseTo(top[0], 12);
        expect(atNeg1[1]).toBeCloseTo(top[1], 12);
        expect(atNeg1[2]).toBeCloseTo(top[2], 12);

        expect(atZero[0]).toBeCloseTo(cyl[0], 12);
        expect(atZero[1]).toBeCloseTo(cyl[1], 12);
        expect(atZero[2]).toBeCloseTo(cyl[2], 12);

        expect(atPos1[0]).toBeCloseTo(bot[0], 12);
        expect(atPos1[1]).toBeCloseTo(bot[1], 12);
        expect(atPos1[2]).toBeCloseTo(bot[2], 12);

        for (const c of conicSamples) {
          const [vx, vy, vz] = deformVertexCurl(px, py, theta, Ay, rho, kappa, c);
          expect(Number.isFinite(vx)).toBe(true);
          expect(Number.isFinite(vy)).toBe(true);
          expect(Number.isFinite(vz)).toBe(true);
        }

        const nearNeg = deformVertexCurl(px, py, theta, Ay, rho, kappa, -1e-6);
        const nearPos = deformVertexCurl(px, py, theta, Ay, rho, kappa, 1e-6);
        expect(nearNeg[0]).toBeCloseTo(atZero[0], 5);
        expect(nearNeg[1]).toBeCloseTo(atZero[1], 5);
        expect(nearNeg[2]).toBeCloseTo(atZero[2], 5);
        expect(nearPos[0]).toBeCloseTo(atZero[0], 5);
        expect(nearPos[1]).toBeCloseTo(atZero[1], 5);
        expect(nearPos[2]).toBeCloseTo(atZero[2], 5);
      }
    }
  });
});

describe("pointerYToConicContribution", () => {
  it("maps vertical pointer coordinates continuously to [-1, 1] with safe fallback", () => {
    expect(pointerYToConicContribution(100, 100, 400)).toBe(-1);
    expect(pointerYToConicContribution(200, 100, 400)).toBe(-0.5);
    expect(pointerYToConicContribution(300, 100, 400)).toBe(0);
    expect(pointerYToConicContribution(400, 100, 400)).toBe(0.5);
    expect(pointerYToConicContribution(500, 100, 400)).toBe(1);

    expect(pointerYToConicContribution(50, 100, 400)).toBe(-1);
    expect(pointerYToConicContribution(600, 100, 400)).toBe(1);

    expect(pointerYToConicContribution(200, 100, 0)).toBe(1);
    expect(pointerYToConicContribution(200, 100, -10)).toBe(1);
    expect(pointerYToConicContribution(Number.NaN, 100, 400)).toBe(1);
  });
});
