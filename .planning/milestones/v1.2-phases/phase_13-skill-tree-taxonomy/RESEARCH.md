# Phase 13 Research: Skill-Tree Taxonomy

## Objective
Implement a hierarchical "Skill Tree" to improve agent discovery and routing precision in the GoA pipeline.

## Proposed Taxonomy: Skill-Tree (Draft)

### 1. Logic & Reasoning
- **Formal Logic**: Syllogisms, Predicate Logic, Truth Tables.
- **Mathematical Reasoning**: Calculus, Statistics, Algorithmic Analysis.
- **Strategic Planning**: Long-horizon goal decomposition.

### 2. Knowledge Extraction
- **Semantic Mapping**: SPO triplet extraction, Entity Linking.
- **Structured Synthesis**: JSON/YAML formatting, Schema enforcement.
- **Pattern Recognition**: Anomaly detection, Trend analysis.

### 3. Creative & Synthesis
- **Dialectic Synthesis**: Combining conflicting expert views.
- **Narrative Construction**: Multi-modal story arcs, Long-form writing.
- **Style Transfer**: Adapting tone and register.

## Technical Strategy

### 1. Schema Update
- Add `skills` (hierarchical paths) to `ModelCard` type.
- Example: `["Logic/Formal/Syllogisms", "Logic/Math/Statistics"]`.

### 2. Taxonomy Store
- Create `config/taxonomy.json` as the source of truth for the skill tree.

### 3. Sampling Engine
- Update `GoAOrchestrator`'s sampling stage.
- The Meta-LLM should now output the "Required Skill Path" for the query first, then select agents that match those paths.

## Verification Plan
- **Automated**: Verify that the sampling engine correctly identifies the skill path for a given query (e.g., a math problem should trigger the `Logic/Math` path).
- **Manual**: Verify that `config/models.json` is updated with hierarchical skill tags.
