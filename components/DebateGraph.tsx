"use client";

import React, { useMemo, useState, useCallback } from 'react';
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
  onIntervene?: (modelId: string, type: 'critique' | 'redirect') => void;
}

function DebateGraphInner({ debateLog, onIntervene }: Props) {
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setMenu({
        id: node.id,
        top: event.clientY,
        left: event.clientX,
      });
    },
    [setMenu]
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const { nodes, edges } = useMemo(() => {
    const nodesList: Node[] = [];
    const edgesList: Edge[] = [];
    
    const turns = Array.from(new Set(debateLog.map(e => e.turn))).sort((a, b) => a - b);
    const models = Array.from(new Set(debateLog.map(e => e.model)));
    
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
          cursor: 'context-menu'
        },
      });
    });

    debateLog.forEach((entry, i) => {
      const turnY = entry.turn * 150;
      const modelIdx = models.indexOf(entry.model);
      const nodeId = `turn-${entry.turn}-${entry.model}-${i}`;
      const isCritique = entry.content.includes('Critique of');
      const isIntervention = entry.content.includes('[INTERVENTION]');
      
      nodesList.push({
        id: nodeId,
        data: { 
          label: isIntervention
            ? `USER INTERVENTION`
            : isCritique 
            ? `Turn ${entry.turn}: Critique` 
            : `Turn ${entry.turn}: Refinement` 
        },
        position: { x: modelIdx * 200, y: turnY },
        style: {
          background: isIntervention ? 'rgba(147, 51, 234, 0.2)' : isCritique ? 'rgba(153, 27, 27, 0.2)' : 'rgba(21, 128, 61, 0.2)',
          color: isIntervention ? '#c084fc' : isCritique ? '#f87171' : '#4ade80',
          border: `1px solid ${isIntervention ? '#9333ea' : isCritique ? '#ef4444' : '#22c55e'}`,
          borderRadius: '4px',
          padding: '6px',
          width: 150,
          fontSize: '9px',
          textAlign: 'center',
          boxShadow: isIntervention ? '0 0 10px rgba(147, 51, 234, 0.3)' : 'none'
        },
      });

      edgesList.push({
        id: `e-${nodeId}`,
        source: entry.model,
        target: nodeId,
        animated: true,
        style: { stroke: isIntervention ? '#9333ea' : '#475569' },
        markerEnd: { type: MarkerType.ArrowClosed, color: isIntervention ? '#9333ea' : '#475569' },
      });
    });

    return { nodes: nodesList, edges: edgesList };
  }, [debateLog]);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // For mobile: treat click as context menu if it's an agent node
      if (node.id && !node.id.startsWith('turn-')) {
        setMenu({
          id: node.id,
          top: event.clientY,
          left: event.clientX,
        });
      }
    },
    [setMenu]
  );

  return (
    <div className="w-full h-[450px] bg-gray-950 border border-gray-800 rounded-lg overflow-hidden mt-4 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeContextMenu={onNodeContextMenu}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        className="bg-slate-950"
      >
        <Background color="#1e293b" gap={20} />
        <Panel position="top-left" className="bg-gray-900/80 p-2 rounded border border-gray-700 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          Strategic Interception Interface
        </Panel>
        <Panel position="bottom-right" className="p-2 text-[9px] text-gray-600 font-mono">
          [CLICK/LONG-PRESS AGENT TO INTERVENE]
        </Panel>
      </ReactFlow>

      {menu && (
        <div 
          className="fixed z-[1000] bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 w-48 animate-in fade-in zoom-in duration-150"
          style={{ top: menu.top, left: menu.left }}
        >
          <button 
            onClick={() => { onIntervene?.(menu.id, 'critique'); setMenu(null); }}
            className="w-full text-left px-4 py-2 text-xs text-white hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Add Manual Critique
          </button>
          <button 
            onClick={() => { onIntervene?.(menu.id, 'redirect'); setMenu(null); }}
            className="w-full text-left px-4 py-2 text-xs text-white/70 hover:bg-blue-600/50 transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Redirect Agent
          </button>
        </div>
      )}
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
