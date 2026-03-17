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

export const VennDiagram: React.FC<{ data: VennDiagramData }> = ({ data }) => {
  // This component is simplified to handle a 2-set Venn diagram for now.
  if (!data || data.sets.length !== 2 || data.intersections.length !== 1) {
    return <div className="text-red-500">Venn diagram data is not in a supported format (requires 2 sets and 1 intersection).</div>;
  }

  const setA = data.sets[0];
  const setB = data.sets[1];
  const intersection = data.intersections[0];
  
  const sizeAOnly = setA.size - intersection.size;
  const sizeBOnly = setB.size - intersection.size;

  const radius = 60;
  const overlap = 40;
  const cxA = 100;
  const cxB = cxA + (2 * radius - overlap);
  const cy = 80;

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200 my-4 shadow-sm overflow-x-auto">
      <h4 className="text-center font-bold text-slate-700 mb-4">{data.title}</h4>
      <svg viewBox="0 0 300 160" className="w-full h-auto min-w-[300px]">
        <title>{data.title}</title>
        <desc>A Venn diagram showing the relationship between {setA.label} and {setB.label}.</desc>
        
        {/* Circles */}
        <circle cx={cxA} cy={cy} r={radius} fill="#a5b4fc" fillOpacity="0.7" stroke="#6366f1" strokeWidth="2" />
        <circle cx={cxB} cy={cy} r={radius} fill="#818cf8" fillOpacity="0.7" stroke="#4f46e5" strokeWidth="2" />

        {/* Labels */}
        <text x={cxA} y={cy - radius - 10} textAnchor="middle" className="font-bold text-slate-800">{setA.label}</text>
        <text x={cxB} y={cy - radius - 10} textAnchor="middle" className="font-bold text-slate-800">{setB.label}</text>

        {/* Sizes */}
        <text x={cxA - radius / 2} y={cy} textAnchor="middle" dy=".3em" className="font-bold text-white text-lg select-none">{sizeAOnly}</text>
        <text x={cxB + radius / 2} y={cy} textAnchor="middle" dy=".3em" className="font-bold text-white text-lg select-none">{sizeBOnly}</text>
        <text x={(cxA + cxB) / 2} y={cy} textAnchor="middle" dy=".3em" className="font-bold text-white text-lg select-none">{intersection.size}</text>
      </svg>
    </div>
  );
};
