# Phase 13: Skill-Tree Taxonomy - Plan

## Goal
Implement a hierarchical skill taxonomy to improve agent discovery and routing precision, ensuring that the GoA pipeline selects the most qualified experts for specific sub-tasks.

## Proposed Changes

### [Core: Taxonomy]
#### [NEW] [taxonomy.json](file:///c:/Users/click/Desktop/New%20project/void-intelligence/config/taxonomy.json)
- Define the hierarchical skill tree structure.

#### [MODIFY] [models.json](file:///c:/Users/click/Desktop/New%20project/void-intelligence/config/models.json)
- Tag existing models with hierarchical skill paths (e.g., `Logic/Formal`).

### [Core: GoA Engine]
#### [MODIFY] [types.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/types.ts)
- Update `ModelCard` to include `skills: string[]`.

#### [MODIFY] [prompts.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/prompts.ts)
- Update `NODE_SAMPLING_PROMPT` to include the taxonomy and instruct the Meta-LLM to perform "Taxonomy-Aware Sampling".

#### [MODIFY] [engine.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/engine.ts)
- Update `sampleNodes` to pass the taxonomy context to the LLM.

## Verification Plan

### Automated Tests
- [ ] Add unit tests to verify that `sampleNodes` returns agents with relevant skills for specific query types.

### Manual Verification
- [ ] Verify that `config/models.json` has been updated with the new `skills` field.
- [ ] Observe sampling logs to confirm the Meta-LLM identifies skill paths (e.g., "Logic/Formal") before selecting agents.
