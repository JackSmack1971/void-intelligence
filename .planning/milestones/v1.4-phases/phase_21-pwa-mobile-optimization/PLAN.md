# Phase 21: PWA Mobile & UI Optimization - Plan

## Goal
Transform the console into an installable, touch-optimized mobile experience.

## Proposed Changes

### [Infrastructure: PWA]
#### [NEW] [manifest.json](file:///c:/Users/click/Desktop/New%20project/void-intelligence/public/manifest.json)
- Define app metadata, icons, and theme colors.

#### [NEW] [sw.js](file:///c:/Users/click/Desktop/New%20project/void-intelligence/public/sw.js)
- Implement basic asset caching and offline shell support.

#### [MODIFY] [layout.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/app/layout.tsx)
- Add manifest link and theme-color meta tags to the document head.

### [UI: Navigation]
#### [MODIFY] [Sidebar.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/Sidebar.tsx)
- Implement a mobile-only "Hamburger" menu and backdrop.
- Add auto-close logic on navigation/action.

### [UI: Graph Optimization]
#### [MODIFY] [DebateGraph.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/DebateGraph.tsx)
- Scale node sizes and hitboxes for touch input.
- Enable pinch-to-zoom enhancements.

#### [MODIFY] [SkillTree.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/SkillTree.tsx)
- Disable intrusive scroll-zooming on mobile.

### [UI: Dashboards]
#### [MODIFY] [StrategyDashboard.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/StrategyDashboard.tsx)
- Implement responsive stacking for metrics and matrix visualizations.

## Verification Plan

### Automated Tests
- [ ] **Lighthouse Audit**: Run a mobile PWA audit; aim for >90 score in Progressive Web App category.

### Manual Verification
- [ ] **Installation**: "Add to Home Screen" test on iOS/Android.
- [ ] **Gesture Test**: Verify graph panning doesn't trigger the browser's "back/forward" navigation gestures.
- [ ] **Offline Check**: Verify the UI loads correctly in Airplane Mode.
