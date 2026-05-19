import React from 'react';

export interface PieChartData {
  title: string;
  labels: string[];
  data: number[];
}

export const PieChart: React.FC<{ data: any }> = ({ data }) => {
  let normalizedData = data;
  if (data?.data && Array.isArray(data.data) && data.data[0]?.label && data.data[0]?.value !== undefined) {
      normalizedData = {
          title: data.title,
          labels: data.data.map((d: any) => d.label),
          data: data.data.map((d: any) => d.value)
      };
  }

  if (!normalizedData || !normalizedData.data || !Array.isArray(normalizedData.data) || normalizedData.data.length === 0 || !normalizedData.labels || !Array.isArray(normalizedData.labels)) {
    return <div className="text-red-500">Invalid pie chart data</div>;
  }

  const total = normalizedData.data.reduce((a: number, b: number) => a + b, 0);
  if (total === 0) {
      return (
          <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 my-4 shadow-sm">
              <h4 className="text-center font-bold text-slate-700 dark:text-slate-200 mb-4">{normalizedData.title}</h4>
              <p className="text-center text-slate-500 dark:text-slate-400">No data to display.</p>
          </div>
      );
  }
  
  const colors = [
    { fill: 'fill-indigo-500 dark:fill-indigo-400', bg: 'bg-indigo-500 dark:bg-indigo-400' },
    { fill: 'fill-blue-400 dark:fill-blue-300', bg: 'bg-blue-400 dark:bg-blue-300' },
    { fill: 'fill-sky-300 dark:fill-sky-200', bg: 'bg-sky-300 dark:bg-sky-200' },
    { fill: 'fill-indigo-300 dark:fill-indigo-200', bg: 'bg-indigo-300 dark:bg-indigo-200' },
    { fill: 'fill-slate-300 dark:fill-slate-500', bg: 'bg-slate-300 dark:bg-slate-500' },
    { fill: 'fill-amber-400 dark:fill-amber-500', bg: 'bg-amber-400 dark:bg-amber-500' },
    { fill: 'fill-violet-400 dark:fill-violet-300', bg: 'bg-violet-400 dark:bg-violet-300' }
  ];
  let accumulatedPercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 my-4 shadow-sm">
      <h4 className="text-center font-bold text-slate-700 dark:text-slate-200 mb-4">{normalizedData.title}</h4>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <svg viewBox="-1 -1 2 2" className="w-48 h-48 transform -rotate-90">
          {normalizedData.data.map((val: number, index: number) => {
            const percent = val / total;
            const [startX, startY] = getCoordinatesForPercent(accumulatedPercent);
            accumulatedPercent += percent;
            const [endX, endY] = getCoordinatesForPercent(accumulatedPercent);
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
            
            return <path key={index} d={pathData} className={colors[index % colors.length].fill} />;
          })}
        </svg>
        <div className="text-sm">
          {normalizedData.labels.map((label: string, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${colors[index % colors.length].bg}`}></span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{label} ({(normalizedData.data[index]/total * 100).toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};