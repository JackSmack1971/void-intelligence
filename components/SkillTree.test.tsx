import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import SkillTree from "./SkillTree";
import { ModelCard } from "../lib/goa/types";

// Mock reactflow cleanly to allow node clicking and state inspection
vi.mock("reactflow", () => {
  const ReactFlow = ({ children, onNodeClick, nodes }: any) => {
    return (
      <div data-testid="react-flow-mock">
        {children}
        {nodes?.map((node: any) => (
          <button 
            key={node.id} 
            data-testid={`node-${node.id}`} 
            onClick={(e) => onNodeClick?.(e, node)}
          >
            {node.data?.label}
          </button>
        ))}
      </div>
    );
  };
  return {
    default: ReactFlow,
    Background: () => <div data-testid="background-mock" />,
    Handle: () => null,
    Position: { Top: "top", Bottom: "bottom", Left: "left", Right: "right" }
  };
});

describe("SkillTree [RED]", () => {
  const mockModels: ModelCard[] = [
    {
      id: "model-alpha",
      name: "Alpha Agent",
      role: "general",
      description: "Baseline assistant with logic routing capabilities.",
      capabilities: ["routing", "logic"],
      skills: ["Core/System Logic"]
    }
  ];

  it("should render ReactFlow container and nodes cleanly", () => {
    render(<SkillTree models={mockModels} />);
    expect(screen.getByTestId("react-flow-mock")).toBeDefined();
    expect(screen.getByTestId("node-root")).toBeDefined();
    expect(screen.getByText("Void Registry")).toBeDefined();
  });

  it("should open floating inspector when clicking an agent node and close it on trigger", () => {
    render(<SkillTree models={mockModels} />);
    
    // Node should be rendered in the graph
    const agentNode = screen.getByTestId("node-agent-model-alpha-sub-Core-System Logic");
    expect(agentNode).toBeDefined();

    // Click to open inspector
    fireEvent.click(agentNode);
    
    // Details inspector modal should appear with role and description
    expect(screen.getAllByText("Alpha Agent").length).toBe(2);
    expect(screen.getByText("Baseline assistant with logic routing capabilities.")).toBeDefined();
    expect(screen.getByText("routing")).toBeDefined();

    // Click close button to dismiss inspector
    const closeBtn = screen.getByTestId("close-inspector");
    fireEvent.click(closeBtn);

    // Inspector details should be dismissed
    expect(screen.queryByText("Baseline assistant with logic routing capabilities.")).toBeNull();
  });
});
