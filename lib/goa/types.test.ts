import { describe, it, expect } from 'vitest';
import { GoAResult, KnowledgeTriplet } from './types';

describe('GoA Types Integrity [RED]', () => {
  it('should have KnowledgeTriplet defined [BEH-4]', () => {
    const triplet: KnowledgeTriplet = {
      subject: 'A',
      predicate: 'is',
      object: 'B'
    };
    expect(triplet.subject).toBe('A');
  });

  it('should enforce strict complexity typing in GoAResult [BEH-3]', () => {
    const result: Partial<GoAResult> = {
      complexity: 'high' // This should be fine
    };
    // @ts-expect-error - "invalid" is not a valid complexity
    result.complexity = 'invalid';
    expect(result.complexity).toBeDefined();
  });

  it('should have merged metrics schema [BEH-1]', () => {
    const result: Partial<GoAResult> = {
      metrics: {
        ksStatistic: 0.1,
        entropyReduction: 0.2,
        isStable: true,
        iterations: 3
      }
    };
    expect(result.metrics?.ksStatistic).toBe(0.1);
  });
});
