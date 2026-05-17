# Phase 16 Research: Sidebar Skill Visualization

## Objective
Visualize the agent pool and hierarchical skill taxonomy in the sidebar to provide users with a "Strategic Map" of the intelligence pool.

## 1. Taxonomy-to-Graph Mapping

### Data Structure
The `models.json` file contains skill paths like `Logic & Reasoning/Formal Logic`. We need to parse these into a tree structure:
- **Level 0**: "Root" (Void Registry).
- **Level 1**: Categories (e.g., Logic & Reasoning).
- **Level 2**: Sub-categories (e.g., Formal Logic).
- **Level 3**: Agents (e.g., Qwen3 Thinking).

### Algorithm
A recursive parser will walk the `skills` array of each `ModelCard` and build a set of unique nodes and edges.

## 2. Component Design

### React Flow Integration
- **Sidebar Graph**: Use a simplified React Flow instance with `panOnScroll: false` and `nodesDraggable: false`.
- **Layout**: Use `dagre` or a simple tree layout (manual calculation of X/Y based on depth).
- **Custom Nodes**:
    - **Category Nodes**: Solid borders, larger text.
    - **Agent Nodes**: Glassmorphism, tiny logo/icon, and a "Confidence Badge".

### Live Confidence Badges
- **Wiring**: The sidebar should listen to the `GoAResult` from the last debate.
- **Visual**: Agents used in the last debate will pulse or show their specific `harmonyScore` contribution.

## 3. Interaction Patterns
- **Hover**: Shows agent capabilities and description.
- **Click**: Highlights all nodes in the main debate graph that used this specific skill or agent.

## Verification Plan
- **UI Consistency**: Ensure the sidebar matches the "Cyber-Brutalist" dark mode.
- **Data Integrity**: Verify that all agents in `models.json` are represented in the tree.
