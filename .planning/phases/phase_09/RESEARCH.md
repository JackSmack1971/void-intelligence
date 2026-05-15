# Research: Adversarial Consensus Loop

## Current State
The refinement stage uses a bidirectional message passing loop:
1. **Forward Pass**: Source nodes refine based on target nodes.
2. **Reverse Pass**: Target nodes refine based on source nodes.
3. **Convergence**: Simple content-length delta check.

## Adversarial Upgrade (Phase 9)
To achieve "Advanced Intelligence", we shift to a **Debate** paradigm:

### 1. Critique Injection
Instead of just "refining", agents will be prompted to **Critique**:
- "Find the weakest link in Expert A's argument."
- "Identify any contradictions between Expert B's claim and the retrieved memory."

### 2. Semantic Judge
We replace `delta < TAU_DELTA` (length-based) with an LLM call:
- **Model**: Claude 3.5 Sonnet (Premium Tier).
- **Prompt**: "Given these two sets of responses from consecutive debate rounds, has the reasoning converged? Score 0-1."
- **Benefit**: Detects when agents are stuck in a loop or when the quality is no longer improving despite length changes.

### 3. Graph-of-Thoughts (GoT)
Each debate turn will be tracked:
- `Round 1`: Initial Thesis
- `Round 2`: Peer Critique
- `Round 3`: Synthesis & Defense

## Technical Considerations
- **Token Usage**: Critique loops can be token-intensive. We must use `prompt compression` (removing boilerplate from previous turns) to keep context windows lean.
- **Latency**: Premium judge calls add ~1.5s per iteration. We will cap iterations at 3.
