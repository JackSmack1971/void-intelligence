import dagre from 'dagre';

/**
 * Web Worker for React Flow layouting using Dagre.
 * Keeps the main thread free during complex graph updates.
 */
self.onmessage = (event) => {
  const { nodes, edges } = event.data;

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 70, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node: any) => {
    g.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach((edge: any) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const positionedNodes = nodes.map((node: any) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 75,
        y: nodeWithPosition.y - 25,
      },
    };
  });

  self.postMessage({ nodes: positionedNodes, edges });
};
