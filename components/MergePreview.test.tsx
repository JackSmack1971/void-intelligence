import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import MergePreview from "./MergePreview";
import { KnowledgeTriplet as Triplet } from "@/lib/goa";

describe("MergePreview [RED]", () => {
  const mockNew: Triplet[] = [
    { subject: "A", predicate: "is", object: "B" },
    { subject: "C", predicate: "is", object: "D" }
  ];
  const mockOverlaps: Triplet[] = [
    { subject: "E", predicate: "is", object: "F" }
  ];

  it("should render incoming trail title, stats cards, and new items correctly", () => {
    render(
      <MergePreview 
        newItems={mockNew} 
        overlaps={mockOverlaps} 
        onConfirm={() => {}} 
        onCancel={() => {}} 
      />
    );

    expect(screen.getByText("Incoming Intelligence Trail")).toBeDefined();
    expect(screen.getByText("Ingestible Relations")).toBeDefined();
    expect(screen.getByText("A")).toBeDefined();
    expect(screen.getByText("C")).toBeDefined();
  });

  it("should switch tabs to Conflicting Overlaps and display overlaps as read-only cards", () => {
    render(
      <MergePreview 
        newItems={mockNew} 
        overlaps={mockOverlaps} 
        onConfirm={() => {}} 
        onCancel={() => {}} 
      />
    );

    // Switch to Overlaps tab button
    const overlapsTabBtn = screen.getByTestId("tab-overlaps");
    expect(overlapsTabBtn).toBeDefined();
    
    // Click overlaps tab
    fireEvent.click(overlapsTabBtn);

    // E is B overlap should be visible
    expect(screen.getByText("E")).toBeDefined();
    expect(screen.getByText("Existing Overlap (Read-Only)")).toBeDefined();
  });

  it("should call onConfirm with selected items when clicking merge button", () => {
    const confirmSpy = vi.fn();
    render(
      <MergePreview 
        newItems={mockNew} 
        overlaps={mockOverlaps} 
        onConfirm={confirmSpy} 
        onCancel={() => {}} 
      />
    );

    // Click confirm button
    const mergeBtn = screen.getByText("Merge Intelligence");
    fireEvent.click(mergeBtn);

    expect(confirmSpy).toHaveBeenCalledWith(mockNew);
  });

  it("should call onCancel when abort or close is triggered", () => {
    const cancelSpy = vi.fn();
    render(
      <MergePreview 
        newItems={mockNew} 
        overlaps={mockOverlaps} 
        onConfirm={() => {}} 
        onCancel={cancelSpy} 
      />
    );

    // Click abort button
    const abortBtn = screen.getByText("Abort Ingestion");
    fireEvent.click(abortBtn);

    expect(cancelSpy).toHaveBeenCalled();
  });
});
