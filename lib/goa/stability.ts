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
 * Computes the Kolmogorov-Smirnov statistic between two discrete distributions.
 * The KS statistic is the maximum absolute difference between the CDFs.
 */
export function computeKSStatistic(dist1: number[], dist2: number[]): number {
  if (dist1.length !== dist2.length) return 1.0;

  let cdf1 = 0;
  let cdf2 = 0;
  let maxDiff = 0;

  for (let i = 0; i < dist1.length; i++) {
    cdf1 += dist1[i];
    cdf2 += dist2[i];
    maxDiff = Math.max(maxDiff, Math.abs(cdf1 - cdf2));
  }

  return maxDiff;
}

/**
 * Calculates Shannon Entropy of a probability distribution.
 */
export function calculateShannonEntropy(probs: number[]): number {
  return probs.reduce((acc, p) => {
    if (p <= 0) return acc;
    return acc - p * Math.log2(p);
  }, 0);
}

/**
 * Computes Normalized Entropy Reduction between two rounds.
 */
export function computeEntropyReduction(prevProbs: number[], currentProbs: number[]): number {
  const hPrev = calculateShannonEntropy(prevProbs);
  const hCurr = calculateShannonEntropy(currentProbs);
  
  if (hPrev === 0) return 0;
  return (hPrev - hCurr) / hPrev;
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
