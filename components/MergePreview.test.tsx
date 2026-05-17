import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import MergePreview from "./MergePreview";

describe("MergePreview Component [GREEN]", () => {
  const added = [
    { subject: "AI", predicate: "uses", object: "LLM" },
    { subject: "User", predicate: "queries", object: "Database" }
  ];
  const modified = [
    {
      original: { subject: "Model", predicate: "generates", object: "Text" },
      updated: { subject: "Model", predicate: "generates", object: "Embeddings" }
    }
  ];
  const overlaps = [
    { subject: "Existing", predicate: "is", object: "Cached" }
  ];

  it("should switch tabs, show counts, and highlight original-to-updated diffs", () => {
    render(<MergePreview added={added} modified={modified} overlaps={overlaps} />);

    // Ingestible count
    expect(screen.getByText("2")).toBeDefined();
    // Modified and Overlaps both have count 1
    expect(screen.getAllByText("1")).toHaveLength(2);

    // Default tab
    expect(screen.getByText("Relations Pending Ingestion")).toBeDefined();

    // Click tab-modified
    const tabModified = screen.getByTestId("tab-modified");
    fireEvent.click(tabModified);
    expect(screen.getByText("Modified Target Relations")).toBeDefined();
    expect(screen.getByText("Original:")).toBeDefined();
    expect(screen.getByText("Updated:")).toBeDefined();

    // Click tab-overlaps
    const tabOverlaps = screen.getByTestId("tab-overlaps");
    fireEvent.click(tabOverlaps);
    expect(screen.getByText("Identified Database Duplicates")).toBeDefined();
  });

  it("should handle select/deselect and emit selected delta arrays on confirm", () => {
    const onConfirm = vi.fn();
    render(<MergePreview added={added} modified={modified} overlaps={overlaps} onConfirm={onConfirm} />);

    // Ingestible view, click Deselect All
    fireEvent.click(screen.getByText("Deselect All"));

    // Switch to Modified tab, click Deselect All
    fireEvent.click(screen.getByTestId("tab-modified"));
    fireEvent.click(screen.getByText("Deselect All"));

    // Merge button is disabled because both selections are empty
    const mergeBtn = screen.getByText("Merge Intelligence");
    expect(mergeBtn.hasAttribute("disabled")).toBe(true);

    // Re-select all on Modified
    fireEvent.click(screen.getByText("Select All"));

    // Switch to Ingestible (added) tab
    fireEvent.click(screen.getByTestId("tab-added"));
    // Re-select all on Added
    fireEvent.click(screen.getByText("Select All"));

    // Confirm
    fireEvent.click(mergeBtn);

    expect(onConfirm).toHaveBeenCalledWith(added, modified);
  });

  it("should fall back gracefully to legacy newItems and overlaps props for backward compatibility", () => {
    const onConfirm = vi.fn();
    render(<MergePreview newItems={added} overlaps={overlaps} onConfirm={onConfirm} />);

    // Ingestible count
    expect(screen.getByText("2")).toBeDefined();
    // Overlaps count
    expect(screen.getByText("1")).toBeDefined();

    // Confirm
    fireEvent.click(screen.getByText("Merge Intelligence"));
    expect(onConfirm).toHaveBeenCalledWith(added, []);
  });
});
