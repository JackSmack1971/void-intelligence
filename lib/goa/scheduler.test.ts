import { describe, it, expect } from 'vitest';
import { DebateScheduler } from './scheduler';

describe('DebateScheduler', () => {
  it('should compute waves correctly for a simple chain', () => {
    const agents = ['A', 'B', 'C'];
    const matrix = {
      'A': { 'B': 1 },
      'B': { 'C': 1 },
      'C': {}
    };
    // B depends on A, C depends on B.
    // Waves should be: [A], [B], [C]
    const waves = DebateScheduler.computeWaves(agents, matrix as any);
    expect(waves).toEqual([['A'], ['B'], ['C']]);
  });

  it('should compute waves correctly for parallel experts', () => {
    const agents = ['A', 'B', 'C'];
    const matrix = {
      'A': { 'C': 1 },
      'B': { 'C': 1 },
      'C': {}
    };
    // C depends on A and B. A and B are independent.
    // Waves should be: [A, B], [C]
    const waves = DebateScheduler.computeWaves(agents, matrix as any);
    expect(waves).toHaveLength(2);
    expect(waves[0]).toContain('A');
    expect(waves[0]).toContain('B');
    expect(waves[1]).toEqual(['C']);
  });

  it('should handle cycles by putting leftovers in a final wave', () => {
    const agents = ['A', 'B'];
    const matrix = {
      'A': { 'B': 1 },
      'B': { 'A': 1 }
    };
    // Cycle: A depends on B, B depends on A.
    // Kahn's will stop immediately.
    const waves = DebateScheduler.computeWaves(agents, matrix as any);
    expect(waves).toHaveLength(1);
    expect(waves[0]).toContain('A');
    expect(waves[0]).toContain('B');
  });
});
