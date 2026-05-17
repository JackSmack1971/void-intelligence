"use client";

import React from "react";
import { MessageSquare, Sparkles, BarChart3, ChevronRight, Eye, EyeOff, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  metrics?: {
    ksStatistic: number;
    harmonyScore: number;
    iterations: number;
  };
  debateLog?: any[];
  showDebate?: boolean;
  selectedAgents?: any[];
  matrix?: any;
  complexity?: string;
}

interface Props {
  message: Message;
  index: number;
  onToggleConsole: (index: number) => void;
  children?: React.ReactNode;
}

export default function ChatMessage({ message, index, onToggleConsole, children }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300 gap-3`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center relative shadow-[0_0_10px_rgba(168,85,247,0.15)] mt-1">
          <Bot className="w-4 h-4 text-purple-400" />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-gray-950 animate-pulse"></span>
        </div>
      )}

      <div className={`
        max-w-[85%] px-5 py-4 rounded-xl text-sm leading-relaxed relative group transition-all duration-300
        ${isUser 
          ? "bg-blue-600/10 backdrop-blur-md border border-blue-500/30 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.08)]" 
          : "bg-[#0f1122]/60 backdrop-blur-md border border-white/5 text-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.25)] hover:border-purple-500/20"
        }
      `}>
        {/* Message Content */}
        <div className="font-sans whitespace-pre-wrap">{message.content}</div>
        
        {/* Operational Telemetry Metrics Row */}
        {!isUser && message.metrics && (
          <>
            <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[10px] text-gray-500 uppercase tracking-wider font-mono">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center bg-blue-500/5 border border-blue-500/10 px-2 py-0.5 rounded-full text-blue-400">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Stability: {((1 - message.metrics.ksStatistic) * 100).toFixed(0)}%
                </span>
                <span className="flex items-center bg-purple-500/5 border border-purple-500/10 px-2 py-0.5 rounded-full text-purple-400">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Harmony: {((message.metrics.harmonyScore || 0) * 100).toFixed(0)}%
                </span>
                <span className="flex items-center bg-pink-500/5 border border-pink-500/10 px-2 py-0.5 rounded-full text-pink-400">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  Turns: {message.metrics.iterations}
                </span>
              </div>
              
              <button 
                onClick={() => onToggleConsole(index)}
                className="flex items-center gap-1.5 hover:text-purple-400 transition-colors bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-gray-400 hover:border-purple-500/30"
              >
                {message.showDebate ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {message.showDebate ? "Hide Strategic Console" : "Open Strategic Console"}
              </button>
            </div>

            {/* Display StrategyDashboard and DebateGraph children inline if expanded */}
            {message.showDebate && children && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                {children}
              </div>
            )}
          </>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.15)] mt-1">
          <User className="w-4 h-4 text-blue-400" />
        </div>
      )}
    </div>
  );
}
