import { describe, it, expect, vi } from "vitest";
import { computeKSStatistic, calculateShannonEntropy, computeEntropyReduction } from "./stability";

describe("GoA Stability Engine", () => {
  it("computes KS statistic between two identical distributions correctly", () => {
    const dist1 = [0.1, 0.2, 0.7];
    const dist2 = [0.1, 0.2, 0.7];
    const ks = computeKSStatistic(dist1, dist2);
    expect(ks).toBe(0);
  });

  it("computes KS statistic between maximally different distributions", () => {
    const dist1 = [1.0, 0.0, 0.0];
    const dist2 = [0.0, 0.0, 1.0];
    const ks = computeKSStatistic(dist1, dist2);
    expect(ks).toBe(1.0);
  });

  it("calculates Shannon entropy correctly", () => {
    // Uniform distribution: log2(3) approx 1.58
    const dist = [1/3, 1/3, 1/3];
    const h = calculateShannonEntropy(dist);
    expect(h).toBeCloseTo(1.585, 3);

    // Deterministic distribution: 0 entropy
    expect(calculateShannonEntropy([1, 0, 0])).toBe(0);
  });

  it("computes entropy reduction between rounds", () => {
    const prev = [0.33, 0.33, 0.34];
    const current = [0.1, 0.1, 0.8];
    const reduction = computeEntropyReduction(prev, current);
    expect(reduction).toBeGreaterThan(0);
    expect(reduction).toBeLessThan(1.0);
  });
});
