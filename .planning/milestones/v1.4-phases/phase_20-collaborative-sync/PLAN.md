# Phase 20: Collaborative Sync (Import/Export) - Plan

## Goal
Implement encrypted intelligence exports and a visual merge interface for knowledge graph sharing.

## Proposed Changes

### [Core: Security]
#### [NEW] [crypto.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/utils/crypto.ts)
- Implement `encryptData` and `decryptData` using Web Crypto API.
- Implement PBKDF2 key derivation.

### [Core: Sync]
#### [NEW] [sync.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/kg/sync.ts)
- `exportTrail`: Gathers KG triplets and debate logs, encrypts them, and triggers download.
- `importTrail`: Decrypts file, performs diffing against local DB, and returns results for UI review.

### [Frontend: Components]
#### [NEW] [MergePreview.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/MergePreview.tsx)
- Modal dialog showing "Incoming Intelligence" vs "Local Knowledge".
- Checkbox list for selective triplet ingestion.

### [Frontend: Dashboard]
#### [MODIFY] [page.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/app/page.tsx)
- Add "Export" and "Import" buttons to the sidebar or main dashboard header.

## Verification Plan

### Automated Tests
- [ ] **Encryption Cycle**: Encrypt a test object -> Decrypt with same pass -> Verify equality.
- [ ] **Wrong Password**: Verify decryption fails gracefully with incorrect passphrase.

### Manual Verification
- [ ] **Export/Import Loop**: Export a session, clear the local KG, import the file, and verify the graph is restored.
- [ ] **Conflict Resolution**: Simulate a conflicting triplet and verify the `MergePreview` UI correctly flags it.
