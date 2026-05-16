"use client";

import React from "react";
import { Activity, BarChart3, Layers, Zap } from "lucide-react";

interface Props {
  complexity?: string;
  harmonyScore?: number;
  iterations?: number;
  k?: number;
}

export default function StrategyDashboard({ complexity, harmonyScore, iterations, k }: Props) {
  return (
    <div className="w-full bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-lg p-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
          Strategy Dashboard
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-green-500 font-bold">LIVE OPTIMIZATION</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Zap className="w-4 h-4 text-yellow-400" />}
          label="Complexity"
          value={complexity?.toUpperCase() || "MEDIUM"}
        />
        <StatCard 
          icon={<BarChart3 className="w-4 h-4 text-cyan-400" />}
          label="Harmony"
          value={harmonyScore ? `${(harmonyScore * 100).toFixed(0)}%` : "N/A"}
        />
        <StatCard 
          icon={<Layers className="w-4 h-4 text-purple-400" />}
          label="Experts (k)"
          value={k?.toString() || "3"}
        />
        <StatCard 
          icon={<Activity className="w-4 h-4 text-pink-400" />}
          label="Rounds"
          value={iterations?.toString() || "1"}
        />
      </div>

      {harmonyScore !== undefined && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex justify-between text-[10px] text-white/30 uppercase mb-2">
            <span>System Equilibrium</span>
            <span>{harmonyScore > 0.8 ? "STABLE" : "UNSETTLED"}</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${harmonyScore > 0.8 ? "bg-cyan-500" : "bg-yellow-500"}`}
              style={{ width: `${harmonyScore * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded p-3 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase font-bold tracking-wider">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-white/90">
        {value}
      </div>
    </div>
  );
}
