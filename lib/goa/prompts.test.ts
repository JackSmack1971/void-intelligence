import { describe, it, expect } from 'vitest';
import * as prompts from './prompts';

describe('GoA Prompts Fortification [RED]', () => {
  it('COMPLEXITY_CLASSIFICATION_PROMPT should use ### headers', () => {
    const prompt = prompts.COMPLEXITY_CLASSIFICATION_PROMPT('test query');
    expect(prompt).toContain('### SYSTEM ROLE');
    expect(prompt).toContain('### CATEGORIES');
    expect(prompt).toContain('### OUTPUT SCHEMA');
  });

  it('NODE_SAMPLING_PROMPT should use ### headers', () => {
    const prompt = prompts.NODE_SAMPLING_PROMPT('test query', [], 3);
    expect(prompt).toContain('### SYSTEM ROLE');
    expect(prompt).toContain('### INSTRUCTIONS');
    expect(prompt).toContain('### AGENTS');
  });

  it('REFINEMENT_PROMPT should use ### headers', () => {
    const prompt = prompts.REFINEMENT_PROMPT('q', 'resp', ['c1'], ['p1']);
    expect(prompt).toContain('### SYSTEM ROLE');
    expect(prompt).toContain('### CONTEXT');
    expect(prompt).toContain('### REFINEMENT RULES');
  });

  it('SUMMARIZATION_PROMPT should use ### headers', () => {
    const prompt = prompts.SUMMARIZATION_PROMPT('q', 'log');
    expect(prompt).toContain('### DEBATE LOG');
  });

  it('PD_TOT_JUDGE_PROMPT should use ### headers', () => {
    const prompt = prompts.PD_TOT_JUDGE_PROMPT('q', [], []);
    expect(prompt).toContain('### DIALECTICAL HISTORY');
    expect(prompt).toContain('### OUTPUT SCHEMA');
  });

  it('RELEVANCE_SCORING_PROMPT should use ### headers', () => {
    const prompt = prompts.RELEVANCE_SCORING_PROMPT('q', 'resp');
    expect(prompt).toContain('### TARGET RESPONSE');
  });

  it('POOLING_SYNTHESIS_PROMPT should use ### headers', () => {
    const prompt = prompts.POOLING_SYNTHESIS_PROMPT('q', []);
    expect(prompt).toContain('### EXPERT PERSPECTIVES');
  });

  it('ADVERSARIAL_CRITIQUE_PROMPT should use ### headers', () => {
    const prompt = prompts.ADVERSARIAL_CRITIQUE_PROMPT('q', 'resp');
    expect(prompt).toContain('### TARGET RESPONSE');
  });
});
