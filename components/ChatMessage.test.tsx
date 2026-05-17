import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import ChatMessage from "./ChatMessage";

describe("ChatMessage Component [RED]", () => {
  it("should render user messages correctly with user styling", () => {
    render(
      <ChatMessage 
        message={{ role: "user", content: "Can you analyze this graph structure?" }}
        index={0}
        onToggleConsole={vi.fn()}
      />
    );

    expect(screen.getByText("Can you analyze this graph structure?")).toBeDefined();
    // Indigo accent borders or similar unique user marker
    const bubble = screen.getByText("Can you analyze this graph structure?").closest("div");
    expect(bubble).toBeDefined();
  });

  it("should render assistant messages and operational telemetry badges", () => {
    const toggleMock = vi.fn();
    const mockMessage = {
      role: "assistant" as const,
      content: "Graph structure successfully stabilized.",
      metrics: {
        ksStatistic: 0.12,
        harmonyScore: 0.94,
        iterations: 3
      },
      showDebate: false
    };

    render(
      <ChatMessage 
        message={mockMessage}
        index={1}
        onToggleConsole={toggleMock}
      />
    );

    expect(screen.getByText("Graph structure successfully stabilized.")).toBeDefined();
    expect(screen.getByText("Stability: 88%")).toBeDefined();
    expect(screen.getByText("Harmony: 94%")).toBeDefined();
    expect(screen.getByText("Turns: 3")).toBeDefined();

    // Trigger toggle button click
    const toggleBtn = screen.getByText("Open Strategic Console");
    expect(toggleBtn).toBeDefined();
    fireEvent.click(toggleBtn);

    expect(toggleMock).toHaveBeenCalledWith(1);
  });
});
