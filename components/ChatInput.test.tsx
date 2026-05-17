import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import ChatInput from "./ChatInput";

// Mock Lucide icons
vi.mock("lucide-react", () => {
  const React = require("react");
  const createMockIcon = (name: string) => {
    return (props: any) => React.createElement("div", { "data-testid": `icon-${name}`, ...props });
  };
  return {
    Send: createMockIcon("send"),
    Paperclip: createMockIcon("paperclip"),
    Mic: createMockIcon("mic")
  };
});

describe("ChatInput Component [GREEN]", () => {
  const handleSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("should render textarea, action buttons, and icons", () => {
    render(<ChatInput onSend={handleSend} />);
    expect(screen.getByPlaceholderText("Type a message...")).toBeDefined();
    expect(screen.getByTestId("icon-paperclip")).toBeDefined();
    expect(screen.getByTestId("icon-mic")).toBeDefined();
    expect(screen.getByTestId("icon-send")).toBeDefined();
  });

  it("should trigger onSend callback on submitting query", () => {
    render(<ChatInput onSend={handleSend} />);
    const textarea = screen.getByPlaceholderText("Type a message...");

    fireEvent.change(textarea, { target: { value: "Implement Graph-of-Agents consensus" } });
    const form = textarea.closest("form");
    expect(form).toBeDefined();

    if (form) {
      fireEvent.submit(form);
      expect(handleSend).toHaveBeenCalledWith("Implement Graph-of-Agents consensus");
    }
  });

  it("should invoke submit trigger on Enter keydown without Shift", () => {
    render(<ChatInput onSend={handleSend} />);
    const textarea = screen.getByPlaceholderText("Type a message...");

    fireEvent.change(textarea, { target: { value: "Verify early exits" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(handleSend).toHaveBeenCalledWith("Verify early exits");
  });

  it("should allow multiline newlines on Shift+Enter keydown", () => {
    render(<ChatInput onSend={handleSend} />);
    const textarea = screen.getByPlaceholderText("Type a message...");

    fireEvent.change(textarea, { target: { value: "Line 1" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(handleSend).not.toHaveBeenCalled();
  });

  it("should trigger active mic recording pulse state and toggle off cleanly", async () => {
    vi.useFakeTimers();
    render(<ChatInput onSend={handleSend} />);

    const micBtn = screen.getByTestId("icon-mic").closest("button");
    expect(micBtn).toBeDefined();

    if (micBtn) {
      // Toggle ON
      await act(async () => {
        fireEvent.click(micBtn);
      });
      expect(micBtn.className).toContain("text-red-400");

      // Toggle OFF before timer finishes
      await act(async () => {
        fireEvent.click(micBtn);
      });
      expect(micBtn.className).not.toContain("text-red-400");
    }
  });

  it("should append simulated transcription after recording timer completion", async () => {
    vi.useFakeTimers();
    render(<ChatInput onSend={handleSend} />);

    const micBtn = screen.getByTestId("icon-mic").closest("button");
    const textarea = screen.getByPlaceholderText("Type a message...") as HTMLTextAreaElement;

    if (micBtn) {
      await act(async () => {
        fireEvent.click(micBtn);
      });
      
      // Advance timer by 2 seconds
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(textarea.value).not.toBe("");
      expect(micBtn.className).not.toContain("text-red-400");
    }
  });
});
