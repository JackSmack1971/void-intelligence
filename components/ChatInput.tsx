"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic } from "lucide-react";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const voiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const triggerFileUpload = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInput(prev => {
        const divider = prev.trim() ? "\n\n" : "";
        const extension = file.name.split('.').pop() || "txt";
        return `${prev}${divider}\`\`\`${extension}\n// [ATTACHMENT: ${file.name}]\n${text}\n\`\`\``;
      });

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
      }, 50);
    };
    reader.readAsText(file);
    // Reset file input value so same file can be uploaded again
    e.target.value = "";
  };

  const toggleRecording = () => {
    if (disabled) return;

    if (isRecording) {
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const simulatedQueries = [
        "Consolidate adjacent duplicate relationships and compute harmony composite score.",
        "Refine Graph-of-Agents consensus using the judge model escalation logic.",
        "Verify decentralized AES-GCM encrypted intelligence trail sharing."
      ];
      const randomQuery = simulatedQueries[Math.floor(Math.random() * simulatedQueries.length)];
      
      voiceTimeoutRef.current = setTimeout(() => {
        setInput(prev => prev.trim() ? `${prev}\n${randomQuery}` : randomQuery);
        setIsRecording(false);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
          }
        }, 50);
      }, 2000);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-md p-2 flex items-end space-x-2 focus-within:border-blue-500/50 transition-all shadow-lg relative"
    >
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.json,.md,.js,.ts,.tsx,.css"
        className="hidden"
        data-testid="hidden-file-input"
      />

      <button 
        type="button" 
        onClick={triggerFileUpload}
        className="p-2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50 flex-shrink-0"
        disabled={disabled}
        title="Ingest local file attachment (.txt, .json, .md)"
      >
        <Paperclip className="w-5 h-5" />
      </button>
      
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type a message..."
        rows={1}
        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-200 placeholder:text-gray-500 disabled:opacity-50 resize-none max-h-[150px] py-2 focus:outline-none scrollbar-hide leading-relaxed"
      />
      
      <div className="flex items-center space-x-1 flex-shrink-0 pb-0.5">
        <button 
          type="button"
          onClick={toggleRecording}
          className={`p-2 rounded-md transition-all duration-300 disabled:opacity-50 ${
            isRecording 
              ? "text-red-400 bg-red-950/30 border border-red-500/40 animate-pulse shadow-[0_0_12px_rgba(248,113,113,0.3)]" 
              : "text-gray-500 hover:text-gray-300 border border-transparent"
          }`}
          disabled={disabled}
          title="Toggle Edge Voice Autonomy transcription mock"
        >
          <Mic className="w-5 h-5" />
        </button>
        <button 
          type="submit"
          disabled={disabled || !input.trim()}
          className="p-2 rounded-md bg-gradient-to-r from-[#2563EB] to-[#DB2777] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </form>
  );
}
