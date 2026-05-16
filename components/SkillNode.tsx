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
      relative px-3 py-2 rounded-lg border backdrop-blur-md transition-all duration-300
      ${isRoot ? "bg-cyan-500/10 border-cyan-500/50" : ""}
      ${data.type === "category" ? "bg-white/5 border-white/20" : ""}
      ${isAgent ? "bg-white/10 border-white/30 hover:border-cyan-400/50" : ""}
    `}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="flex flex-col gap-1">
        <span className={`text-[10px] font-bold tracking-widest uppercase opacity-50 ${isAgent ? "text-cyan-400" : ""}`}>
          {data.type}
        </span>
        <span className={`text-xs font-medium ${isRoot ? "text-cyan-100" : "text-white/90"}`}>
          {data.label}
        </span>
        
        {isAgent && data.confidence !== undefined && (
          <div className="w-full h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-cyan-400 transition-all duration-1000" 
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
