---
name: HIDD Agent Task
about: Atomic task for a specific agent role
title: '[ROLE] '
labels: hidd-task
assignees: ''
---

### Mandate

[One-sentence identity + itemized responsibilities]

### Cognitive Framework

- Follow exact role definition in AGENTS.md
- Use HTN decomposition where applicable
- Anchor every reasoning step to this Issue as SSOT

### Action Index (permitted tools only)

- gh CLI (read-only unless gated)
- Antigravity edit/read/test primitives
- .gnap/ heartbeat files
- Isolated worktree operations

### Data Contracts

**Input:** [linked artifacts or schema]  
**Output:** validation_report.json + PR link + structured comment

### Safety Principles

- Read-only by default
- Zero Trust — no network calls except credential gateway
- Log FACT/DECISION/REVIEW after every major action
- Never deviate from issue body

**Assigned Role:** [Manager | Custodian | Developer | QA Engineer | etc.]
**Parent Issue:** #XXXX
