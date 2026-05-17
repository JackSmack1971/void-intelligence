"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

export type SkillNodeData = {
  label: string;
  type: "root" | "category" | "agent";
  confidence?: number;
  role?: string;
};

const SkillNode = ({ data }: NodeProps<SkillNodeData>) => {
  const isAgent = data.type === "agent";
  const isRoot = data.type === "root";

  return (
    <div className={`
      relative px-3 py-2 rounded-lg border backdrop-blur-md transition-all duration-300 min-w-[140px]
      ${isRoot ? "bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]" : ""}
      ${data.type === "category" ? "bg-slate-900/40 border-slate-700/50 shadow-[0_0_8px_rgba(255,255,255,0.02)]" : ""}
      ${isAgent ? "bg-[#0d0e1b]/60 border-purple-500/40 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]" : ""}
    `}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center w-full">
          <span className={`text-[10px] font-bold tracking-widest uppercase opacity-50 ${isAgent ? "text-cyan-400" : ""}`}>
            {data.type}
          </span>
          {isAgent && data.confidence !== undefined && (
            <span className="text-[10px] font-mono font-bold text-cyan-400/80">
              {(data.confidence * 100).toFixed(0)}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isAgent && (
            <div 
              data-testid="availability-live-dot"
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
              title="Expert Model Active & Ready"
            />
          )}
          <span className={`text-xs font-medium truncate ${isRoot ? "text-cyan-100 font-bold" : "text-white/90"}`}>
            {data.label}
          </span>
        </div>
        
        {isAgent && data.confidence !== undefined && (
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative shadow-[0_0_4px_rgba(255,255,255,0.02)]">
            <div 
              className="h-full bg-gradient-to-r from-[#2563EB] to-[#DB2777] transition-all duration-1000" 
              style={{ width: `${data.confidence * 100}%` }}
            />
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

export default memo(SkillNode);
