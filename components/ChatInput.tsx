"use client";

import React, { useState } from "react";
import { Send, Paperclip, Mic } from "lucide-react";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-md p-2 flex items-center space-x-2 focus-within:border-blue-500/50 transition-all shadow-lg"
    >
      <button 
        type="button" 
        className="p-2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
        disabled={disabled}
      >
        <Paperclip className="w-5 h-5" />
      </button>
      
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        placeholder="Type a message..."
        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-200 placeholder:text-gray-500 disabled:opacity-50"
      />
      
      <div className="flex items-center space-x-1">
        <button 
          type="button"
          className="p-2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
          disabled={disabled}
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
