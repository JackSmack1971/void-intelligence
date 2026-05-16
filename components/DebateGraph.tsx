"use client";

import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Node, 
  Edge,
  MarkerType,
  ReactFlowProvider,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

interface DebateEntry {
  turn: number;
  model: string;
  content: string;
}

interface Props {
  debateLog: DebateEntry[];
}

function DebateGraphInner({ debateLog }: Props) {
  const { nodes, edges } = useMemo(() => {
    const nodesList: Node[] = [];
    const edgesList: Edge[] = [];
    
    // Group entries by turn
    const turns = Array.from(new Set(debateLog.map(e => e.turn))).sort((a, b) => a - b);
    const models = Array.from(new Set(debateLog.map(e => e.model)));
    
    // Create Agent Nodes (Top Row)
    models.forEach((model, i) => {
      nodesList.push({
        id: model,
        data: { label: model.split('/').pop()?.toUpperCase() || model },
        position: { x: i * 200, y: 0 },
        style: {
          background: 'rgba(30, 41, 59, 0.9)',
          color: '#60a5fa',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '10px',
          width: 150,
          fontSize: '10px',
          fontWeight: 'bold',
          textAlign: 'center',
          boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)',
        },
      });
    });

    // Create Turn Nodes and Critique Edges
    debateLog.forEach((entry, i) => {
      const turnY = entry.turn * 150;
      const modelIdx = models.indexOf(entry.model);
      
      const nodeId = `turn-${entry.turn}-${entry.model}-${i}`;
      
      // Determine if it's a critique
      const isCritique = entry.content.includes('Critique of');
      
      nodesList.push({
        id: nodeId,
        data: { 
          label: isCritique 
            ? `Turn ${entry.turn}: Critique` 
            : `Turn ${entry.turn}: Refinement` 
        },
        position: { x: modelIdx * 200, y: turnY },
        style: {
          background: isCritique ? 'rgba(153, 27, 27, 0.2)' : 'rgba(21, 128, 61, 0.2)',
          color: isCritique ? '#f87171' : '#4ade80',
          border: `1px solid ${isCritique ? '#ef4444' : '#22c55e'}`,
          borderRadius: '4px',
          padding: '6px',
          width: 150,
          fontSize: '9px',
          textAlign: 'center',
        },
      });

      // Edge from Agent to first turn, or previous turn to current
      const sourceId = entry.turn === 1 ? entry.model : `turn-${entry.turn-1}-${entry.model}`;
      // Note: This logic is simplified for visualization.
      
      edgesList.push({
        id: `e-${nodeId}`,
        source: entry.model,
        target: nodeId,
        animated: true,
        style: { stroke: '#475569' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' },
      });
    });

    return { nodes: nodesList, edges: edgesList };
  }, [debateLog]);

  return (
    <div className="w-full h-[400px] bg-gray-950 border border-gray-800 rounded-lg overflow-hidden mt-4">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        className="bg-slate-950"
      >
        <Background color="#1e293b" gap={20} />
        <Panel position="top-left" className="bg-gray-900/80 p-2 rounded border border-gray-700 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          Adversarial Exchange Trail
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function DebateGraph(props: Props) {
  if (!props.debateLog || props.debateLog.length === 0) return null;
  return (
    <ReactFlowProvider>
      <DebateGraphInner {...props} />
    </ReactFlowProvider>
  );
}
