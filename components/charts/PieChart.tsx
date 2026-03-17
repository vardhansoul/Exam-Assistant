import React from 'react';

export interface PieChartData {
  title: string;
  labels: string[];
  data: number[];
}

export const PieChart: React.FC<{ data: PieChartData }> = ({ data }) => {
  if (!data || !data.data || data.data.length === 0) {
    return <div className="text-red-500">Invalid pie chart data</div>;
  }

  const total = data.data.reduce((a, b) => a + b, 0);
  if (total === 0) {
      return (
          <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 my-4 shadow-sm">
              <h4 className="text-center font-bold text-slate-700 dark:text-slate-200 mb-4">{data.title}</h4>
              <p className="text-center text-slate-500 dark:text-slate-400">No data to display.</p>
          </div>
      );
  }
  
  const colors = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#fbbf24', '#fcd34d'];
  let accumulatedPercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 my-4 shadow-sm">
      <h4 className="text-center font-bold text-slate-700 dark:text-slate-200 mb-4">{data.title}</h4>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <svg viewBox="-1 -1 2 2" className="w-48 h-48 transform -rotate-90">
          {data.data.map((val, index) => {
            const percent = val / total;
            const [startX, startY] = getCoordinatesForPercent(accumulatedPercent);
            accumulatedPercent += percent;
            const [endX, endY] = getCoordinatesForPercent(accumulatedPercent);
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
            
            return <path key={index} d={pathData} fill={colors[index % colors.length]} />;
          })}
        </svg>
        <div className="text-sm">
          {data.labels.map((label, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{label} ({(data.data[index]/total * 100).toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};