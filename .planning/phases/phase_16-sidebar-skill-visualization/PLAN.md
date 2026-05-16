# Phase 16: Sidebar Skill Visualization - Plan

## Goal
Build an interactive React Flow skill tree in the sidebar to visualize agent taxonomy and live performance metrics.

## Proposed Changes

### [Frontend: Components]
#### [NEW] [SkillTree.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/SkillTree.tsx)
- Main container for the sidebar React Flow instance.
- Logic to transform `ModelCard[]` into `Nodes` and `Edges`.
- Responsive height to fit the sidebar.

#### [NEW] [SkillNode.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/SkillNode.tsx)
- Custom React Flow node.
- Glassmorphism styling (`bg-white/5`, `backdrop-blur-md`).
- Support for `confidence` badges.

### [Frontend: Layout]
#### [MODIFY] [layout.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/app/layout.tsx) or [Sidebar.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/Sidebar.tsx)
- Integrate the `SkillTree` into the existing sidebar.
- Ensure proper scroll container handling.

### [Frontend: Types]
#### [MODIFY] [types.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/types.ts)
- Add UI-specific types if needed for the skill tree state.

## Verification Plan

### Manual Verification
- [ ] **Visual Check**: Tree correctly displays hierarchy (Category -> Sub-category -> Agent).
- [ ] **Styling**: Nodes follow the Cyber-Brutalist/Glassmorphism design system.
- [ ] **Responsiveness**: Sidebar remains usable on different screen widths.
- [ ] **Interactivity**: Hovering over an agent node shows their description.
