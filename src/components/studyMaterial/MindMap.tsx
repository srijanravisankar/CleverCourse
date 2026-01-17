"use client"

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
} from '@xyflow/react';

// Required styles
import '@xyflow/react/dist/style.css';

const colors = {
  level0: '#FF6B6B', // Red-ish Root
  level1: '#4ECDC4', // Teal Branches
  level2: '#45B7D1', // Blue Sub-branches
  edge: '#CBD5E1',
};

/**
 * CUSTOM NODE COMPONENT
 * This needs to be a separate component for React Flow to handle it correctly.
 */
const MindMapNode = ({ data }: any) => {
  return (
    <div
      className="transition-all duration-300 ease-in-out hover:scale-110"
      style={{
        padding: '12px 16px',
        borderRadius: '12px',
        background: data.color,
        color: '#fff',
        fontSize: data.size === 'small' ? '13px' : '15px',
        fontWeight: data.size === 'small' ? '500' : '600',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '2px solid rgba(255,255,255,0.3)',
        textAlign: 'center',
        minWidth: '120px',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Handles tell React Flow where to connect the lines */}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      {data.label}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

// Define node types outside the component to prevent re-renders
const nodeTypes = {
  mindNode: MindMapNode,
};

interface MindMapProps {
  data: {
    label: string;
    children: Array<{
      label: string;
      children?: Array<{ label: string }>;
    }>;
  };
}

export function MindMap({ data: mindMapData }: MindMapProps) {
  /**
   * Generates the radial layout positions
   */
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let nodeId = 0;

    // 1. Root Node
    const rootId = `node-${nodeId++}`;
    nodes.push({
      id: rootId,
      type: 'mindNode',
      data: { label: mindMapData.label, color: colors.level0, size: 'large' },
      position: { x: 0, y: 0 },
    });

    // 2. Branch Nodes (Level 1)
    const level1Count = mindMapData.children.length;
    const angleStep = (2 * Math.PI) / level1Count;
    const radius1 = 250;

    mindMapData.children.forEach((branch, branchIdx) => {
      const angle = angleStep * branchIdx - Math.PI / 2;
      const x1 = Math.cos(angle) * radius1;
      const y1 = Math.sin(angle) * radius1;

      const branchId = `node-${nodeId++}`;
      nodes.push({
        id: branchId,
        type: 'mindNode',
        data: { label: branch.label, color: colors.level1, size: 'medium' },
        position: { x: x1, y: y1 },
      });

      edges.push({
        id: `e-${rootId}-${branchId}`,
        source: rootId,
        target: branchId,
        animated: true,
        style: { stroke: colors.edge, strokeWidth: 3 },
      });

      // 3. Leaf Nodes (Level 2)
      if (branch.children) {
        const childCount = branch.children.length;
        const radius2 = 180;
        
        branch.children.forEach((child, childIdx) => {
          // Spread children around the parent branch
          const spreadAngle = 0.8; 
          const childAngle = angle + (childIdx - (childCount - 1) / 2) * spreadAngle;
          const x2 = x1 + Math.cos(childAngle) * radius2;
          const y2 = y1 + Math.sin(childAngle) * radius2;

          const childId = `node-${nodeId++}`;
          nodes.push({
            id: childId,
            type: 'mindNode',
            data: { label: child.label, color: colors.level2, size: 'small' },
            position: { x: x2, y: y2 },
          });

          edges.push({
            id: `e-${branchId}-${childId}`,
            source: branchId,
            target: childId,
            style: { stroke: colors.edge, strokeWidth: 2 },
          });
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [mindMapData]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    // <div className="w-full h-[600px] bg-slate-50/50 border rounded-2xl shadow-inner relative overflow-hidden">
    <div className="w-full aspect-video max-h-[500px] bg-slate-50/50 border rounded-2xl shadow-inner relative overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes} // Crucial: Registering the custom node
        fitView
      >
        <Background color="#cbd5e1" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}