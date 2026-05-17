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
import { ShieldAlert, GitFork, CornerDownRight, Sparkles } from "lucide-react";
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
        position: { x: i * 240, y: 0 },
        style: {
          background: 'rgba(13, 14, 27, 0.85)',
          color: '#c084fc',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          borderRadius: '10px',
          padding: '12px',
          width: 170,
          fontSize: '10px',
          fontWeight: 'bold',
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.15)',
          cursor: 'context-menu',
          fontFamily: 'monospace',
          letterSpacing: '0.05em'
        },
      });
    });

    debateLog.forEach((entry, i) => {
      const turnY = entry.turn * 150;
      const modelIdx = models.indexOf(entry.model);
      const nodeId = `turn-${entry.turn}-${entry.model}-${i}`;
      const isCritique = entry.content.includes('Critique of') || entry.content.includes('Critique:');
      const isIntervention = entry.content.includes('[INTERVENTION]');
      
      let background = 'rgba(6, 78, 59, 0.2)';
      let color = '#4ade80';
      let border = '1px solid #10b981';
      let glow = '0 0 12px rgba(16, 185, 129, 0.15)';

      if (isIntervention) {
        background = 'rgba(88, 28, 135, 0.3)';
        color = '#c084fc';
        border = '1px solid #a855f7';
        glow = '0 0 15px rgba(168, 85, 247, 0.25)';
      } else if (isCritique) {
        background = 'rgba(127, 29, 29, 0.25)';
        color = '#fbbf24';
        border = '1px solid #f59e0b';
        glow = '0 0 12px rgba(245, 158, 11, 0.15)';
      }

      nodesList.push({
        id: nodeId,
        data: { 
          label: isIntervention
            ? `USER INTERVENTION`
            : isCritique 
            ? `Turn ${entry.turn}: Critique` 
            : `Turn ${entry.turn}: Refinement` 
        },
        position: { x: modelIdx * 240, y: turnY },
        style: {
          background,
          color,
          border,
          borderRadius: '6px',
          padding: '8px',
          width: 170,
          fontSize: '9px',
          fontWeight: 'medium',
          textAlign: 'center',
          boxShadow: glow,
          fontFamily: 'monospace'
        },
      });

      edgesList.push({
        id: `e-${nodeId}`,
        source: entry.model,
        target: nodeId,
        animated: true,
        style: { stroke: isIntervention ? '#a855f7' : isCritique ? '#f59e0b' : '#10b981', strokeWidth: 1.5 },
        markerEnd: { 
          type: MarkerType.ArrowClosed, 
          color: isIntervention ? '#a855f7' : isCritique ? '#f59e0b' : '#10b981' 
        },
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
    <div className="w-full h-[450px] bg-gray-950 border border-gray-800 rounded-xl overflow-hidden mt-4 relative shadow-[0_0_24px_rgba(0,0,0,0.3)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeContextMenu={onNodeContextMenu}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        className="bg-slate-950"
      >
        <Background color="#111827" gap={20} size={1} />
        <Panel position="top-left" className="bg-gray-900/80 backdrop-blur-md p-2 rounded-lg border border-gray-800 text-[10px] text-gray-400 uppercase tracking-widest font-mono font-bold shadow-md">
          Strategic Interception Console
        </Panel>
        <Panel position="bottom-right" className="bg-gray-900/40 p-2 rounded text-[9px] text-gray-500 font-mono">
          [CLICK/LONG-PRESS AGENT TO INTERVENE]
        </Panel>
      </ReactFlow>

      {menu && (
        <div 
          className="fixed z-[1000] bg-gray-950/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl py-1.5 w-52 animate-in fade-in zoom-in-95 duration-100"
          style={{ top: menu.top, left: menu.left }}
        >
          <div className="px-3 py-1.5 border-b border-white/5 mb-1">
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">intercept action</p>
            <p className="text-[10px] font-bold text-cyan-400 truncate">{menu.id.split('/').pop()?.toUpperCase()}</p>
          </div>

          <button 
            onClick={() => { onIntervene?.(menu.id, 'critique'); setMenu(null); }}
            className="w-full text-left px-3 py-2 text-xs text-white hover:bg-red-500/20 hover:text-red-200 transition-all flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-red-500" />
            Add Manual Critique
          </button>
          
          <button 
            onClick={() => { onIntervene?.(menu.id, 'redirect'); setMenu(null); }}
            className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-cyan-500/20 hover:text-cyan-200 transition-all flex items-center gap-2"
          >
            <CornerDownRight className="w-4 h-4 text-cyan-400" />
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
