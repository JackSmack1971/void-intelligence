import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { Sidebar } from "./Sidebar";

// Mock SkillTree to isolate Sidebar tests cleanly
vi.mock("./SkillTree", () => ({
  default: () => <div data-testid="skill-tree-mock" />
}));

describe("Sidebar [RED]", () => {
  const onExportMock = vi.fn();
  const onImportMock = vi.fn();
  const onChangeTabMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render navigation links and triggers cleanly", () => {
    render(
      <Sidebar 
        onExport={onExportMock} 
        onImport={onImportMock} 
        activeTab="chat" 
        onChangeTab={onChangeTabMock} 
      />
    );
    expect(screen.getByText("Conversations")).toBeDefined();
    expect(screen.getByText("Capabilities")).toBeDefined();
    expect(screen.getByText("Knowledge Graph")).toBeDefined();
    expect(screen.getByTestId("skill-tree-mock")).toBeDefined();
  });

  it("should trigger onChangeTab callback when tab items are clicked", () => {
    render(
      <Sidebar 
        onExport={onExportMock} 
        onImport={onImportMock} 
        activeTab="chat" 
        onChangeTab={onChangeTabMock} 
      />
    );

    const capabilitiesTab = screen.getByText("Capabilities");
    fireEvent.click(capabilitiesTab);
    expect(onChangeTabMock).toHaveBeenCalledWith("capabilities");

    const graphTab = screen.getByText("Knowledge Graph");
    fireEvent.click(graphTab);
    expect(onChangeTabMock).toHaveBeenCalledWith("graph");
  });

  it("should trigger export and import callbacks cleanly", () => {
    render(
      <Sidebar 
        onExport={onExportMock} 
        onImport={onImportMock} 
        activeTab="chat" 
        onChangeTab={onChangeTabMock} 
      />
    );

    const exportBtn = screen.getByText("Export");
    fireEvent.click(exportBtn);
    expect(onExportMock).toHaveBeenCalled();

    const importBtn = screen.getByText("Import");
    fireEvent.click(importBtn);
    expect(onImportMock).toHaveBeenCalled();
  });
});
