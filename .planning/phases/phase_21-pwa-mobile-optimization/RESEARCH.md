# Phase 21 Research: PWA Mobile & UI Optimization

## Objective
Elevate the Void Intelligence console to a production-grade Progressive Web App with seamless mobile interactions.

## 1. PWA Manifest & Service Worker (UI-04)

### Manifest Configuration
- **File**: `public/manifest.json`
- **Key Fields**:
  - `name`: "Void Intelligence"
  - `short_name`: "Void"
  - `display`: "standalone" (removes browser chrome)
  - `theme_color`: "#030712" (gray-950)
  - `background_color`: "#030712"
  - `icons`: High-resolution masks and logos (512x512, 192x192).

### Service Worker Strategy
- **File**: `public/sw.js`
- **Caching**: Stale-While-Revalidate for static assets (CSS, JS, Fonts).
- **Offline Support**: Cache the `idb.ts` and `void-worker.js` files specifically to ensure the persistence layer works without a network connection.

## 2. Touch-Optimized Graph Controls (UI-05)

### React Flow (SkillTree)
- **Problem**: Default pan/zoom can interfere with page scroll on mobile.
- **Solution**: 
  - Enable `panOnScroll` only when the element is focused.
  - Implement a "Gesture Lock" toggle for mobile users.

### DebateGraph (Force-Graph)
- **Problem**: Nodes are difficult to tap on small screens.
- **Solution**: 
  - Increase `nodeRelSize` for touch targets.
  - Implement `onNodeClick` with a larger hit-box or a "Focus" mode that zooms into the clicked agent cluster.

## 3. Responsive UI Refinements

### Sidebar Drawer
- **Implementation**: Use a backdrop overlay and a "Menu" button that appears on mobile (`md:hidden`).
- **Interaction**: Smooth CSS transitions for the `-translate-x-full` state.

### Strategic Dashboards
- **Layout**: Convert the 2x2 grid in `StrategyDashboard` to a single column on screens `< 768px`.
- **Matrix View**: Implement a "Full Screen" toggle for the adjacency matrix to allow zooming on mobile.

## 4. Verification Plan
- **PWA Installability**: Verify the "Install App" prompt appears in Chrome/Safari.
- **Offline Assets**: Disable network and verify the shell and fonts load correctly.
- **Touch Responsiveness**: Test node dragging and zooming on a physical mobile device or simulator.
- **Drawer Logic**: Verify the sidebar closes automatically when a nav item is clicked on mobile.
