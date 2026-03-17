import React from 'react';

export type ShapeType = 'circle' | 'square' | 'rectangle' | 'triangle' | 'pentagon' | 'hexagon' | 'cylinder';

export interface Shape {
  type: ShapeType;
  label?: string;
  fill?: string;
  stroke?: string;
}

export interface ShapeDiagramData {
  title: string;
  shapes: Shape[];
}

const getPolygonPoints = (sides: number, radius: number, cx: number, cy: number): string => {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * 2 * Math.PI - Math.PI / 2; // Start from top
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
};

const RenderShape: React.FC<{ shape: Shape; cx: number; cy: number; size: number }> = ({ shape, cx, cy, size }) => {
  const radius = size / 2;
  const fill = shape.fill || '#a5b4fc';
  const stroke = shape.stroke || '#6366f1';
  const textFill = '#ffffff';

  let shapeElement;
  switch (shape.type) {
    case 'circle':
      shapeElement = <circle cx={cx} cy={cy} r={radius} fill={fill} stroke={stroke} strokeWidth="2" />;
      break;
    case 'square':
      shapeElement = <rect x={cx - radius} y={cy - radius} width={size} height={size} fill={fill} stroke={stroke} strokeWidth="2" rx="4" />;
      break;
    case 'rectangle':
      shapeElement = <rect x={cx - size / 1.5} y={cy - radius / 1.5} width={size * 1.33} height={size / 1.5 * 2} fill={fill} stroke={stroke} strokeWidth="2" rx="4" />;
      break;
    case 'triangle':
      shapeElement = <polygon points={getPolygonPoints(3, radius, cx, cy)} fill={fill} stroke={stroke} strokeWidth="2" />;
      break;
    case 'pentagon':
      shapeElement = <polygon points={getPolygonPoints(5, radius, cx, cy)} fill={fill} stroke={stroke} strokeWidth="2" />;
      break;
    case 'hexagon':
      shapeElement = <polygon points={getPolygonPoints(6, radius, cx, cy)} fill={fill} stroke={stroke} strokeWidth="2" />;
      break;
    case 'cylinder':
      shapeElement = (
        <g>
          <ellipse cx={cx} cy={cy - radius / 2} rx={radius} ry={radius / 3} fill={fill} stroke={stroke} strokeWidth="2" />
          <path d={`M ${cx - radius},${cy - radius / 2} V ${cy + radius / 2}`} stroke={stroke} strokeWidth="2" />
          <path d={`M ${cx + radius},${cy - radius / 2} V ${cy + radius / 2}`} stroke={stroke} strokeWidth="2" />
          <ellipse cx={cx} cy={cy + radius / 2} rx={radius} ry={radius / 3} fill={fill} stroke={stroke} strokeWidth="2" fillOpacity="0.7" />
        </g>
      );
      break;
    default:
      shapeElement = <rect x={cx - radius} y={cy - radius} width={size} height={size} fill="#cccccc" />;
  }

  return (
    <g>
      {shapeElement}
      {shape.label && (
        <text x={cx} y={cy} textAnchor="middle" dy=".3em" fill={textFill} className="font-bold text-sm select-none">
          {shape.label}
        </text>
      )}
    </g>
  );
};

export const ShapeDiagram: React.FC<{ data: ShapeDiagramData }> = ({ data }) => {
  if (!data || !data.shapes || data.shapes.length === 0) {
    return <div className="text-red-500">Invalid shape data</div>;
  }

  const numShapes = data.shapes.length;
  const shapeSize = 80;
  const padding = 20;
  const totalWidth = numShapes * (shapeSize + padding);

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200 my-4 shadow-sm overflow-x-auto">
      <h4 className="text-center font-bold text-slate-700 mb-4">{data.title}</h4>
      <svg viewBox={`0 0 ${totalWidth} ${shapeSize + padding * 2}`} className="w-full h-auto min-w-[200px]">
        <title>{data.title}</title>
        {data.shapes.map((shape, index) => {
          const cx = index * (shapeSize + padding) + shapeSize / 2 + padding / 2;
          const cy = shapeSize / 2 + padding;
          return <RenderShape key={index} shape={shape} cx={cx} cy={cy} size={shapeSize} />;
        })}
      </svg>
    </div>
  );
};
