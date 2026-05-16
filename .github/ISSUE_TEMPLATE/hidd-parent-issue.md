---
name: HIDD Parent / Feature Issue
about: High-level epic or feature using full Hierarchical Issue-Driven Development
title: '[Feature] '
labels: hidd-parent, enhancement
assignees: ''
---

### Mandate

[Clear business value and success outcome]

### Essential State (must be true before closed)

- [ ] All sub-issues completed and merged
- [ ] Integration + regression tests passing
- [ ] Documentation & map.md updated
- [ ] QA Engineer structured REVIEW posted
- [ ] Manager sign-off

### Cognitive Framework

Manager agent: Perform HTN decomposition → create sub-issues → build dependency graph → spawn child agents via Antigravity Agent Manager.

### Constraints & Architecture

[List tech decisions, non-functional requirements, safety principles]

### Dependencies / Blocking Issues

- 
  
  **Manager Agent Instructions:**  
  Read `AGENTS.md` + `CLAUDE.md` → run HTN → create sub-issues using `.github/ISSUE_TEMPLATE/agent-task.md` → assign roles → post kick-off comment.
