import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import ErrorBoundary from "./ErrorBoundary";

const BuggyComponent = () => {
  throw new Error("Simulated component crash!");
};

describe("ErrorBoundary Component [GREEN]", () => {
  it("should render children when no errors occur", () => {
    render(
      <ErrorBoundary>
        <div data-testid="child-element">Safe Render</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId("child-element")).toBeDefined();
    expect(screen.getByText("Safe Render")).toBeDefined();
  });

  it("should capture simulated errors and display custom cyber-brutalist fallback details drawer", async () => {
    const errMock = vi.spyOn(console, "error").mockImplementation(() => {});
    const resetMock = vi.fn();

    render(
      <ErrorBoundary onReset={resetMock}>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText("Simulated component crash!")).toBeDefined();

    // Assert custom upgrades
    const toggleBtn = screen.getByText("Diagnostic Details");
    expect(toggleBtn).toBeDefined();
    expect(screen.getByText("Try Again")).toBeDefined();

    // Disclosure panel starts hidden
    expect(screen.queryByText("Stack Trace:")).toBeNull();

    // Click to toggle details drawer open
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(screen.getByText("Stack Trace:")).toBeDefined();

    // Click Try Again to execute reset
    const tryBtn = screen.getByText("Try Again");
    await act(async () => {
      fireEvent.click(tryBtn);
    });

    expect(resetMock).toHaveBeenCalledTimes(1);

    errMock.mockRestore();
  });
});
