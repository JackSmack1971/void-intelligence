"use client";
 
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge,
  MarkerType,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { KnowledgeTriplet as Triplet } from '@/lib/goa/types';
import { getPredicateColor } from '@/lib/utils/colors';
import { toast } from 'sonner';
import { Trash2, Filter, Search, RotateCcw, X, ShieldAlert } from 'lucide-react';

interface Props {
  initialTriplets?: Triplet[];
}

const EMPTY_TRIPLETS: Triplet[] = [];

function GraphInner({ initialTriplets = EMPTY_TRIPLETS }: Props) {
  const safeInitialTriplets = useMemo(() => initialTriplets || EMPTY_TRIPLETS, [initialTriplets]);
  const [triplets, setTriplets] = useState<Triplet[]>(safeInitialTriplets);
  const [isDestructionMode, setIsDestructionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePredicates, setActivePredicates] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { setCenter } = useReactFlow();

  // Extract unique predicates safely
  const allPredicates = useMemo(() => {
    const set = new Set<string>();
    safeInitialTriplets.forEach(t => {
      if (t && t.predicate) set.add(t.predicate);
    });
    return Array.from(set).sort();
  }, [safeInitialTriplets]);

  // Initialize active predicates
  useEffect(() => {
    setActivePredicates(new Set(allPredicates));
  }, [allPredicates]);

  // Keep triplets in sync with initialTriplets updates
  useEffect(() => {
    setTriplets(safeInitialTriplets);
  }, [safeInitialTriplets]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLayouting, setIsLayouting] = useState(false);

  // Layouting via Web Worker
  useEffect(() => {
    const nodesMap = new Map<string, Node>();
    const edgesList: Edge[] = [];

    const filteredTriplets = (triplets || []).filter(t => 
      t && t.subject && t.predicate && t.object &&
      activePredicates.has(t.predicate) && 
      (searchQuery === "" || 
       t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
       t.object.toLowerCase().includes(searchQuery.toLowerCase()) ||
       t.predicate.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filteredTriplets.forEach((t) => {
      const color = getPredicateColor(t.predicate);
      if (!nodesMap.has(t.subject)) {
        nodesMap.set(t.subject, {
          id: t.subject,
          data: { label: t.subject },
          position: { x: 0, y: 0 },
          style: {
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#f8fafc',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '8px',
            fontSize: '11px',
            padding: '8px',
            width: 120,
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          },
        });
      }
      if (!nodesMap.has(t.object)) {
        nodesMap.set(t.object, {
          id: t.object,
          data: { label: t.object },
          position: { x: 0, y: 0 },
          style: {
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#f8fafc',
            backdropFilter: 'blur(8px)',
            border: `2px solid ${color}`,
            borderRadius: '8px',
            fontSize: '11px',
            padding: '8px',
            width: 120,
            textAlign: 'center',
            boxShadow: `0 4px 12px ${color}20`,
          },
        });
      }
      edgesList.push({
        id: `e-${t.subject}-${t.predicate}-${t.object}`,
        source: t.subject,
        target: t.object,
        label: t.predicate,
        labelStyle: { fill: color, fontSize: '9px', fontWeight: 'bold' },
        style: { stroke: color, strokeWidth: 2, opacity: 0.8 },
        data: { triplet: t },
        markerEnd: { type: MarkerType.ArrowClosed, color: color },
      });
    });

    const rawNodes = Array.from(nodesMap.values());
    if (rawNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    if (process.env.NODE_ENV === "test") {
      setNodes(rawNodes);
      setEdges(edgesList);
      setIsLayouting(false);
      return;
    }

    setIsLayouting(true);
    const workerPath = '@/lib/utils/layout.worker.ts';
    const worker = new Worker(new URL(workerPath, import.meta.url));
    worker.postMessage({ nodes: rawNodes, edges: edgesList });
    
    worker.onmessage = (e) => {
      setNodes(e.data.nodes);
      setEdges(e.data.edges);
      setIsLayouting(false);
      worker.terminate();
    };

    return () => worker.terminate();
  }, [triplets, activePredicates, searchQuery, setNodes, setEdges]);

  const handleDelete = useCallback(async (triplet: Triplet) => {
    // 1. Optimistic UI update: remove from local state
    setTriplets(prev => prev.filter(t => 
      !(t.subject === triplet.subject && t.predicate === triplet.predicate && t.object === triplet.object)
    ));

    // 2. Perform DB delete immediately
    try {
      const response = await fetch('/api/triplets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(triplet),
      });
      if (!response.ok) {
        throw new Error("Failed to delete from database");
      }
    } catch (err) {
      console.error("Failed to delete triplet:", err);
      // Revert optimistic update on failure
      setTriplets(prev => [...prev, triplet]);
      toast.error("Failed to prune memory", {
        description: "An error occurred while communicating with the database."
      });
      return;
    }

    // 3. Show success toast with Undo capabilities
    toast.success("Memory pruned", {
      description: `${triplet.subject} ${triplet.predicate} ${triplet.object}`,
      action: {
        label: "Undo",
        onClick: async () => {
          // Re-insert into DB
          try {
            const response = await fetch('/api/triplets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(triplet),
            });
            if (!response.ok) throw new Error("Failed to restore to database");
            // Restore local UI state
            setTriplets(prev => [...prev, triplet]);
            toast.success("Memory restored");
          } catch (restoreErr) {
            console.error("Failed to restore triplet:", restoreErr);
            toast.error("Failed to restore memory", {
              description: "Could not write back to the database."
            });
          }
        }
      }
    });
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (isDestructionMode && edge.data && edge.data.triplet) {
      handleDelete(edge.data.triplet);
    }
  }, [isDestructionMode, handleDelete]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (searchQuery === "") {
      setSearchQuery(node.id);
    } else {
      setSearchQuery("");
    }
    setCenter(node.position.x + 60, node.position.y + 20, { zoom: 1.5, duration: 800 });
  }, [searchQuery, setCenter]);

  return (
    <div className={`w-full h-full relative group transition-all duration-300 rounded-lg overflow-hidden ${
      isDestructionMode 
        ? "border-2 border-red-500/50 shadow-[inset_0_0_30px_rgba(239,68,68,0.15)] ring-2 ring-red-500/10 animate-pulse-subtle" 
        : "border border-transparent"
    }`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={onEdgeClick}
        onNodeClick={onNodeClick}
        fitView
        className="bg-gray-950/20"
      >
        <Background color="#1e293b" gap={24} size={1} />
        
        {/* Void Control Panel */}
        <Panel position="top-right" className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-xl border border-gray-800 p-2 rounded-lg shadow-2xl">
            <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text"
                placeholder="Search Void..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-950 border border-gray-800 rounded-md py-1.5 pl-9 pr-3 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50 w-48 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3 h-3 text-gray-500 hover:text-white" />
                </button>
              )}
            </div>
            
            <div className="w-px h-6 bg-gray-800 mx-1" />
            
            <button 
              onClick={() => setIsDestructionMode(!isDestructionMode)}
              className={`p-2 rounded-md transition-all ${
                isDestructionMode 
                ? "bg-red-500/20 text-red-500 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                : "bg-gray-800 text-gray-400 border border-transparent hover:text-white"
              }`}
              title={isDestructionMode ? "Destruction Mode Active" : "Enter Destruction Mode"}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 rounded-md transition-all ${
                isFilterOpen 
                ? "bg-purple-500/20 text-purple-500 border border-purple-500/50" 
                : "bg-gray-800 text-gray-400 border border-transparent hover:text-white"
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => setCenter(0, 0, { zoom: 1, duration: 800 })}
              className="p-2 bg-gray-800 text-gray-400 rounded-md hover:text-white border border-transparent transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="bg-gray-900/90 backdrop-blur-2xl border border-gray-800 p-4 rounded-lg shadow-2xl w-56 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Filter Predicates</h3>
                <button onClick={() => setActivePredicates(new Set(allPredicates))} className="text-[9px] text-purple-400 hover:underline">Reset All</button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                {allPredicates.map(pred => (
                  <label key={pred} className="flex items-center gap-3 cursor-pointer group/label">
                    <input 
                      type="checkbox"
                      checked={activePredicates.has(pred)}
                      onChange={() => {
                        const next = new Set(activePredicates);
                        if (next.has(pred)) next.delete(pred);
                        else next.add(pred);
                        setActivePredicates(next);
                      }}
                      className="hidden"
                    />
                    <div className={`w-3 h-3 rounded-full transition-all border ${
                      activePredicates.has(pred) 
                      ? "bg-purple-500 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]" 
                      : "bg-gray-800 border-gray-700"
                    }`} />
                    <span className={`text-xs transition-colors ${activePredicates.has(pred) ? "text-gray-200" : "text-gray-500 group-hover/label:text-gray-400"}`}>
                      {pred}
                    </span>
                    <div className="ml-auto w-1 h-1 rounded-full" style={{ backgroundColor: getPredicateColor(pred) }} />
                  </label>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <Panel position="bottom-left">
          <div className="flex flex-col gap-1">
            {isLayouting && (
              <div className="text-[10px] text-purple-400 animate-pulse bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 w-fit">
                Recalculating Void Topology...
              </div>
            )}
            <div className="text-[9px] uppercase tracking-[0.2em] font-medium text-gray-600 bg-black/40 px-3 py-1 rounded-full border border-white/5">
              Knowledge Visualization Layer • Interactive Pruning Active
            </div>
          </div>
        </Panel>

        <Panel position="bottom-right">
          {isDestructionMode && (
            <div className="flex items-center gap-2 bg-red-950/90 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-md text-[10px] uppercase tracking-wider font-semibold animate-pulse shadow-lg">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              Destruction Mode Active • Click Edges to Prune
            </div>
          )}
        </Panel>

        <Controls className="bg-gray-900 border-gray-800 fill-white" />
      </ReactFlow>
    </div>
  );
}

export default function KnowledgeGraph(props: Props) {
  return (
    <ReactFlowProvider>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
}
