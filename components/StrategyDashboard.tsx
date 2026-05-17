"use client";

import React, { useState } from "react";
import { Activity, BarChart3, Layers, Zap } from "lucide-react";

interface Props {
  complexity?: string;
  harmonyScore?: number;
  iterations?: number;
  k?: number;
}

export default function StrategyDashboard({ complexity, harmonyScore, iterations, k }: Props) {
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  const metricExplanations: Record<string, { title: string; desc: string }> = {
    complexity: {
      title: "Query Complexity Tier",
      desc: "Pre-flight scheduling classifications categorize user inputs into SIMPLE, STANDARD, or COMPLEX. Higher-tier complexity triggers judge model consensus escalation loops to ensure structural reasoning accuracy."
    },
    harmony: {
      title: "Consensus Harmony Index",
      desc: "Measures semantic alignment across expert agents using Kolmogorov-Smirnov distribution testing. Harmony >= 80% marks solid system equilibrium, triggering immediate early-exit optimizations."
    },
    k: {
      title: "Active Expert Pool Size (k)",
      desc: "The total number of expert LLM nodes spawned in parallel to co-evaluate this reasoning wave. Pool sizes scale dynamically based on scheduling complexity classifications."
    },
    rounds: {
      title: "Consensus Refinement Rounds",
      desc: "Indicates the count of debate iterations completed between spawned experts. High iterations represent adversarial debate refinement before satisfying stability exits."
    }
  };

  const handleCardClick = (metric: string) => {
    setActiveMetric(prev => prev === metric ? null : metric);
  };

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
          isActive={activeMetric === "complexity"}
          onClick={() => handleCardClick("complexity")}
        />
        <StatCard 
          icon={<BarChart3 className="w-4 h-4 text-cyan-400" />}
          label="Harmony"
          value={harmonyScore !== undefined ? `${(harmonyScore * 100).toFixed(0)}%` : "N/A"}
          isActive={activeMetric === "harmony"}
          onClick={() => handleCardClick("harmony")}
        />
        <StatCard 
          icon={<Layers className="w-4 h-4 text-purple-400" />}
          label="Experts (k)"
          value={k?.toString() || "3"}
          isActive={activeMetric === "k"}
          onClick={() => handleCardClick("k")}
        />
        <StatCard 
          icon={<Activity className="w-4 h-4 text-pink-400" />}
          label="Rounds"
          value={iterations?.toString() || "1"}
          isActive={activeMetric === "rounds"}
          onClick={() => handleCardClick("rounds")}
        />
      </div>

      {activeMetric && metricExplanations[activeMetric] && (
        <div 
          data-testid="metric-explanation-box"
          className="mt-4 p-4 rounded-lg bg-purple-950/20 border border-purple-500/30 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300 relative"
        >
          <button 
            onClick={() => setActiveMetric(null)} 
            className="absolute top-2 right-2 text-white/30 hover:text-white/80 transition-colors"
          >
            <span className="text-xs font-bold font-mono">ESC</span>
          </button>
          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            {metricExplanations[activeMetric].title}
          </h4>
          <p className="text-xs text-white/70 leading-relaxed">
            {metricExplanations[activeMetric].desc}
          </p>
        </div>
      )}

      {harmonyScore !== undefined && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex justify-between text-[10px] text-white/30 uppercase mb-2">
            <span>System Equilibrium</span>
            <span>{harmonyScore > 0.8 ? "STABLE" : "UNSETTLED"}</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative shadow-[0_0_8px_rgba(255,255,255,0.02)]">
            <div 
              className={`h-full transition-all duration-1000 relative ${
                harmonyScore > 0.8 
                  ? "bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" 
                  : "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              }`}
              style={{ width: `${harmonyScore * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
}

function StatCard({ icon, label, value, isActive, onClick }: StatCardProps) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`text-left bg-white/5 border rounded p-3 flex flex-col gap-1 hover:bg-white/10 hover:border-white/15 transition-all duration-200 cursor-pointer focus:outline-none ${
        isActive ? "border-purple-500/50 bg-purple-950/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]" : "border-white/5"
      }`}
    >
      <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase font-bold tracking-wider">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-white/90">
        {value}
      </div>
    </button>
  );
}
