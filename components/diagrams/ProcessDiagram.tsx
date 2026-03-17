import React from 'react';

export interface ProcessStep {
  label: string;
}

export interface ProcessDiagramData {
  title: string;
  steps: ProcessStep[];
}

export const ProcessDiagram: React.FC<{ data: ProcessDiagramData }> = ({ data }) => {
  if (!data || !data.steps || data.steps.length === 0) {
    return <div className="text-red-500">Invalid process data</div>;
  }

  const { title, steps } = data;
  const boxWidth = 120;
  const boxHeight = 60;
  const gap = 50;
  const totalWidth = steps.length * boxWidth + (steps.length - 1) * gap;

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200 my-4 shadow-sm overflow-x-auto">
      <h4 className="text-center font-bold text-slate-700 mb-4">{title}</h4>
      <svg viewBox={`0 0 ${totalWidth} ${boxHeight + 20}`} className="w-full h-auto min-w-[300px]">
        <title>{title}</title>
        <defs>
          <marker id="processArrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
          </marker>
        </defs>
        {steps.map((step, index) => {
          const x = index * (boxWidth + gap);
          return (
            <g key={index}>
              {index < steps.length - 1 && (
                <line
                  x1={x + boxWidth}
                  y1={boxHeight / 2 + 10}
                  x2={x + boxWidth + gap}
                  y2={boxHeight / 2 + 10}
                  stroke="#6366f1"
                  strokeWidth="2"
                  markerEnd="url(#processArrowhead)"
                />
              )}
              <rect
                x={x}
                y={10}
                width={boxWidth}
                height={boxHeight}
                rx="8"
                fill="#c7d2fe"
                stroke="#818cf8"
                strokeWidth="2"
              />
              <foreignObject x={x} y={10} width={boxWidth} height={boxHeight}>
                <div className="w-full h-full flex items-center justify-center text-center p-2">
                    <p className="text-xs font-bold text-slate-800 select-none">{step.label}</p>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
