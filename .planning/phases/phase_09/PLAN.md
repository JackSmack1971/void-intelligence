# Phase 9: Adversarial Consensus Loop

## Goal
Transform the iterative refinement stage into a multi-turn adversarial debate loop where agents critique each other's reasoning, overseen by a semantic "Debate Judge" to ensure convergence on high-fidelity answers.

## Proposed Changes

### [GoA Engine]
#### [MODIFY] [engine.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/engine.ts)
- Replace `runRefinement` with `runAdversarialDebate`.
- Implement a `stability` check using `computeKSStatistic` (Kolmogorov-Smirnov) to trigger early exits.
- Integrate the `DeepSeek V4 Flash` (or fallback) for the Judge role.

#### [NEW] [stability.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/stability.ts)
- Implement Beta-Binomial Mixture Model for consensus dynamics tracking.
- Add `computeKSStatistic` to measure distributional divergence between debate rounds.

#### [MODIFY] [prompts.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/prompts.ts)
- [NEW] `ADVERSARIAL_CRITIQUE_PROMPT`: Directs an agent to find flaws or contradictions in peer responses.
- [NEW] `PD_TOT_JUDGE_PROMPT`: Multi-branched Tree-of-Thought judge prompt utilizing Socratic, Cynical, and Aristotelian personas for semantic entailment verification.

#### [MODIFY] [types.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/types.ts)
- Add `convergenceMetrics: { ksStatistic: number; entropyReduction: number; }` to the context.

### [UI Components]
#### [MODIFY] [app/page.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/app/page.tsx)
- Update `currentStatus` to reflect "Debate Stabilization" phases and the KS statistic.

## Verification Plan

### Automated Tests
- Create `engine.adversarial.test.ts` to mock conflicting agent outputs and verify the judge's convergence logic.
- Test adaptive iteration counts for complex vs. simple queries.

### Manual Verification
- Observe reasoning logs in the UI to ensure agents are actually critiquing each other and not just "agreeing" blindly.
