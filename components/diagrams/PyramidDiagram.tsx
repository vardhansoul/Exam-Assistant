import React from 'react';

export interface PyramidLevel {
  label: string;
  color?: string;
}

export interface PyramidDiagramData {
  title: string;
  levels: PyramidLevel[];
}

const themeColors = [
  'fill-indigo-500 dark:fill-indigo-400',
  'fill-indigo-400 dark:fill-indigo-500',
  'fill-indigo-300 dark:fill-indigo-600',
  'fill-indigo-200 dark:fill-indigo-700',
  'fill-indigo-100 dark:fill-indigo-800'
];

export const PyramidDiagram: React.FC<{ data: PyramidDiagramData }> = ({ data }) => {
  if (!data || !data.levels || data.levels.length === 0) {
    return <div className="text-red-500">Invalid pyramid data</div>;
  }

  const { title, levels } = data;
  const levelCount = levels.length;
  const height = levelCount * 40;
  const maxWidth = 300;
  const minWidth = 60;

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 my-4 shadow-sm overflow-x-auto">
      <h4 className="text-center font-bold text-slate-700 dark:text-slate-200 mb-4">{title}</h4>
      <svg viewBox={`0 0 ${maxWidth} ${height}`} className="w-full h-auto max-w-sm mx-auto">
        <title>{title}</title>
        {levels.map((level, index) => {
          const y = index * 40;
          const width = maxWidth - (index * (maxWidth - minWidth)) / (levelCount - 1 || 1);
          const xOffset = (maxWidth - width) / 2;
          
          const nextWidth = (index < levelCount - 1)
            ? maxWidth - ((index + 1) * (maxWidth - minWidth)) / (levelCount - 1 || 1)
            : 0;
          const nextXOffset = (maxWidth - nextWidth) / 2;

          const points = `${xOffset},${y} ${xOffset + width},${y} ${nextXOffset + nextWidth},${y + 40} ${nextXOffset},${y + 40}`;

          return (
            <g key={index}>
              <polygon
                points={points}
                className={`stroke-white dark:stroke-slate-800 ${themeColors[index % themeColors.length]}`}
                strokeWidth="2"
              />
              <text
                x={maxWidth / 2}
                y={y + 20}
                textAnchor="middle"
                dy=".3em"
                className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs select-none"
              >
                {level.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};