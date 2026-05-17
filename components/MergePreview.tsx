"use client";

import React, { useState } from "react";
import { KnowledgeTriplet as Triplet } from "@/lib/goa";
import { Check, X, Info, ShieldAlert, Database, ArrowRight } from "lucide-react";

interface Props {
  added?: Triplet[];
  modified?: { original: Triplet; updated: Triplet }[];
  overlaps?: Triplet[];
  newItems?: Triplet[]; // Legacy fallback
  onConfirm?: (
    addedSelected: Triplet[],
    modifiedSelected: { original: Triplet; updated: Triplet }[]
  ) => void;
  onCancel?: () => void;
}

export default function MergePreview({ 
  added,
  modified,
  overlaps,
  newItems = [], 
  onConfirm = () => {}, 
  onCancel = () => {} 
}: Props) {
  // Graceful fallback for backward compatibility
  const resolvedAdded = added || newItems || [];
  const resolvedModified = modified || [];
  const resolvedOverlaps = overlaps || [];

  const [selectedAdded, setSelectedAdded] = useState<Set<number>>(
    new Set(resolvedAdded.map((_, i) => i))
  );
  const [selectedModified, setSelectedModified] = useState<Set<number>>(
    new Set(resolvedModified.map((_, i) => i))
  );

  const [activeTab, setActiveTab] = useState<"added" | "modified" | "overlaps">("added");

  const toggleAllAdded = () => {
    if (selectedAdded.size === resolvedAdded.length) {
      setSelectedAdded(new Set());
    } else {
      setSelectedAdded(new Set(resolvedAdded.map((_, i) => i)));
    }
  };

  const toggleAllModified = () => {
    if (selectedModified.size === resolvedModified.length) {
      setSelectedModified(new Set());
    } else {
      setSelectedModified(new Set(resolvedModified.map((_, i) => i)));
    }
  };

  const handleConfirm = () => {
    const finalAdded = resolvedAdded.filter((_, i) => selectedAdded.has(i));
    const finalModified = resolvedModified.filter((_, i) => selectedModified.has(i));
    onConfirm(finalAdded, finalModified);
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
          {/* Summary Stats & 3-Tab Glassmorphic Switcher */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              data-testid="tab-added"
              onClick={() => setActiveTab("added")}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeTab === "added" 
                  ? "bg-blue-950/40 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.2)]" 
                  : "bg-gray-800/40 border-gray-700 hover:border-gray-600 opacity-70"
              }`}
            >
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Ingestible</p>
              <p className="text-xl font-mono text-blue-400 font-bold">{resolvedAdded.length}</p>
            </button>
            
            <button
              type="button"
              data-testid="tab-modified"
              onClick={() => setActiveTab("modified")}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeTab === "modified" 
                  ? "bg-amber-950/40 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]" 
                  : "bg-gray-800/40 border-gray-700 hover:border-gray-600 opacity-70"
              }`}
            >
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Modified</p>
              <p className="text-xl font-mono text-amber-500 font-bold">{resolvedModified.length}</p>
            </button>

            <button
              type="button"
              data-testid="tab-overlaps"
              onClick={() => setActiveTab("overlaps")}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeTab === "overlaps" 
                  ? "bg-gray-950/40 border-gray-600 shadow-[0_0_12px_rgba(156,163,175,0.2)]" 
                  : "bg-gray-800/40 border-gray-700 hover:border-gray-600 opacity-70"
              }`}
            >
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Overlaps</p>
              <p className="text-xl font-mono text-gray-400 font-bold">{resolvedOverlaps.length}</p>
            </button>
          </div>

          {/* Triplet List View */}
          <div className="space-y-3">
            {activeTab === "added" && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Relations Pending Ingestion</h3>
                  <button onClick={toggleAllAdded} className="text-xs text-blue-400 hover:underline">
                    {selectedAdded.size === resolvedAdded.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {resolvedAdded.length === 0 ? (
                  <div className="bg-gray-800/30 p-8 rounded-lg text-center border border-dashed border-gray-700">
                    <Info className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No new knowledge found in this trail.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                    {resolvedAdded.map((t, i) => (
                      <div 
                        key={i}
                        onClick={() => {
                          const next = new Set(selectedAdded);
                          if (next.has(i)) next.delete(i);
                          else next.add(i);
                          setSelectedAdded(next);
                        }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          selectedAdded.has(i) ? "bg-blue-900/20 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.05)]" : "bg-gray-800/50 border-gray-800 hover:border-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                            selectedAdded.has(i) ? "bg-blue-500 border-blue-400" : "bg-transparent border-gray-600"
                          }`}>
                            {selectedAdded.has(i) && <Check size={14} className="text-white" />}
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
            )}

            {activeTab === "modified" && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Modified Target Relations</h3>
                  <button onClick={toggleAllModified} className="text-xs text-amber-400 hover:underline">
                    {selectedModified.size === resolvedModified.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {resolvedModified.length === 0 ? (
                  <div className="bg-gray-800/30 p-8 rounded-lg text-center border border-dashed border-gray-700">
                    <Info className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No modified relationships identified.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                    {resolvedModified.map((m, i) => {
                      const isSubChanged = m.original.subject.trim().toLowerCase() !== m.updated.subject.trim().toLowerCase();
                      const isPredChanged = m.original.predicate.trim().toLowerCase() !== m.updated.predicate.trim().toLowerCase();
                      const isObjChanged = m.original.object.trim().toLowerCase() !== m.updated.object.trim().toLowerCase();

                      return (
                        <div 
                          key={i}
                          onClick={() => {
                            const next = new Set(selectedModified);
                            if (next.has(i)) next.delete(i);
                            else next.add(i);
                            setSelectedModified(next);
                          }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                            selectedModified.has(i) ? "bg-amber-950/20 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.05)]" : "bg-gray-800/50 border-gray-800 hover:border-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                              selectedModified.has(i) ? "bg-amber-500 border-amber-400" : "bg-transparent border-gray-600"
                            }`}>
                              {selectedModified.has(i) && <Check size={14} className="text-white" />}
                            </div>
                            <div className="text-xs font-mono w-full flex flex-col gap-1">
                              {/* Original Row */}
                              <div className="opacity-45 text-[10px] flex items-center gap-1">
                                <span className="text-gray-400 font-bold uppercase tracking-wider">Original:</span>
                                <span className="text-blue-300 line-through">{m.original.subject}</span>
                                <span className="text-gray-500">→</span>
                                <span className="text-purple-300 line-through">{m.original.predicate}</span>
                                <span className="text-gray-500">→</span>
                                <span className="text-green-300 line-through">{m.original.object}</span>
                              </div>
                              {/* Updated Highlighted Diff Row */}
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">Updated:</span>
                                <span className={isSubChanged ? "text-amber-400 font-bold bg-amber-400/10 px-1 py-0.5 rounded border border-amber-400/20" : "text-blue-300"}>
                                  {m.updated.subject}
                                </span>
                                <span className="text-gray-500">→</span>
                                <span className={isPredChanged ? "text-amber-400 font-bold bg-amber-400/10 px-1 py-0.5 rounded border border-amber-400/20" : "text-purple-300"}>
                                  {m.updated.predicate}
                                </span>
                                <span className="text-gray-500">→</span>
                                <span className={isObjChanged ? "text-amber-400 font-bold bg-amber-400/10 px-1 py-0.5 rounded border border-amber-400/20" : "text-green-300"}>
                                  {m.updated.object}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === "overlaps" && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Identified Database Duplicates</h3>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 bg-gray-500/10 px-2 py-0.5 rounded border border-gray-500/20">
                    <ShieldAlert size={12} />
                    Existing Overlap (Read-Only)
                  </span>
                </div>

                {resolvedOverlaps.length === 0 ? (
                  <div className="bg-gray-800/30 p-8 rounded-lg text-center border border-dashed border-gray-700">
                    <Info className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No overlapping relationships matched.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                    {resolvedOverlaps.map((t, i) => (
                      <div 
                        key={i}
                        className="p-3 rounded-lg border bg-gray-900/40 border-gray-800 opacity-60 flex items-center justify-between cursor-not-allowed"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded flex items-center justify-center border border-gray-800 bg-gray-500/5">
                            <ShieldAlert size={12} className="text-gray-500" />
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
            disabled={(selectedAdded.size === 0 && selectedModified.size === 0) && (resolvedAdded.length > 0 || resolvedModified.length > 0)}
            className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold hover:brightness-110 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            Merge Intelligence
          </button>
        </div>
      </div>
    </div>
  );
}
