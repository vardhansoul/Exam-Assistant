import React from 'react';

export interface BarChartData {
  title: string;
  labels: string[];
  datasets: { label: string; data: number[] }[];
}

export const BarChart: React.FC<{ data: any }> = ({ data }) => {
  let normalizedData = data;
  if (data?.data && Array.isArray(data.data) && data.data[0]?.label && data.data[0]?.value !== undefined) {
      normalizedData = {
          title: data.title,
          labels: data.data.map((d: any) => d.label),
          datasets: [{ label: 'Data', data: data.data.map((d: any) => d.value) }]
      };
  }

  if (!normalizedData || !normalizedData.datasets || !Array.isArray(normalizedData.datasets) || normalizedData.datasets.length === 0 || !normalizedData.datasets[0].data || !Array.isArray(normalizedData.datasets[0].data) || normalizedData.datasets[0].data.length === 0 || !normalizedData.labels || !Array.isArray(normalizedData.labels)) {
    return <div className="text-red-500">Invalid bar chart data</div>;
  }

  const allData = normalizedData.datasets.flatMap((d: any) => d.data);
  const maxValue = Math.max(0, ...allData);
  const chartHeight = 250;
  const chartWidth = 500;
  const bottomMargin = 40;
  const topMargin = 30;
  const plotHeight = chartHeight - bottomMargin - topMargin;
  const numBars = normalizedData.labels.length;
  const barGroupWidth = chartWidth / numBars;
  const barPadding = 0.2; // 20% padding
  const barWidth = barGroupWidth * (1 - barPadding);

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 my-4 shadow-sm">
      <h4 className="text-center font-bold text-slate-700 dark:text-slate-200 mb-4">{normalizedData.title}</h4>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        {normalizedData.labels.map((label: string, index: number) => {
          const barValue = normalizedData.datasets[0].data[index] || 0;
          const barHeight = maxValue > 0 ? (barValue / maxValue) * plotHeight : 0;
          const x = (index * barGroupWidth) + (barGroupWidth * barPadding / 2);
          const y = chartHeight - barHeight - bottomMargin;
          return (
            <g key={index}>
              <rect x={x} y={y} width={barWidth} height={barHeight} fill="url(#chartGradient)" rx="2" />
              <text x={x + barWidth / 2} y={chartHeight - bottomMargin + 15} textAnchor="middle" fontSize="12" className="fill-slate-600 dark:fill-slate-300 font-medium">{label}</text>
              <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="10" className="fill-slate-500 dark:fill-slate-400 font-bold">{barValue}</text>
            </g>
          );
        })}
        <line x1="0" y1={chartHeight - bottomMargin} x2={chartWidth} y2={chartHeight - bottomMargin} stroke="#cbd5e1" className="dark:stroke-slate-600" />
      </svg>
    </div>
  );
};