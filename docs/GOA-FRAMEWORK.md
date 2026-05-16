<!-- generated-by: gsd-doc-writer -->
# Graph-of-Agents (GoA) Framework

Void Intelligence is powered by a proprietary **Graph-of-Agents** orchestration engine that enables multi-stage parallel reasoning and adversarial refinement.

## 5-Stage Orchestration Pipeline

The engine (`lib/goa/engine.ts`) executes a deterministic flow to transform a raw query into synthesized intelligence:

### Stage 1: Node Sampling
A Meta-LLM (typically `Ring 2.6`) analyzes the query and selects the top `k` experts from the available model cards.
- **Inputs**: User query, available models, personalized memory context.
- **Output**: A subset of specialized models tailored to the task.

### Stage 2: Parallel Generation
The selected experts generate initial, independent responses in parallel.
- **Goal**: Capture diverse logical perspectives without cross-model bias.

### Stage 3: Cross-Evaluation (Scoring Matrix)
Experts score each other's responses based on relevance, accuracy, and logical consistency.
- **Output**: An **Adjacency Matrix** representing the relational strength between expert outputs.

### Stage 4: Adversarial Debate
The engine initiates a multi-turn debate loop.
- **Critique**: Agents identify logical fallacies in peer responses.
- **Refinement**: Agents update their own perspectives based on peer critiques.
- **Wave Scheduling**: Uses **Kahn's Algorithm** (`DebateScheduler`) to parallelize critique waves based on the scoring matrix.

### Stage 5: Synthesis
A final synthesis model aggregates the refined expert perspectives, resolves conflicts, and produces the final response.
- **Telemetry**: Includes a **Harmony Score** indicating the level of consensus achieved.

## Stability Engine

Located in `lib/goa/stability.ts`, this utility detects when the debate has reached a point of diminishing returns.
- **Kolmogorov-Smirnov (KS) Test**: Measures the distance between probability distributions of expert responses.
- **Shannon Entropy**: Measures the "disorder" or disagreement in the consensus.
- **Early Exit**: Triggered when stability crosses a threshold (typically > 85%), saving tokens and latency.

## Model Roles

| Role | Purpose | Example Model |
| :--- | :--- | :--- |
| **Meta** | Sampling, routing, and complexity analysis. | `Ring 2.6 1T` |
| **Logic** | Heavy lifting, mathematical/formal reasoning. | `Qwen3 Thinking` |
| **Extraction** | JSON and SPO triplet parsing. | `Owl Alpha` |
| **Judge** | Adjudicating debate and stability checks. | `DeepSeek V4 Flash` |
| **Synthesis** | Final pooling and narrative construction. | `Llama 3.3 70B` |
