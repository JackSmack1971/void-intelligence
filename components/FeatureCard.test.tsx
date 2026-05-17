import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { FeatureCard } from "./FeatureCard";

describe("FeatureCard Component [RED]", () => {
  it("should render titles and descriptions successfully", () => {
    render(
      <FeatureCard 
        icon={<span data-testid="test-icon">★</span>}
        title="Zero-Cost Logic"
        description="Power reasoning trails using OpenRouter."
        iconColor="bg-blue-500/10"
      />
    );

    expect(screen.getByText("Zero-Cost Logic")).toBeDefined();
    expect(screen.getByText("Power reasoning trails using OpenRouter.")).toBeDefined();
    expect(screen.getByTestId("test-icon")).toBeDefined();
  });

  it("should carry accessible interactive properties and call click/keydown hooks", () => {
    const clickMock = vi.fn();
    render(
      <FeatureCard 
        icon={<span>★</span>}
        title="Zero-Cost Logic"
        description="Power reasoning trails."
        iconColor="bg-blue-500/10"
        onClick={clickMock}
      />
    );

    const card = screen.getByText("Zero-Cost Logic").closest("div");
    expect(card).toBeDefined();
    expect(card?.getAttribute("role")).toBe("button");
    expect(card?.getAttribute("tabindex")).toBe("0");

    // Click trigger
    fireEvent.click(card!);
    expect(clickMock).toHaveBeenCalledTimes(1);

    // Keydown trigger (Enter)
    fireEvent.keyDown(card!, { key: "Enter", code: "Enter" });
    expect(clickMock).toHaveBeenCalledTimes(2);

    // Keydown trigger (Space)
    fireEvent.keyDown(card!, { key: " ", code: "Space" });
    expect(clickMock).toHaveBeenCalledTimes(3);
  });
});
