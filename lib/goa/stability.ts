/**
 * Stability Engine for Void Intelligence GoA
 * Implements Kolmogorov-Smirnov (KS) test and Entropy Reduction monitoring
 * for debate convergence detection.
 */

export interface StabilityMetrics {
  ksStatistic: number;
  entropyReduction: number;
  isStable: boolean;
}

/**
 * Normalizes an array of numbers to sum to 1.0, creating a probability distribution.
 * Returns a uniform distribution if the input is empty or sums to zero.
 */
export function normalizeDistribution(values: number[]): number[] {
  if (values.length === 0) return [];
  const sum = values.reduce((acc, v) => acc + Math.max(0, v), 0);
  if (sum === 0) return values.map(() => 1 / values.length);
  return values.map(v => Math.max(0, v) / sum);
}

/**
 * Computes the Kolmogorov-Smirnov statistic between two discrete distributions.
 * The KS statistic is the maximum absolute difference between the CDFs.
 * Automatically normalizes inputs.
 */
export function computeKSStatistic(dist1: number[], dist2: number[]): number {
  if (dist1.length !== dist2.length) return 1.0;
  if (dist1.length === 0) return 0;

  const n1 = normalizeDistribution(dist1);
  const n2 = normalizeDistribution(dist2);

  let cdf1 = 0;
  let cdf2 = 0;
  let maxDiff = 0;

  for (let i = 0; i < n1.length; i++) {
    cdf1 += n1[i];
    cdf2 += n2[i];
    maxDiff = Math.max(maxDiff, Math.abs(cdf1 - cdf2));
  }

  return maxDiff;
}

/**
 * Calculates Shannon Entropy of a probability distribution.
 * Automatically normalizes input.
 */
export function calculateShannonEntropy(probs: number[]): number {
  const normalized = normalizeDistribution(probs);
  return normalized.reduce((acc, p) => {
    if (p <= 0) return acc;
    return acc - p * Math.log2(p);
  }, 0);
}

/**
 * Computes Normalized Entropy Reduction between two rounds.
 * Uses a small epsilon to avoid division-by-zero/NaN.
 */
export function computeEntropyReduction(prevProbs: number[], currentProbs: number[]): number {
  const hPrev = calculateShannonEntropy(prevProbs);
  const hCurr = calculateShannonEntropy(currentProbs);
  
  const EPSILON = 1e-12;
  if (hPrev < EPSILON) return 0;
  return Math.max(0, (hPrev - hCurr) / hPrev);
}

/**
 * Evaluates if the debate has stabilized based on research-driven thresholds.
 * Thresholds: KS < 0.05 AND Entropy Reduction < 1e-3 (plateau detection)
 */
export function evaluateStability(
  ksStatistic: number,
  entropyReduction: number,
  thresholds = { ks: 0.05, entropy: 0.001 }
): boolean {
  return ksStatistic < thresholds.ks && entropyReduction < thresholds.entropy;
}
