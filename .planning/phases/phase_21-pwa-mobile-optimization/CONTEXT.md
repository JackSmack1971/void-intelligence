# Phase 21: PWA Mobile & UI Optimization - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning
**Source:** Milestone v1.4 Final Refinement

<domain>
## Domain Glossary
- **PWA (Progressive Web App)**: A web app that uses modern web capabilities to deliver an app-like experience.
- **Service Worker**: A script that runs in the background to handle caching and offline functionality.
- **Touch Target**: The interactive area around a UI element designed for finger input (min 44x44px).

## Phase Boundary
This phase focuses on **UI/UX parity** between desktop and mobile. It does not introduce new backend logic or graph extraction features.
</domain>

<decisions>
## Implementation Decisions
- **Manual SW**: We will use a vanilla `sw.js` for maximum control over the caching of the Shared Worker and Intelligence Sync logic.
- **Conditional Layouts**: Use Tailwind's `md:` and `lg:` prefixes to manage complexity rather than creating entirely separate mobile components.
- **Icon Strategy**: Use high-contrast SVG icons that scale well across different PPI densities.

### the agent's Discretion
- The exact animation timing for the sidebar drawer.
- The "Mobile Empty State" for the graph when no nodes are selected.
</decisions>

<canonical_refs>
- `void-intelligence/public/workers/void-worker.js` — Target for offline caching.
- `void-intelligence/components/Sidebar.tsx` — Target for responsive refactor.
</canonical_refs>

---
*Phase: 21-pwa-mobile-optimization*
*Context gathered: 2026-05-15*
