import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import SkillNode from "./SkillNode";

// Mock React Flow
vi.mock("reactflow", () => {
  const React = require("react");
  return {
    Handle: (props: any) => React.createElement("div", { "data-testid": "reactflow-handle", ...props }),
    Position: {
      Top: "top",
      Bottom: "bottom",
      Left: "left",
      Right: "right"
    }
  };
});

describe("SkillNode Component [GREEN]", () => {
  it("should render root node variant with custom cyber-brutalist glow styling", () => {
    const mockProps = {
      id: "root-1",
      data: {
        label: "Void Orchestrator Root",
        type: "root" as const
      },
      type: "skillNode",
      selected: false,
      zIndex: 1,
      isConnectable: true,
      xPos: 0,
      yPos: 0,
      dragging: false
    };

    render(<SkillNode {...mockProps} />);
    expect(screen.getByText("root")).toBeDefined();
    expect(screen.getByText("Void Orchestrator Root")).toBeDefined();
  });

  it("should render category node variant", () => {
    const mockProps = {
      id: "category-1",
      data: {
        label: "Reasoning Mechanics",
        type: "category" as const
      },
      type: "skillNode",
      selected: false,
      zIndex: 1,
      isConnectable: true,
      xPos: 0,
      yPos: 0,
      dragging: false
    };

    render(<SkillNode {...mockProps} />);
    expect(screen.getByText("category")).toBeDefined();
    expect(screen.getByText("Reasoning Mechanics")).toBeDefined();
  });

  it("should render agent variant with active heartbeat dot and percentage ticker", () => {
    const mockProps = {
      id: "agent-1",
      data: {
        label: "DeepSeek V4 Consensus Judge",
        type: "agent" as const,
        confidence: 0.94
      },
      type: "skillNode",
      selected: false,
      zIndex: 1,
      isConnectable: true,
      xPos: 0,
      yPos: 0,
      dragging: false
    };

    render(<SkillNode {...mockProps} />);
    expect(screen.getByText("agent")).toBeDefined();
    expect(screen.getByText("DeepSeek V4 Consensus Judge")).toBeDefined();
    
    // Asserting expected upgrades
    expect(screen.getByText("94%")).toBeDefined();
    expect(screen.getByTestId("availability-live-dot")).toBeDefined();
  });
});
