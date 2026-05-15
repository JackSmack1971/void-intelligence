import { ModelCard } from "./types";

const FORMAT_MEMORY = (memory?: string) => 
  memory ? `\n\n[LOCAL_MEMORY_CONTEXT]\n${memory}\n(Priority: Use these stored facts to personalize your response.)\n` : "";

export const NODE_SAMPLING_PROMPT = (query: string, cards: ModelCard[], k: number, memory?: string) => `
You are the Meta-LLM orchestrator. Select the top ${k} agents for the user query.
${FORMAT_MEMORY(memory)}
Query: "${query}"

Agents:
${cards.map(c => `- [${c.id}] ${c.name}: ${c.description}`).join("\n")}

Respond ONLY with JSON:
{
  "selected_ids": ["id1", "id2", "id3"],
  "rationale": "Reason"
}
`;

export const RELEVANCE_SCORING_PROMPT = (query: string, peerResponse: string, memory?: string) => `
Evaluate the response to: "${query}"
${FORMAT_MEMORY(memory)}
Response: "${peerResponse}"

Rate relevance/accuracy (0.0 - 1.0).
Respond ONLY with JSON:
{
  "score": 0.85,
  "reasoning": "Justification"
}
`;

export const REFINEMENT_PROMPT = (query: string, currentResponse: string, contexts: string[], memory?: string) => `
User Query: "${query}"
${FORMAT_MEMORY(memory)}
Your Initial Response:
"${currentResponse}"

Context from Peer Experts:
${contexts.map((c, i) => `Expert ${i + 1}: "${c}"`).join("\n\n")}

Refine your response by incorporating the superior reasoning or missing details from the peer experts. 
Fix any logical errors or gaps. Maintain your persona but elevate the quality.
Output your final refined response.
`;

export const POOLING_SYNTHESIS_PROMPT = (query: string, responses: string[], memory?: string) => `
Synthesize a single, definitive answer to the user query based on the following expert perspectives.
${FORMAT_MEMORY(memory)}
User Query: "${query}"

Expert Responses:
${responses.map((r, i) => `Perspective ${i + 1}: "${r}"`).join("\n\n")}

Combine the complementary strengths of these perspectives into one cohesive, premium response.
`;

export const ADVERSARIAL_CRITIQUE_PROMPT = (query: string, peerResponse: string, memory?: string) => `
You are a Critical Expert. Your goal is to find logical flaws, contradictions, or missing edge cases in a peer's response.
${FORMAT_MEMORY(memory)}
Target Response to evaluate:
"${peerResponse}"

User Query for context: "${query}"

Identify 2-3 specific points where the peer response fails or could be strengthened. Be adversarial but constructive.
Output your critique clearly.
`;

export const PD_TOT_JUDGE_PROMPT = (query: string, roundA: string[], roundB: string[]) => `
You are an Adjudicating Semantic Judge. You possess NO domain expertise and must NOT evaluate factual accuracy. 
Your function is to evaluate logical architecture, semantic entailment, and information entropy using Pragma-Dialectics.

User Query: "${query}"

Round T-1 Responses:
${roundA.map((r, i) => `[Expert ${i}]: ${r}`).join("\n")}

Round T Responses:
${roundB.map((r, i) => `[Expert ${i}]: ${r}`).join("\n")}

Construct a Tree-of-Thought evaluation:
1. [Socratic Branch]: Identify unstated premises or logical leaps.
2. [Cynical Branch]: Identify logical fallacies (ad populum, non-sequitur, circular reasoning).
3. [Aristotelian Branch]: Does Round T semantically entail Round T-1? Is the consensus deep or merely lexical (synonym-matching)?

Output JSON:
{
  "convergenceScore": 0.0 to 1.0 (1.0 = absolute stable consensus),
  "ksStatistic": 0.0 to 1.0 (Maximum distributional divergence detected),
  "entropyReduction": 0.0 to 1.0 (Reduction in uncertainty),
  "isStable": boolean,
  "rationale": "Summary of your dialectical evaluation"
}
`;
