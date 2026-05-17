"use client";

import React, { useState } from "react";
import { KnowledgeTriplet as Triplet } from "@/lib/goa";
import { Check, X, Info, ShieldAlert, Database } from "lucide-react";

interface Props {
  newItems: Triplet[];
  overlaps: Triplet[];
  onConfirm?: (selected: Triplet[]) => void;
  onCancel?: () => void;
}

export default function MergePreview({ 
  newItems = [], 
  overlaps = [], 
  onConfirm = () => {}, 
  onCancel = () => {} 
}: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set(newItems.map((_, i) => i)));
  const [activeTab, setActiveTab] = useState<"new" | "overlaps">("new");

  const toggleAll = () => {
    if (selected.size === newItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(newItems.map((_, i) => i)));
    }
  };

  const handleConfirm = () => {
    onConfirm(newItems.filter((_, i) => selected.has(i)));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Database className="text-blue-400 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Incoming Intelligence Trail</h2>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Strategic Merge Preview</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* Summary Stats & Custom Visual Switcher */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              data-testid="tab-new"
              onClick={() => setActiveTab("new")}
              className={`p-4 rounded-lg border text-left transition-all ${
                activeTab === "new" 
                  ? "bg-blue-950/40 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.2)]" 
                  : "bg-gray-800/40 border-gray-700 hover:border-gray-600 opacity-70"
              }`}
            >
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Ingestible Relations</p>
              <p className="text-2xl font-mono text-blue-400 font-bold">{newItems.length}</p>
            </button>
            
            <button
              type="button"
              data-testid="tab-overlaps"
              onClick={() => setActiveTab("overlaps")}
              className={`p-4 rounded-lg border text-left transition-all ${
                activeTab === "overlaps" 
                  ? "bg-amber-950/40 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]" 
                  : "bg-gray-800/40 border-gray-700 hover:border-gray-600 opacity-70"
              }`}
            >
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Conflicting Overlaps</p>
              <p className="text-2xl font-mono text-amber-500 font-bold">{overlaps.length}</p>
            </button>
          </div>

          {/* Triplet List View */}
          <div className="space-y-3">
            {activeTab === "new" ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Relations Pending Ingestion</h3>
                  <button onClick={toggleAll} className="text-xs text-blue-400 hover:underline">
                    {selected.size === newItems.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {newItems.length === 0 ? (
                  <div className="bg-gray-800/30 p-8 rounded-lg text-center border border-dashed border-gray-700">
                    <Info className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No new knowledge found in this trail.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                    {newItems.map((t, i) => (
                      <div 
                        key={i}
                        onClick={() => {
                          const next = new Set(selected);
                          if (next.has(i)) next.delete(i);
                          else next.add(i);
                          setSelected(next);
                        }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          selected.has(i) ? "bg-blue-900/20 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.05)]" : "bg-gray-800/50 border-gray-800 hover:border-gray-75"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                            selected.has(i) ? "bg-blue-500 border-blue-400" : "bg-transparent border-gray-600"
                          }`}>
                            {selected.has(i) && <Check size={14} className="text-white" />}
                          </div>
                          <div className="text-xs font-mono">
                            <span className="text-blue-300">{t.subject}</span>
                            <span className="text-gray-500 mx-1">→</span>
                            <span className="text-purple-300">{t.predicate}</span>
                            <span className="text-gray-500 mx-1">→</span>
                            <span className="text-green-300">{t.object}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Identified Database Duplicates</h3>
                  <span className="text-[10px] text-amber-500 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <ShieldAlert size={12} />
                    Existing Overlap (Read-Only)
                  </span>
                </div>

                {overlaps.length === 0 ? (
                  <div className="bg-gray-800/30 p-8 rounded-lg text-center border border-dashed border-gray-700">
                    <Info className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No overlapping relationships matched.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                    {overlaps.map((t, i) => (
                      <div 
                        key={i}
                        className="p-3 rounded-lg border bg-gray-900/40 border-amber-900/20 opacity-70 flex items-center justify-between cursor-not-allowed"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded flex items-center justify-center border border-amber-800/40 bg-amber-500/5">
                            <ShieldAlert size={12} className="text-amber-500" />
                          </div>
                          <div className="text-xs font-mono">
                            <span className="text-blue-300/80">{t.subject}</span>
                            <span className="text-gray-600 mx-1">→</span>
                            <span className="text-purple-300/80">{t.predicate}</span>
                            <span className="text-gray-600 mx-1">→</span>
                            <span className="text-green-300/80">{t.object}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-950 border-t border-gray-800 flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
          >
            Abort Ingestion
          </button>
          <button 
            onClick={handleConfirm}
            disabled={selected.size === 0 && newItems.length > 0}
            className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold hover:brightness-110 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            Merge Intelligence
          </button>
        </div>
      </div>
    </div>
  );
}
