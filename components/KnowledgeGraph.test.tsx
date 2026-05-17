import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import KnowledgeGraph from "./KnowledgeGraph";

// Mock CSS imports to prevent JSDOM from crashing during style parsing
vi.mock("reactflow/dist/style.css", () => ({}));

// Mock JSDOM Worker to prevent hanging on Web Worker layout threads
class MockWorker {
  onmessage: (e: any) => void = () => {};
  postMessage(data: any) {
    setTimeout(() => {
      this.onmessage({ data: { nodes: data.nodes, edges: data.edges } });
    }, 0);
  }
  terminate() {}
}
global.Worker = MockWorker as any;

// Mock React Flow to bypass headless dimension/observer limits under JSDOM
vi.mock("reactflow", () => {
  return {
    __esModule: true,
    default: ({ children }: any) => <div data-testid="react-flow-mock">{children}</div>,
    Background: () => <div data-testid="react-flow-background" />,
    Controls: () => <div data-testid="react-flow-controls" />,
    Panel: ({ children, position }: any) => <div data-testid={`react-flow-panel-${position}`}>{children}</div>,
    ReactFlowProvider: ({ children }: any) => <div data-testid="react-flow-provider">{children}</div>,
    useReactFlow: () => ({
      setCenter: vi.fn(),
    }),
    useNodesState: (initial: any) => [initial, vi.fn(), vi.fn()],
    useEdgesState: (initial: any) => [initial, vi.fn(), vi.fn()],
    MarkerType: {
      Arrow: "arrow",
      ArrowClosed: "arrowclosed",
    },
  };
});

// Mock global fetch
const mockFetch = vi.fn().mockResolvedValue({ ok: true });
global.fetch = mockFetch;

describe("KnowledgeGraph [GREEN]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleTriplets = [
    { subject: "A", predicate: "relates", object: "B" }
  ];

  it("should render cleanly with initial triplets", () => {
    render(<KnowledgeGraph initialTriplets={sampleTriplets} />);
    expect(screen.getByTestId("react-flow-mock")).toBeDefined();
    expect(screen.getByPlaceholderText("Search Void...")).toBeDefined();
  });

  it("should handle empty or missing initialTriplets properties defensively without crashing", () => {
    expect(() => render(<KnowledgeGraph initialTriplets={null as any} />)).not.toThrow();
    expect(() => render(<KnowledgeGraph initialTriplets={undefined as any} />)).not.toThrow();
  });

  it("should toggle Destruction Mode and display custom alerts & indicators", async () => {
    render(<KnowledgeGraph initialTriplets={sampleTriplets} />);
    
    const destructionBtn = screen.getByTitle("Enter Destruction Mode");
    expect(destructionBtn).toBeDefined();

    // Toggle on
    fireEvent.click(destructionBtn);

    // Verify destruction active indicator is displayed
    expect(screen.getByText(/Destruction Mode Active/i)).toBeDefined();
    
    // Toggle off
    fireEvent.click(destructionBtn);
    expect(screen.queryByText(/Destruction Mode Active/i)).toBeNull();
  });
});
