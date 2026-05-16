<!-- generated-by: gsd-doc-writer -->
# UI Components Documentation

Void Intelligence features a **Cyber-Brutalist** design system with high-performance interactive visualizations.

## Core Components

### 1. `KnowledgeGraph` (`components/KnowledgeGraph.tsx`)
A high-fidelity visualization of semantic triplets using **React Flow**.
- **Props**: `initialTriplets: Triplet[]`
- **Features**:
  - **Force-Directed Layout**: Uses a Web Worker (`layout.worker.ts`) for non-blocking topology calculation.
  - **Destruction Mode**: Allows surgical pruning of semantic memories from the local SQLite database.
  - **Predicate Filtering**: Dynamically filter the graph by relationship type (e.g., `is_a`, `part_of`).
  - **Semantic Search**: Highlight specific nodes and relationships in real-time.

### 2. `DebateGraph` (`components/DebateGraph.tsx`)
Visualizes the adversarial consensus loop and model interactions.
- **Features**:
  - Displays inter-agent scoring matrices.
  - Animates the critique/refinement waves.
  - Visualizes the convergence metrics (KS Statistic and Shannon Entropy).

### 3. `ChatInput` (`components/ChatInput.tsx`)
A specialized input with integrated PII redaction.
- **Features**:
  - Client-side regex-based masking.
  - Real-time reasoning status indicators.

### 4. `StrategyDashboard` (`components/StrategyDashboard.tsx`)
The high-level control center for the GoA engine.
- **Features**:
  - Complexity classification display.
  - Expert model card visualization.
  - Real-time performance telemetry.

## Shared UI Patterns

### Glassmorphism
Applied to panels and overlays:
```tsx
className="bg-surface-01/80 backdrop-blur-xl border border-white/10"
```

### Cyber-Brutalist Accents
Used for buttons and active states:
- **Primary**: `bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]`
- **Critical/Destructive**: `bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]`

## Utilities

- **`redactPII`**: Masks sensitive data before transmission.
- **`getPredicateColor`**: Returns deterministic HSL colors for graph relationships.
