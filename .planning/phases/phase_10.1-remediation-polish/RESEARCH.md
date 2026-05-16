# Phase 10.1: Quality Remediation & Polish - Research

## Technical Investigation: engine.test.ts Regression

### Root Cause
The `runGoA` function in `lib/goa/engine.ts` was updated in Phase 9 to include an **Adversarial Debate** loop. This loop involves a "Semantic Judge" role that makes a `chatWithRetry` call with `intent: "scoring"` and `json_mode: true`.

In `lib/goa/engine.test.ts`, the mock implementation of `chatWithRetry` handles various intents but falls back to a plain string `"Refined/Initial Response"` for any unmatched calls. Since the judge call expects a JSON object, `JSON.parse("Refined/Initial Response")` throws a `SyntaxError`.

### Proposed Fix
Update the mock in `engine.test.ts` to explicitly detect the `PD_TOT_JUDGE_PROMPT` or the `JUDGE_MODEL` and return a valid JSON response matching the `ConvergenceMetrics` type:
```json
{
  "convergenceScore": 0.9,
  "ksStatistic": 0.05,
  "entropyReduction": 0.1,
  "isStable": true,
  "rationale": "Consensus reached."
}
```

## Documentation Audit: Missing Artifacts

### Phase 9: Adversarial Consensus Loop
- Missing `09-SUMMARY.md`
- Missing `09-VERIFICATION.md`

### Phase 10: Knowledge Consolidation
- Missing `10-SUMMARY.md`
- Missing `10-VERIFICATION.md`

### Phase 11: Architectural Deepening
- `PLAN.md` uses bullet points instead of checkboxes `[ ]` in the Verification Plan section.

## Implementation Strategy
1. **Fix Tests**: Apply the mock update to `engine.test.ts` and verify all tests pass.
2. **Backfill Phase 9**: Create the missing summary and verification artifacts.
3. **Backfill Phase 10**: Create the missing summary and verification artifacts.
4. **Standardize Phase 11**: Update the `PLAN.md` formatting.

## Verification Architecture
- **Automated**: `npm test` must pass 100%.
- **Manual**: Verify all archived and active phase directories contain the required GSD artifacts (`SUMMARY.md`, `VERIFICATION.md`, `PLAN.md` with checkboxes).
