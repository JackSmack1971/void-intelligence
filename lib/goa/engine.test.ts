import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoAOrchestrator } from './engine';
import { LLMProvider } from '../ports/llm';

describe('GoAOrchestrator', () => {
  const mockCards = [
    { id: 'agent-1', name: 'Agent 1', role: 'logic', description: 'desc', capabilities: [] },
    { id: 'agent-2', name: 'Agent 2', role: 'extraction', description: 'desc', capabilities: [] },
    { id: 'agent-3', name: 'Agent 3', role: 'meta', description: 'desc', capabilities: [] },
  ];

  let mockLlm: LLMProvider;

  beforeEach(() => {
    mockLlm = {
      chat: vi.fn(),
      stream: vi.fn(),
    };

    let scoreCounter = 0;
    (mockLlm.chat as any).mockImplementation((messages: any, options: any) => {
      const prompt = messages[0].content;
      const intent = options.intent;

      if (prompt.includes('Classify the complexity')) return Promise.resolve(JSON.stringify({ complexity: 'medium' }));
      if (prompt.includes('Extract 3-5 core entities')) return Promise.resolve('keyword1');
      if (intent === 'sampling') return Promise.resolve(JSON.stringify({ 
        required_skill_paths: ['Logic/Formal'],
        selected_ids: ['agent-1', 'agent-2', 'agent-3'] 
      }));
      if (intent === 'scoring' && prompt.includes('Evaluate the response')) {
        return Promise.resolve(JSON.stringify({ score: (scoreCounter++ % 2) }));
      }
      if (intent === 'scoring' && prompt.includes('Adjudicating Semantic Judge')) {
        return Promise.resolve(JSON.stringify({
          convergenceScore: 0.9,
          ksStatistic: 0.05,
          entropyReduction: 0.1,
          isStable: true,
          rationale: "Consensus reached."
        }));
      }
      if (intent === 'synthesis' && prompt.includes('Summarize the following')) {
        return Promise.resolve('Summarized Debate Context');
      }
      if (intent === 'synthesis') return Promise.resolve('Final Synthesis Response');
      return Promise.resolve('Standard Response');
    });
  });

  it('should orchestrate the GoA pipeline using the provided LLM Port', async () => {
    const orchestrator = new GoAOrchestrator(mockLlm);
    const result = await orchestrator.run('test query', mockCards, { k: 3 });

    expect(result.selectedAgents).toHaveLength(3);
    expect(result.finalResponse).toBeDefined();
    expect(result.metrics?.isStable).toBe(true);
    expect(mockLlm.chat).toHaveBeenCalled();
  });
});
