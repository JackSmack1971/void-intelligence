"use client";

import React, { useState } from "react";
import { Triplet } from "@/lib/kg/extraction";
import { Check, X, Info, ShieldAlert, Database } from "lucide-react";

interface Props {
  newItems: Triplet[];
  overlaps: Triplet[];
  onConfirm: (selected: Triplet[]) => void;
  onCancel: () => void;
}

export default function MergePreview({ newItems, overlaps, onConfirm, onCancel }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set(newItems.map((_, i) => i)));

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
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">New Knowledge</p>
              <p className="text-2xl font-mono text-blue-400">{newItems.length}</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 opacity-60">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Overlaps</p>
              <p className="text-2xl font-mono text-gray-400">{overlaps.length}</p>
            </div>
          </div>

          {/* Triplet List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300">New Relations to Ingest</h3>
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
              <div className="space-y-2">
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
                      selected.has(i) ? "bg-blue-900/20 border-blue-500/50" : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${
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
