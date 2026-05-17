import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import RootLayout, { metadata } from "./layout";

describe("RootLayout Component [RED]", () => {
  it("should define correct Next.js layout metadata parameters", () => {
    expect(metadata.title).toBe("Void Intelligence");
    expect(metadata.description).toBe("Your private intelligence graph in absolute darkness.");
  });

  it("should render children inside the main shell container", () => {
    render(
      <RootLayout>
        <div data-testid="layout-child">Console Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId("layout-child")).toBeDefined();
    expect(screen.getByText("Console Content")).toBeDefined();
  });
});
