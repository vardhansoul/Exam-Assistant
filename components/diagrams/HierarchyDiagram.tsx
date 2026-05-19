import React from 'react';

export interface HierarchyNodeData {
  name: string;
  children?: HierarchyNodeData[];
}
export interface HierarchyDiagramData {
  title: string;
  root: HierarchyNodeData;
}

const NODE_WIDTH = 120;
const NODE_HEIGHT = 50;
const H_GAP = 40;
const V_GAP = 60;

type NodePosition = { x: number; y: number; node: HierarchyNodeData };
type PositionsMap = { [key: string]: NodePosition };

// This is a simple recursive layout algorithm. It won't handle complex trees perfectly.
const calculatePositions = (node: HierarchyNodeData, level = 0, xOffset = 0, idPrefix = 'root'): { positions: PositionsMap, width: number } => {
  let positions: PositionsMap = {};
  let childrenWidth = 0;

  if (node.children && node.children.length > 0) {
    let childX = xOffset;
    node.children.forEach((child, index) => {
      const childId = `${idPrefix}-${index}`;
      const childPositions = calculatePositions(child, level + 1, childX, childId);
      Object.assign(positions, childPositions.positions);
      childX += childPositions.width + H_GAP;
    });
    childrenWidth = childX - xOffset - H_GAP;
  }

  const width = Math.max(NODE_WIDTH, childrenWidth);
  const x = xOffset + (width - NODE_WIDTH) / 2;
  const y = level * (NODE_HEIGHT + V_GAP);
  positions[idPrefix] = { x, y, node };
  
  return { positions, width };
};

const HierarchyNode: React.FC<{ nodeId: string; nodeData: NodePosition; allPositions: PositionsMap; }> = ({ nodeId, nodeData, allPositions }) => {
  const { x, y, node } = nodeData;

  return (
    <g>
      {/* Box */}
      <rect
        x={x}
        y={y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx="8"
        fill="#eef2ff"
        stroke="#a5b4fc"
        strokeWidth="2"
      />
      <foreignObject x={x} y={y} width={NODE_WIDTH} height={NODE_HEIGHT}>
        <div className="w-full h-full flex items-center justify-center text-center p-2">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 select-none">{node.name}</p>
        </div>
      </foreignObject>
      
      {/* Lines to children */}
      {node.children && node.children.map((child: HierarchyNodeData, index: number) => {
          const childId = `${nodeId}-${index}`;
          const childPos = allPositions[childId];
          if (!childPos) return null;

          return (
              <path
                  key={index}
                  d={`M ${x + NODE_WIDTH / 2},${y + NODE_HEIGHT} V ${y + NODE_HEIGHT + V_GAP / 2} H ${childPos.x + NODE_WIDTH / 2} V ${childPos.y}`}
                  stroke="#a5b4fc"
                  strokeWidth="2"
                  fill="none"
              />
          );
      })}
    </g>
  );
};


export const HierarchyDiagram: React.FC<{ data: any }> = ({ data }) => {
  let normalizedData = data;
  
  // Handle flat list of nodes if provided instead of a tree
  if (data?.nodes && Array.isArray(data.nodes) && data.nodes.length > 0) {
      // If it's already a tree (first node has children), just use it
      if (data.nodes[0].children) {
          const convertNode = (node: any): HierarchyNodeData => ({
              name: node.label || node.name || node.id || 'Node',
              children: node.children ? node.children.map(convertNode) : undefined
          });
          normalizedData = {
              title: data.title,
              root: convertNode(data.nodes[0])
          };
      } else {
          // Try to build a tree from flat list using id/parentId
          const nodeMap: { [key: string]: any } = {};
          data.nodes.forEach((node: any) => {
              nodeMap[node.id] = { ...node, children: [] };
          });
          
          let root = null;
          data.nodes.forEach((node: any) => {
              if (node.parentId && nodeMap[node.parentId]) {
                  nodeMap[node.parentId].children.push(nodeMap[node.id]);
              } else if (!root) {
                  root = nodeMap[node.id];
              }
          });

          const convertNode = (node: any): HierarchyNodeData => ({
              name: node.label || node.name || node.id || 'Node',
              children: node.children && node.children.length > 0 ? node.children.map(convertNode) : undefined
          });

          normalizedData = {
              title: data.title,
              root: root ? convertNode(root) : null
          };
      }
  }

  if (!normalizedData || !normalizedData.root) {
    return <div className="text-red-500 p-4 border rounded bg-red-50">Invalid hierarchy data. Please ensure root node is provided.</div>;
  }

  const { positions, width } = calculatePositions(normalizedData.root);
  const allNodes: NodePosition[] = Object.values(positions);
  const totalHeight = allNodes.reduce((max, node) => Math.max(max, node.y + NODE_HEIGHT), 0);

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 my-4 shadow-sm overflow-x-auto">
      <h4 className="text-center font-bold text-slate-700 dark:text-slate-200 mb-4">{normalizedData.title}</h4>
      <svg viewBox={`0 -10 ${width} ${totalHeight + 20}`} className="w-full h-auto min-w-[300px]">
        <title>{normalizedData.title}</title>
        {Object.entries(positions).map(([nodeId, nodeData], index) => (
          <HierarchyNode key={index} nodeId={nodeId} nodeData={nodeData} allPositions={positions} />
        ))}
      </svg>
    </div>
  );
};