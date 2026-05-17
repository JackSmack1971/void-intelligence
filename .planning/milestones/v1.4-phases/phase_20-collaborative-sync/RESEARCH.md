# Phase 20 Research: Collaborative Sync (Import/Export)

## Objective
Enable secure, device-agnostic sharing of intelligence "trails" while maintaining the absolute privacy of the Void ecosystem.

## 1. Encrypted Trail Export (.void files) (HIL-05)

### Encryption Architecture
- **Algorithm**: `AES-GCM` (256-bit).
- **Key Derivation**: `PBKDF2` with `SHA-256` and 600,000 iterations.
- **Payload**: JSON bundle containing:
  - `triplets`: Knowledge graph segment.
  - `debateLog`: Relevant chat history.
  - `metadata`: Export date, engine version.
- **Workflow**: 
  1. User clicks "Export Trail".
  2. Prompted for passphrase.
  3. Key derived locally; data encrypted.
  4. `.void` file downloaded.

## 2. Visual Diff UI (HIL-06)

### Merge Logic
When a user imports a `.void` file, the system must show a "Strategic Merge Preview" before modifying the local database.
- **Status Indicators**:
  - `ADD`: Triplet exists in export but not in local KG.
  - `OVERLAP`: Triplet exists in both (skip).
  - `CONFLICT`: Similar subject/predicate but different object (requires HITL resolution).
- **Visualization**: A side-by-side table or a temporary graph layer showing the delta.

## 3. Consolidation-based Deduplication (HIL-07)

### Semantic Merging
Simply importing raw strings leads to entity duplication (e.g., "AI" vs "Artificial Intelligence").
- **Strategy**: On import, run the `Consolidation` worker specifically on the union of local + imported triplets.
- **Automation**: High-confidence merges (exact matches) are automatic; low-confidence ones are flagged in the Diff UI.

## 4. Verification Plan
- **Encryption Security**: Verify that a `.void` file cannot be decrypted without the correct passphrase using standard tools.
- **Merge Integrity**: Verify that importing the same file twice results in zero new triplets (idempotency).
- **Conflict Handling**: Manually create a conflict and verify the UI allows the user to pick the winner.
