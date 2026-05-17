import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import DebateGraph from "./DebateGraph";

// Mock React Flow
vi.mock("reactflow", () => {
  const React = require("react");
  const Handle = (props: any) => React.createElement("div", { "data-testid": "reactflow-handle", ...props });
  const Panel = (props: any) => React.createElement("div", { "data-testid": "reactflow-panel", children: props.children });
  const Background = () => React.createElement("div", { "data-testid": "reactflow-background" });
  
  const ReactFlow = (props: any) => {
    return React.createElement("div", { "data-testid": "reactflow" }, [
      ...props.nodes.map((n: any) => 
        React.createElement("div", { 
          key: n.id, 
          "data-testid": `node-${n.id}`,
          onClick: (e: any) => props.onNodeClick?.(e, n),
          onContextMenu: (e: any) => props.onNodeContextMenu?.(e, n)
        }, n.data.label)
      ),
      props.children
    ]);
  };

  return {
    default: ReactFlow,
    Background,
    Panel,
    Handle,
    MarkerType: { ArrowClosed: "arrowclosed" },
    ReactFlowProvider: (props: any) => React.createElement("div", null, props.children)
  };
});

describe("DebateGraph Component [RED]", () => {
  it("should return null if debateLog is empty", () => {
    const { container } = render(<DebateGraph debateLog={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render models and turns, and display updated labels", () => {
    const logs = [
      { turn: 1, model: "gpt-4o", content: "[INTERVENTION] Manual override structural change." },
      { turn: 2, model: "claude-3.5", content: "Critique of initial logic structure." }
    ];

    render(<DebateGraph debateLog={logs} />);
    expect(screen.getByTestId("reactflow")).toBeDefined();
    
    // Assert nodes present
    expect(screen.getByText("GPT-4O")).toBeDefined();
    
    // Assert upgraded status labels
    expect(screen.getByText("USER INTERVENTION")).toBeDefined();
    expect(screen.getByText("Turn 2: Critique")).toBeDefined();
  });

  it("should trigger context menu and execute callbacks", () => {
    const logs = [
      { turn: 1, model: "gpt-4o", content: "Initial logic structure." }
    ];

    const interveneMock = vi.fn();

    render(<DebateGraph debateLog={logs} onIntervene={interveneMock} />);

    // Context menu starts closed
    expect(screen.queryByText("Add Manual Critique")).toBeNull();

    // Trigger context menu click on agent node
    const agentNode = screen.getByText("GPT-4O");
    fireEvent.contextMenu(agentNode);

    expect(screen.getByText("Add Manual Critique")).toBeDefined();
    fireEvent.click(screen.getByText("Add Manual Critique"));

    expect(interveneMock).toHaveBeenCalledWith("gpt-4o", "critique");
  });
});
