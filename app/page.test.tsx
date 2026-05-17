import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import Home from "./page";

// Mock Lucide icons statically
vi.mock("lucide-react", () => {
  const React = require("react");
  const createMockIcon = (name: string) => {
    return (props: any) => React.createElement("div", { "data-testid": `icon-${name}`, ...props });
  };
  return {
    MessageSquare: createMockIcon("message-square"),
    Sparkles: createMockIcon("sparkles"),
    Code: createMockIcon("code"),
    BarChart3: createMockIcon("barchart3"),
    Bot: createMockIcon("bot"),
    ChevronRight: createMockIcon("chevron-right"),
    Activity: createMockIcon("activity"),
    Eye: createMockIcon("eye"),
    EyeOff: createMockIcon("eyeoff"),
    Database: createMockIcon("database"),
    X: createMockIcon("x"),
    ShieldAlert: createMockIcon("shield-alert"),
    Send: createMockIcon("send"),
    Paperclip: createMockIcon("paperclip"),
    Mic: createMockIcon("mic")
  };
});

// Mock Server Actions
vi.mock("./actions", () => {
  return {
    processChat: vi.fn(),
    processIntervention: vi.fn(),
    syncKg: vi.fn().mockResolvedValue({ success: true, data: [] }),
    getTripletsForExport: vi.fn(),
    importSelectedTripletsDelta: vi.fn()
  };
});

// Mock components
vi.mock("@/components/Sidebar", () => {
  return {
    Sidebar: ({ onExport, onImport, onChangeTab }: any) => (
      <div data-testid="sidebar">
        <button onClick={() => onChangeTab("graph")}>Graph Tab</button>
        <button onClick={() => onChangeTab("capabilities")}>Capabilities Tab</button>
        <button onClick={onExport}>Export Trail</button>
        <button onClick={onImport}>Import Trail</button>
      </div>
    )
  };
});

vi.mock("@/components/KnowledgeGraph", () => {
  return {
    default: () => <div data-testid="knowledge-graph">Knowledge Graph Element</div>
  };
});

vi.mock("@/components/StrategyDashboard", () => {
  return {
    default: () => <div data-testid="strategy-dashboard">Strategy Dashboard Element</div>
  };
});

describe("Home Page [GREEN]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render welcome screen and feature cards on mount", () => {
    render(<Home />);
    expect(screen.getByText("Void Intelligence")).toBeDefined();
    expect(screen.getByText("Your private intelligence graph in absolute darkness.")).toBeDefined();
  });

  it("should render custom glassmorphic password modal on Export Trail trigger", async () => {
    render(<Home />);

    const exportBtn = screen.getByText("Export Trail");
    
    await act(async () => {
      fireEvent.click(exportBtn);
    });

    expect(screen.getByTestId("custom-prompt-modal")).toBeDefined();
    expect(screen.getByText("Encrypt Trail Export")).toBeDefined();
    
    // Test cancel modal action
    const cancelModalBtn = screen.getByText("Cancel");
    await act(async () => {
      fireEvent.click(cancelModalBtn);
    });
    
    expect(screen.queryByTestId("custom-prompt-modal")).toBeNull();
  });

  it("should support tab switching to capabilities and graph views", async () => {
    render(<Home />);

    // Switch to capabilities
    const capTab = screen.getByText("Capabilities Tab");
    await act(async () => {
      fireEvent.click(capTab);
    });
    expect(screen.getByTestId("strategy-dashboard")).toBeDefined();

    // Switch to graph
    const graphTab = screen.getByText("Graph Tab");
    await act(async () => {
      fireEvent.click(graphTab);
    });
    expect(screen.getByTestId("knowledge-graph")).toBeDefined();
  });
});
