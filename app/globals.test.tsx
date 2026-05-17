import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";

describe("CSS Global Variables & Utilities [RED]", () => {
  it("should mount elements decorated with custom glass-premium and neon-glow classes", () => {
    render(
      <div data-testid="styled-container" className="glass-premium neon-glow-violet">
        <span className="neon-glow-emerald">Refinement Active</span>
        <span className="neon-glow-amber">Critique Active</span>
      </div>
    );

    const container = screen.getByTestId("styled-container");
    expect(container).toBeDefined();
    expect(container.className).toContain("glass-premium");
    expect(container.className).toContain("neon-glow-violet");

    const activeRefinement = screen.getByText("Refinement Active");
    expect(activeRefinement.className).toContain("neon-glow-emerald");

    const activeCritique = screen.getByText("Critique Active");
    expect(activeCritique.className).toContain("neon-glow-amber");
  });
});
