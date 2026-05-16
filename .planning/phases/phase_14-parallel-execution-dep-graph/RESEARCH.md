# Phase 14 Research: Parallel Execution & Dependency Graph

## Objective
Implement a high-performance debate scheduler using dependency graphs to reduce end-to-end latency by 35%.

## 1. Dependency-Aware Scheduling

### The Problem
Current debate cycles are synchronous rounds where all agents critique their neighbor in a ring. This forces all critiques to wait for the previous round to finish, even if they are semantically independent.

### The Solution: Wave-Based Execution
Use a dependency graph (Adjacency List) to group agents into parallel "waves".
- **Wave 0**: Agents with zero incoming dependencies.
- **Wave 1**: Agents depending only on Wave 0.
- **Algorithm**: Kahn's Algorithm (Topological Sort).

### Implementation
- **Strategy Stage**: The Meta-LLM will output a `dependency_graph` (e.g., `{"A": ["B", "C"], "B": ["C"]}`) indicating which agents should critique whom.
- **Scheduler**: A new `DebateScheduler` deep module will process this graph into waves.

## 2. Shared Agent Memory (Harmony)

### Current State
Agents receive the user query and a static context from the KG.

### Proposed Upgrade
Extend the `REFINEMENT_PROMPT` to include:
- **Global Context**: The initial responses of ALL other experts (summarized if necessary).
- **Relational Memory**: Experts will see critiques directed at others, not just themselves, to allow for "triangulated" reasoning.

## 3. Prompt Compression

### Strategy
After 2 rounds of debate, the `debateLog` can become verbose.
- **Summarization**: Use a "Flash" model to compress earlier turns into a bulleted "Consensus State" before the final synthesis.
- **Token Protection**: Ensures the synthesis stage doesn't hit context limits and maintains high attention on the user's core constraints.

## Verification Plan
- **Automated**: Benchmarking latency (simulated) with and without the scheduler.
- **Consistency**: Verify that topological waves maintain the causal order of critiques.
