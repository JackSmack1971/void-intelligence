"use client";

import React, { useMemo } from "react";
import ReactFlow, { Background, Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import SkillNode from "./SkillNode";
import { ModelCard } from "../lib/goa/types";

const nodeTypes = {
  skill: SkillNode,
};

interface SkillTreeProps {
  models: ModelCard[];
}

export default function SkillTree({ models }: SkillTreeProps) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Root Node
    nodes.push({
      id: "root",
      type: "skill",
      data: { label: "Void Registry", type: "root" },
      position: { x: 100, y: 0 },
    });

    const categories = new Set<string>();
    const subCategories = new Set<string>();

    models.forEach((model, mIdx) => {
      model.skills?.forEach((skillPath, sIdx) => {
        const parts = skillPath.split("/");
        const category = parts[0];
        const subCategory = parts[1];

        // Create Category Node
        if (!categories.has(category)) {
          categories.add(category);
          nodes.push({
            id: `cat-${category}`,
            type: "skill",
            data: { label: category, type: "category" },
            position: { x: categories.size * 180 - 100, y: 100 },
          });
          edges.push({
            id: `e-root-${category}`,
            source: "root",
            target: `cat-${category}`,
            animated: true,
            style: { stroke: "rgba(255,255,255,0.1)" },
          });
        }

        // Create SubCategory Node
        const subId = `sub-${category}-${subCategory}`;
        if (!subCategories.has(subId)) {
          subCategories.add(subId);
          nodes.push({
            id: subId,
            type: "skill",
            data: { label: subCategory, type: "category" },
            position: { x: categories.size * 180 - 100, y: 200 },
          });
          edges.push({
            id: `e-${category}-${subCategory}`,
            source: `cat-${category}`,
            target: subId,
            style: { stroke: "rgba(255,255,255,0.1)" },
          });
        }

        // Create Agent Node (connected to SubCategory)
        const agentNodeId = `agent-${model.id}-${subId}`;
        nodes.push({
          id: agentNodeId,
          type: "skill",
          data: { 
            label: model.name, 
            type: "agent", 
            role: model.role,
            confidence: Math.random() * 0.4 + 0.6 // Mock initial confidence
          },
          position: { x: categories.size * 180 - 100 + (mIdx * 10), y: 300 + (mIdx * 50) },
        });
        edges.push({
          id: `e-${subId}-${agentNodeId}`,
          source: subId,
          target: agentNodeId,
          style: { stroke: "rgba(255,255,255,0.2)" },
        });
      });
    });

    return { nodes, edges };
  }, [models]);

  return (
    <div className="w-full h-[500px] border-t border-white/10 mt-4 relative">
      <div className="absolute top-2 left-2 z-10">
        <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
          Tactical Intelligence Map
        </h3>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        zoomOnScroll={false}
        panOnScroll={false}
        preventScrolling={false}
      >
        <Background color="rgba(255, 255, 255, 0.03)" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
