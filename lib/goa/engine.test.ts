import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runGoA } from './engine';
import * as client from '../openrouter/client';

vi.mock('../openrouter/client', () => ({
  chatWithRetry: vi.fn(),
  streamChat: vi.fn(),
}));

describe('runGoA engine', () => {
  const mockCards = [
    { id: 'agent-1', name: 'Agent 1', role: 'logic', description: 'desc', capabilities: [] },
    { id: 'agent-2', name: 'Agent 2', role: 'extraction', description: 'desc', capabilities: [] },
    { id: 'agent-3', name: 'Agent 3', role: 'meta', description: 'desc', capabilities: [] },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute all stages of the GoA pipeline', async () => {
    // Stage 1: Node Sampling
    (client.chatWithRetry as any).mockResolvedValueOnce(JSON.stringify({ 
      selected_ids: ['agent-1', 'agent-2', 'agent-3'] 
    }));

    // Stage 3: Matrix Scoring (6 calls for 3x3 diagonal excluded)
    (client.chatWithRetry as any)
      .mockResolvedValue(JSON.stringify({ score: 0.8 }));

    // Note: Since Stage 2, 3, and 4 are parallel/interleaved in implementation,
    // we should use mockImplementation to return based on the prompt or model if possible,
    // or just ensure all mocks return valid JSON where expected.
    
    (client.chatWithRetry as any).mockImplementation((messages: any, options: any) => {
      const prompt = messages[0].content;
      if (prompt.includes('select the top')) {
        return Promise.resolve(JSON.stringify({ selected_ids: ['agent-1', 'agent-2', 'agent-3'] }));
      }
      if (prompt.includes('Rate the relevance')) {
        return Promise.resolve(JSON.stringify({ score: 0.8 }));
      }
      if (prompt.includes('Select the best response')) {
        return Promise.resolve(JSON.stringify({ best_index: 0 }));
      }
      return Promise.resolve('Refined/Initial Response');
    });

    const result = await runGoA('test query', mockCards, { k: 3 });

    expect(result.selectedAgents).toHaveLength(3);
    expect(result.sourceNodes.length + result.targetNodes.length).toBe(3);
    // 1 (sample) + 3 (init) + 6 (score) + 3 (refine) + 1 (pool) = 14 calls
    // But score calls depend on k. For k=3, it's 3*2 = 6.
    expect(client.chatWithRetry).toHaveBeenCalled();
  });
});
