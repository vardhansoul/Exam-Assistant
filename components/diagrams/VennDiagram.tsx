import React from 'react';

export interface VennSet {
  label: string;
  size: number;
}
export interface VennIntersection {
  sets: string[];
  size: number;
  label?: string;
}
export interface VennDiagramData {
  title: string;
  sets: VennSet[];
  intersections: VennIntersection[];
}

export const VennDiagram: React.FC<{ data: any }> = ({ data }) => {
  let normalizedData = data;
  if (data?.sets && Array.isArray(data.sets) && data.sets[0]?.items) {
      normalizedData = {
          title: data.title,
          sets: data.sets.map((s: any) => ({ label: s.label, size: s.items?.length || s.size || 0 })),
          intersections: data.intersections ? data.intersections.map((i: any) => ({ sets: i.sets, size: i.items?.length || i.size || 0 })) : []
      };
  }

  if (!normalizedData || !normalizedData.sets || !Array.isArray(normalizedData.sets)) {
    return <div className="text-red-500">Invalid Venn diagram data.</div>;
  }

  const sets = normalizedData.sets;
  const intersections = normalizedData.intersections || [];

  if (sets.length === 0) {
      return <div className="text-slate-500">No sets to display in Venn Diagram.</div>;
  }

  // Fallback for non-2 or 3-set diagrams
  if (sets.length < 2 || sets.length > 3) {
      return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 my-4 shadow-sm overflow-x-auto">
          <h4 className="text-center font-bold text-slate-700 dark:text-slate-200 mb-4">{normalizedData.title}</h4>
          <div className="flex flex-wrap gap-4 justify-center">
              {sets.map((s: any, i: number) => (
                  <div key={i} className="flex flex-col items-center p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full w-24 h-24 justify-center border-2 border-indigo-200 dark:border-indigo-800">
                      <span className="font-bold text-indigo-800 dark:text-indigo-300 text-sm text-center">{s.label}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{s.size}</span>
                  </div>
              ))}
          </div>
          {intersections.length > 0 && (
              <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
                  <p className="font-semibold mb-1">Intersections:</p>
                  {intersections.map((int: any, i: number) => (
                      <div key={i}>{int.sets?.join(' ∩ ')}: {int.size}</div>
                  ))}
              </div>
          )}
        </div>
      );
  }

  const radius = 60;
  const chartWidth = 300;
  const chartHeight = sets.length === 3 ? 220 : 160;

  if (sets.length === 2) {
    const setA = sets[0];
    const setB = sets[1];
    const intersection = intersections.find((i: any) => i.sets.includes(setA.label) && i.sets.includes(setB.label)) || { size: 0 };
    
    const sizeAOnly = Math.max(0, setA.size - intersection.size);
    const sizeBOnly = Math.max(0, setB.size - intersection.size);

    const overlap = 40;
    const cxA = 100;
    const cxB = cxA + (2 * radius - overlap);
    const cy = 80;

    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 my-4 shadow-sm overflow-x-auto">
          <h4 className="text-center font-bold text-slate-700 dark:text-slate-200 mb-4">{normalizedData.title}</h4>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[300px]">
            <circle cx={cxA} cy={cy} r={radius} fill="#a5b4fc" fillOpacity="0.7" stroke="#6366f1" strokeWidth="2" />
            <circle cx={cxB} cy={cy} r={radius} fill="#818cf8" fillOpacity="0.7" stroke="#4f46e5" strokeWidth="2" />
            <text x={cxA} y={cy - radius - 10} textAnchor="middle" className="font-bold text-slate-800 dark:text-slate-200 text-xs">{setA.label}</text>
            <text x={cxB} y={cy - radius - 10} textAnchor="middle" className="font-bold text-slate-800 dark:text-slate-200 text-xs">{setB.label}</text>
            <text x={cxA - radius / 2} y={cy} textAnchor="middle" dy=".3em" className="font-bold text-white text-lg select-none">{sizeAOnly}</text>
            <text x={cxB + radius / 2} y={cy} textAnchor="middle" dy=".3em" className="font-bold text-white text-lg select-none">{sizeBOnly}</text>
            {intersection.size > 0 && (
                <text x={(cxA + cxB) / 2} y={cy} textAnchor="middle" dy=".3em" className="font-bold text-white text-lg select-none">{intersection.size}</text>
            )}
          </svg>
        </div>
    );
  }

  // 3-set Venn Diagram
  const setA = sets[0];
  const setB = sets[1];
  const setC = sets[2];

  const cxA = 150;
  const cyA = 70;
  const cxB = 110;
  const cyB = 140;
  const cxC = 190;
  const cyC = 140;

  const getIntSize = (setLabels: string[]) => {
      const match = intersections.find((i: any) => 
          i.sets.length === setLabels.length && 
          setLabels.every(l => i.sets.includes(l))
      );
      return match ? match.size : 0;
  };

  const sizeABC = getIntSize([setA.label, setB.label, setC.label]);
  const sizeAB = Math.max(0, getIntSize([setA.label, setB.label]) - sizeABC);
  const sizeAC = Math.max(0, getIntSize([setA.label, setC.label]) - sizeABC);
  const sizeBC = Math.max(0, getIntSize([setB.label, setC.label]) - sizeABC);
  
  const sizeAOnly = Math.max(0, setA.size - sizeAB - sizeAC - sizeABC);
  const sizeBOnly = Math.max(0, setB.size - sizeAB - sizeBC - sizeABC);
  const sizeCOnly = Math.max(0, setC.size - sizeAC - sizeBC - sizeABC);

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 my-4 shadow-sm overflow-x-auto">
      <h4 className="text-center font-bold text-slate-700 dark:text-slate-200 mb-4">{normalizedData.title}</h4>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[300px]">
        <circle cx={cxA} cy={cyA} r={radius} fill="#a5b4fc" fillOpacity="0.6" stroke="#6366f1" strokeWidth="2" />
        <circle cx={cxB} cy={cyB} r={radius} fill="#818cf8" fillOpacity="0.6" stroke="#4f46e5" strokeWidth="2" />
        <circle cx={cxC} cy={cyC} r={radius} fill="#6366f1" fillOpacity="0.6" stroke="#4338ca" strokeWidth="2" />

        {/* Labels */}
        <text x={cxA} y={cyA - radius - 5} textAnchor="middle" className="font-bold text-slate-800 dark:text-slate-200 text-xs">{setA.label}</text>
        <text x={cxB - radius} y={cyB + radius + 15} textAnchor="middle" className="font-bold text-slate-800 dark:text-slate-200 text-xs">{setB.label}</text>
        <text x={cxC + radius} y={cyC + radius + 15} textAnchor="middle" className="font-bold text-slate-800 dark:text-slate-200 text-xs">{setC.label}</text>

        {/* Sizes */}
        <text x={cxA} y={cyA - 20} textAnchor="middle" className="font-bold text-white select-none">{sizeAOnly}</text>
        <text x={cxB - 20} y={cyB + 20} textAnchor="middle" className="font-bold text-white select-none">{sizeBOnly}</text>
        <text x={cxC + 20} y={cyC + 20} textAnchor="middle" className="font-bold text-white select-none">{sizeCOnly}</text>
        
        <text x={(cxA + cxB) / 2 - 5} y={(cyA + cyB) / 2 + 5} textAnchor="middle" className="font-bold text-white text-xs select-none">{sizeAB}</text>
        <text x={(cxA + cxC) / 2 + 5} y={(cyA + cyC) / 2 + 5} textAnchor="middle" className="font-bold text-white text-xs select-none">{sizeAC}</text>
        <text x={(cxB + cxC) / 2} y={cyB + 10} textAnchor="middle" className="font-bold text-white text-xs select-none">{sizeBC}</text>
        
        <text x={150} y={125} textAnchor="middle" className="font-bold text-white text-sm select-none">{sizeABC}</text>
      </svg>
    </div>
  );
};
