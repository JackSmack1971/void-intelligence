import { describe, it, expect } from 'vitest';
import * as stability from './stability';

describe('Stability Engine [Defensive Hardening]', () => {
  describe('computeKSStatistic', () => {
    it('should return 1.0 for mismatched lengths [BEH-2]', () => {
      expect(stability.computeKSStatistic([0.5, 0.5], [1.0])).toBe(1.0);
    });

    it('should handle unnormalized inputs by normalizing them [BEH-1]', () => {
      // [10, 10] -> [0.5, 0.5]
      // [0, 20] -> [0, 1.0]
      // CDF1: 0.5, 1.0
      // CDF2: 0, 1.0
      // MaxDiff: 0.5
      expect(stability.computeKSStatistic([10, 10], [0, 20])).toBeCloseTo(0.5);
    });

    it('should return 0 for empty arrays [BEH-2]', () => {
      expect(stability.computeKSStatistic([], [])).toBe(0);
    });
  });

  describe('calculateShannonEntropy', () => {
    it('should normalize inputs [BEH-1]', () => {
      // [1, 1] -> [0.5, 0.5] -> Entropy 1.0
      expect(stability.calculateShannonEntropy([1, 1])).toBeCloseTo(1.0);
    });

    it('should handle zero probabilities correctly', () => {
      expect(stability.calculateShannonEntropy([1, 0, 0])).toBe(0);
    });
  });

  describe('computeEntropyReduction', () => {
    it('should handle near-zero hPrev safely [BEH-3]', () => {
      // If hPrev is very small (near 0), it should return 0 rather than Infinity or NaN
      expect(stability.computeEntropyReduction([1.0], [0.5, 0.5])).toBe(0);
    });
  });

  describe('evaluateStability', () => {
    it('should return true when metrics are below thresholds', () => {
      expect(stability.evaluateStability(0.04, 0.0009)).toBe(true);
    });

    it('should return false when KS is above threshold', () => {
      expect(stability.evaluateStability(0.06, 0.0009)).toBe(false);
    });

    it('should return false when entropy reduction is above threshold', () => {
      expect(stability.evaluateStability(0.04, 0.002)).toBe(false);
    });
  });
});
