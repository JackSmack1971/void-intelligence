import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import StrategyDashboard from "./StrategyDashboard";

// Mock Lucide icons
vi.mock("lucide-react", () => {
  const React = require("react");
  const createMockIcon = (name: string) => {
    return (props: any) => React.createElement("div", { "data-testid": `icon-${name}`, ...props });
  };
  return {
    Zap: createMockIcon("zap"),
    BarChart3: createMockIcon("barchart3"),
    Layers: createMockIcon("layers"),
    Activity: createMockIcon("activity")
  };
});

describe("StrategyDashboard Component [GREEN]", () => {
  it("should render welcome telemetry cards on mount", () => {
    render(<StrategyDashboard complexity="HIGH" harmonyScore={0.88} iterations={4} k={3} />);
    expect(screen.getByText("Strategy Dashboard")).toBeDefined();
    expect(screen.getByText("LIVE OPTIMIZATION")).toBeDefined();
    expect(screen.getByText("Complexity")).toBeDefined();
    expect(screen.getByText("Harmony")).toBeDefined();
  });

  it("should support clicking stat cards to reveal glassmorphic explanation dialogs", async () => {
    render(<StrategyDashboard complexity="HIGH" harmonyScore={0.88} iterations={4} k={3} />);

    // Details box starts hidden
    expect(screen.queryByTestId("metric-explanation-box")).toBeNull();

    // Click Complexity
    const compBtn = screen.getByText("Complexity").closest("button");
    expect(compBtn).toBeDefined();

    if (compBtn) {
      await act(async () => {
        fireEvent.click(compBtn);
      });

      expect(screen.getByTestId("metric-explanation-box")).toBeDefined();
      expect(screen.getByText("Query Complexity Tier")).toBeDefined();

      // Click ESC button to close
      const escBtn = screen.getByText("ESC");
      await act(async () => {
        fireEvent.click(escBtn);
      });

      expect(screen.queryByTestId("metric-explanation-box")).toBeNull();
    }
  });
});
