import React from 'react';

export interface CycleStep {
  label: string;
}

export interface CycleDiagramData {
  title: string;
  steps: CycleStep[];
}

export const CycleDiagram: React.FC<{ data: CycleDiagramData }> = ({ data }) => {
  if (!data || !data.steps || data.steps.length === 0) {
    return <div className="text-red-500">Invalid cycle data</div>;
  }

  const { title, steps } = data;
  const numSteps = steps.length;
  const radius = 100;
  const cx = 150;
  const cy = 120;
  const nodeRadius = 40;
  const arrowOffset = 10;

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 my-4 shadow-sm overflow-x-auto">
      <h4 className="text-center font-bold text-slate-700 dark:text-slate-200 mb-4">{title}</h4>
      <svg viewBox={`0 0 ${cx * 2} ${cy * 2}`} className="w-full h-auto max-w-md mx-auto">
        <title>{title}</title>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" className="fill-indigo-300 dark:fill-indigo-500" />
          </marker>
        </defs>
        {steps.map((step, index) => {
          const angle = (index / numSteps) * 2 * Math.PI - Math.PI / 2;
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          
          const nextAngle = ((index + 1) / numSteps) * 2 * Math.PI - Math.PI / 2;
          const nextX = cx + radius * Math.cos(nextAngle);
          const nextY = cy + radius * Math.sin(nextAngle);
          
          const dx = nextX - x;
          const dy = nextY - y;
          const len = Math.sqrt(dx*dx + dy*dy);
          
          const startX = x + (dx/len) * (nodeRadius + arrowOffset);
          const startY = y + (dy/len) * (nodeRadius + arrowOffset);
          const endX = nextX - (dx/len) * (nodeRadius + arrowOffset);
          const endY = nextY - (dy/len) * (nodeRadius + arrowOffset);

          return (
            <g key={index}>
              <line x1={startX} y1={startY} x2={endX} y2={endY} className="stroke-indigo-300 dark:stroke-indigo-500" strokeWidth="3" markerEnd="url(#arrowhead)" />
              <circle cx={x} cy={y} r={nodeRadius} className="fill-indigo-50 dark:fill-slate-700 stroke-indigo-300 dark:stroke-indigo-500" strokeWidth="2" />
              <foreignObject x={x - nodeRadius} y={y - nodeRadius} width={nodeRadius*2} height={nodeRadius*2}>
                <div className="w-full h-full flex items-center justify-center text-center p-1">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 select-none">{step.label}</p>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
