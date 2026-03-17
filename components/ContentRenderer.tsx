
import React, { useState, useEffect, useRef } from 'react';
import { BarChart, BarChartData, PieChart, PieChartData } from './charts';
import { ShapeDiagram, ShapeDiagramData, VennDiagram, VennDiagramData, PyramidDiagram, PyramidDiagramData, CycleDiagram, CycleDiagramData, ProcessDiagram, ProcessDiagramData, HierarchyDiagram, HierarchyDiagramData } from './diagrams';
import InformationCircleIcon from './icons/InformationCircleIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

// --- Lazy Loaders for Heavy Libraries ---

// 1. KaTeX + mhchem (Math & Chemical Equations)
let katexPromise: Promise<void> | null = null;
const loadKaTeX = () => {
    if (typeof window !== 'undefined' && (window as any).katex) return Promise.resolve();
    if (katexPromise) return katexPromise;
    
    katexPromise = new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
        script.onload = () => {
            // Load mhchem extension for chemistry equations
            const mhchem = document.createElement('script');
            mhchem.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/mhchem.min.js';
            mhchem.onload = () => resolve();
            mhchem.onerror = () => {
                console.warn('Failed to load mhchem, math will still work.');
                resolve();
            };
            document.head.appendChild(mhchem);
        };
        script.onerror = () => reject();
        document.head.appendChild(script);
    });
    return katexPromise;
};

// 2. Mermaid.js (Flowcharts, Mindmaps, Physics/Bio Process Diagrams)
let mermaidPromise: Promise<void> | null = null;
const loadMermaid = () => {
    if (typeof window !== 'undefined' && (window as any).mermaid) return Promise.resolve();
    if (mermaidPromise) return mermaidPromise;

    mermaidPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js';
        script.onload = () => {
            // Initialize mermaid
            const isDark = document.documentElement.classList.contains('dark');
            (window as any).mermaid.initialize({ 
                startOnLoad: false, 
                theme: isDark ? 'dark' : 'default',
                securityLevel: 'loose',
                fontFamily: 'Inter, sans-serif'
            });
            resolve();
        };
        script.onerror = () => reject();
        document.head.appendChild(script);
    });
    return mermaidPromise;
}

// 3. SmilesDrawer (Chemical Structures)
let smilesPromise: Promise<void> | null = null;
const loadSmilesDrawer = () => {
     if (typeof window !== 'undefined' && (window as any).SmilesDrawer) return Promise.resolve();
    if (smilesPromise) return smilesPromise;

    smilesPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/smiles-drawer@2.0.1/dist/smiles-drawer.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.head.appendChild(script);
    });
    return smilesPromise;
}

// --- Specialized Components ---

const MathSpan: React.FC<{ math: string; block: boolean }> = ({ math, block }) => {
    const [loaded, setLoaded] = useState(false);
    const [html, setHtml] = useState('');

    useEffect(() => {
        let mounted = true;
        loadKaTeX().then(() => {
            if (!mounted) return;
            try {
                const rendered = (window as any).katex.renderToString(math, { throwOnError: false, displayMode: block });
                setHtml(rendered);
                setLoaded(true);
            } catch(e) {
                setHtml(math);
                setLoaded(true);
            }
        }).catch(() => {
            if (mounted) setHtml(math);
        });
        return () => { mounted = false; };
    }, [math, block]);

    if (!loaded) return <span className="font-mono text-xs text-slate-500 animate-pulse">...</span>;
    return <span dangerouslySetInnerHTML={{ __html: html }} className={block ? "block my-4 text-center overflow-x-auto" : ""} />;
};

const MermaidBlock: React.FC<{ chart: string }> = ({ chart }) => {
    const [svg, setSvg] = useState('');
    const [error, setError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let mounted = true;
        loadMermaid().then(() => {
            if(!mounted) return;
            try {
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                (window as any).mermaid.render(id, chart).then((res: any) => {
                     if(mounted) setSvg(res.svg);
                }).catch((e: any) => {
                    console.error("Mermaid Render Error:", e);
                    if(mounted) setError(true);
                });
            } catch(e) { 
                console.error(e);
                if(mounted) setError(true);
            }
        });
        return () => { mounted = false; };
    }, [chart]);

    if (error) return <pre className="text-xs bg-red-50 text-red-500 p-2 rounded">{chart}</pre>;
    if (!svg) return <div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-32 rounded-lg my-4"></div>;
    
    return (
        <div 
            ref={containerRef}
            className="mermaid-diagram overflow-x-auto my-6 flex justify-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700" 
            dangerouslySetInnerHTML={{ __html: svg }} 
        />
    );
}

const SmilesBlock: React.FC<{ smiles: string }> = ({ smiles }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loaded, setLoaded] = useState(false);
    
    useEffect(() => {
        loadSmilesDrawer().then(() => {
            if (canvasRef.current && (window as any).SmilesDrawer) {
                const isDark = document.documentElement.classList.contains('dark');
                const options = {
                    width: 300,
                    height: 200,
                    bondThickness: 1.0,
                    bondLength: 15,
                    shortBondLength: 0.85,
                    bondSpacing: 0.18 * 15,
                    atomVisualization: 'default',
                    isomeric: true,
                    debug: false,
                    terminalCarbons: true,
                    colorTextColor: isDark ? '#e2e8f0' : '#1e293b',
                    colorElementColor: isDark ? '#e2e8f0' : '#1e293b',
                    colorBondColor: isDark ? '#94a3b8' : '#475569',
                    backgroundColor: 'transparent'
                };
                
                try {
                    const drawer = new (window as any).SmilesDrawer.Drawer(options);
                    (window as any).SmilesDrawer.parse(smiles, (tree: any) => {
                        drawer.draw(tree, canvasRef.current, isDark ? 'dark' : 'light', false);
                        setLoaded(true);
                    });
                } catch(e) {
                    console.error(e);
                }
            }
        });
    }, [smiles]);

    return (
        <div className="my-6 flex flex-col items-center">
            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 inline-block">
                <canvas ref={canvasRef} width="300" height="200" className="max-w-full" />
                {!loaded && <div className="text-xs text-center text-slate-400">Rendering Molecule...</div>}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-mono">{smiles}</p>
        </div>
    );
}

// --- Parsers ---

type Parser = {
  name: string;
  regex: RegExp;
  renderer: (match: string[], key: number | string) => React.ReactNode;
};

const inlineParsers: Parser[] = [
  // Math & Chem parser: Supports $$...$$, \[...\], \(...\), $...$, and \ce{...} (inside math delimiters)
  { 
    name: 'katex', 
    regex: /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\\)\$[^\n$]+?(?<!\\)\$)/, 
    renderer: (matches, key) => {
      const match = matches[0];
      let math = match;
      let isBlock = false;

      if (match.startsWith('$$')) {
          math = match.slice(2, -2);
          isBlock = true;
      } else if (match.startsWith('\\[')) {
          math = match.slice(2, -2);
          isBlock = true;
      } else if (match.startsWith('\\(')) {
          math = match.slice(2, -2);
          isBlock = false;
      } else if (match.startsWith('$')) {
          math = match.slice(1, -1);
          isBlock = false;
      }
      return <MathSpan key={key} math={math} block={isBlock} />;
    }
  },
  { name: 'link', regex: /\[(.*?)\]\((.*?)\)/, renderer: (matches, key) => <a key={key} href={matches[2]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{matches[1]}</a> },
  { name: 'boldItalic', regex: /\*\*\*(.*?)\*\*\*/, renderer: (matches, key) => <strong key={key}><em>{matches[1]}</em></strong> },
  { name: 'bold', regex: /\*\*(.*?)\*\*/, renderer: (matches, key) => <strong key={key}>{matches[1]}</strong> },
  { name: 'italic', regex: /\*(.*?)\*/, renderer: (matches, key) => <em key={key}>{matches[1]}</em> },
  { name: 'underline', regex: /__(.*?)__/, renderer: (matches, key) => <u key={key}>{matches[1]}</u> },
  { name: 'strikethrough', regex: /~~(.*?)~~/, renderer: (matches, key) => <s key={key}>{matches[1]}</s> },
  { name: 'superscript', regex: /\^(.*?)\^/, renderer: (matches, key) => <sup key={key}>{matches[1]}</sup> },
  { name: 'subscript', regex: /~(.*?)~/, renderer: (matches, key) => <sub key={key}>{matches[1]}</sub> },
  { name: 'inlineCode', regex: /`(.*?)`/, renderer: (matches, key) => <code key={key} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md px-1.5 py-0.5 font-mono text-sm">{matches[1]}</code> },
];

const combinedRegex = new RegExp(inlineParsers.map(p => p.regex.source).join('|'));

const parseInlineText = (text: string): React.ReactNode => {
    if (!text) return text;
    const cleanedText = text.replace(/\/\/(.*?)\$?\/\//g, '$1');
    const parts = cleanedText.split(combinedRegex);

    return parts.map((part, index) => {
        if (!part) return null;
        for (const parser of inlineParsers) {
            const match = part.match(new RegExp(`^${parser.regex.source}$`));
            if (match) {
                return parser.renderer(match, index);
            }
        }
        return part;
    });
};

const TextRenderer: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
    return (
        <>
            {lines.map((line, index) => {
                const trimmedLine = line.trim();

                const calloutMatch = trimmedLine.match(/^>\s*\[!(NOTE|TIP|WARNING)\]\s*(.*)/i);
                if (calloutMatch) {
                    const type = calloutMatch[1].toUpperCase();
                    const content = calloutMatch[2];
                    const styles = {
                        NOTE: { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-400 dark:border-blue-600', iconColor: 'text-blue-500 dark:text-blue-400', icon: <InformationCircleIcon className="w-5 h-5" /> },
                        TIP: { bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-400 dark:border-amber-600', iconColor: 'text-amber-500 dark:text-amber-400', icon: <LightBulbIcon className="w-5 h-5" /> },
                        WARNING: { bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-400 dark:border-red-600', iconColor: 'text-red-500 dark:text-red-400', icon: <ExclamationTriangleIcon className="w-5 h-5" /> }
                    };
                    const style = styles[type as keyof typeof styles];
                    return (
                        <div key={index} className={`my-4 p-4 rounded-lg border-l-4 ${style.bg} ${style.border}`}>
                            <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 ${style.iconColor}`}>{style.icon}</div>
                                <div className="text-sm text-slate-700 dark:text-slate-300">{parseInlineText(content)}</div>
                            </div>
                        </div>
                    );
                }

                if (trimmedLine.startsWith('### ')) return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{parseInlineText(trimmedLine.substring(4))}</h3>;
                if (trimmedLine.startsWith('## ')) return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{parseInlineText(trimmedLine.substring(3))}</h2>;
                if (trimmedLine.startsWith('# ')) return <h1 key={index} className="text-2xl font-extrabold mt-8 mb-4">{parseInlineText(trimmedLine.substring(2))}</h1>;
                if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) return <li key={index} className="ml-5 list-disc">{parseInlineText(trimmedLine.substring(2))}</li>;
                
                if (trimmedLine === '') return <br key={index} />;

                return <p key={index} className="my-1">{parseInlineText(line)}</p>;
            })}
        </>
    );
};

const TableRenderer: React.FC<{ rows: string[] }> = ({ rows }) => {
  const headerCells = rows[0].slice(1, -1).split('|').map(cell => cell.trim());
  const bodyRows = rows.slice(2).map(row => row.slice(1, -1).split('|').map(cell => cell.trim()));

  return (
    <div className="overflow-x-auto my-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-700">
          <tr>
            {headerCells.map((cell, i) => (
              <th key={i} className="px-4 py-2 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{parseInlineText(cell)}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {bodyRows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{parseInlineText(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CodeBlockRenderer: React.FC<{ lines: string[] }> = ({ lines }) => {
    const lang = lines[0].replace(/```/g, '').trim();
    const code = lines.slice(1, -1).join('\n');
    return (
        <div className="my-4 bg-slate-800 rounded-lg overflow-hidden text-sm shadow-md">
            {lang && <div className="text-xs text-slate-300 bg-slate-900 px-4 py-1 font-mono uppercase tracking-wide">{lang}</div>}
            <pre className="p-4 overflow-x-auto"><code className="text-white font-mono">{code}</code></pre>
        </div>
    );
};

const ContentRenderer: React.FC<{ content: string; className?: string }> = ({ content, className }) => {
    if (!content) return null;

    const blocks: { type: 'text' | 'json' | 'table' | 'code' | 'mermaid' | 'smiles'; lines: string[] }[] = [];
    let currentBlock = { type: 'text' as 'text' | 'json' | 'table' | 'code' | 'mermaid' | 'smiles', lines: [] as string[] };
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();
        const isInBlock = ['json', 'code', 'mermaid', 'smiles'].includes(currentBlock.type);

        if (trimmedLine.startsWith('```') && !isInBlock) {
            if (currentBlock.lines.length > 0 && currentBlock.lines.join('').trim() !== '') blocks.push(currentBlock);
            let type: 'json' | 'code' | 'mermaid' | 'smiles' = 'code';
            if (trimmedLine.startsWith('```json')) type = 'json';
            else if (trimmedLine.startsWith('```mermaid')) type = 'mermaid';
            else if (trimmedLine.startsWith('```smiles')) type = 'smiles';
            
            currentBlock = { type, lines: [line] };
        } else if (trimmedLine.startsWith('```') && isInBlock) {
            currentBlock.lines.push(line);
            blocks.push(currentBlock);
            currentBlock = { type: 'text', lines: [] };
        } else if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|') && !isInBlock) {
            if (currentBlock.type !== 'table') {
                if (currentBlock.lines.length > 0 && currentBlock.lines.join('').trim() !== '') blocks.push(currentBlock);
                currentBlock = { type: 'table', lines: [line] };
            } else {
                currentBlock.lines.push(line);
            }
        } else if (isInBlock) {
            currentBlock.lines.push(line);
        } else {
            if (currentBlock.type === 'table') {
                blocks.push(currentBlock);
                currentBlock = { type: 'text', lines: [line] };
            } else {
                currentBlock.lines.push(line);
            }
        }
    }
    if (currentBlock.lines.length > 0 && currentBlock.lines.join('').trim() !== '') blocks.push(currentBlock);

    return (
        <div className={className}>
            {blocks.map((block, index) => {
                const key = `block-${index}`;
                
                if (block.type === 'mermaid') {
                    const chart = block.lines.slice(1, -1).join('\n');
                    return <MermaidBlock key={key} chart={chart} />;
                }

                if (block.type === 'smiles') {
                    const smiles = block.lines.slice(1, -1).join('').trim();
                    return <SmilesBlock key={key} smiles={smiles} />;
                }

                if (block.type === 'json') {
                    try {
                        const jsonString = block.lines.join('\n').replace(/```json\n?/, '').replace(/\n?```/, '');
                        const diagramData = JSON.parse(jsonString);

                        if (diagramData.chartType === 'bar') return <BarChart key={key} data={diagramData as BarChartData} />;
                        if (diagramData.chartType === 'pie') return <PieChart key={key} data={diagramData as PieChartData} />;
                        if (diagramData.diagramType === 'shape') return <ShapeDiagram key={key} data={diagramData as ShapeDiagramData} />;
                        if (diagramData.diagramType === 'venn') return <VennDiagram key={key} data={diagramData as VennDiagramData} />;
                        if (diagramData.diagramType === 'pyramid') return <PyramidDiagram key={key} data={diagramData as PyramidDiagramData} />;
                        if (diagramData.diagramType === 'cycle') return <CycleDiagram key={key} data={diagramData as CycleDiagramData} />;
                        if (diagramData.diagramType === 'process') return <ProcessDiagram key={key} data={diagramData as ProcessDiagramData} />;
                        if (diagramData.diagramType === 'hierarchy') return <HierarchyDiagram key={key} data={diagramData as HierarchyDiagramData} />;
                        
                        return <pre key={key} className="bg-slate-100 dark:bg-slate-900 text-xs p-2 rounded overflow-auto max-h-40">{jsonString}</pre>;
                    } catch (e) {
                         return <pre key={key} className="bg-red-100 dark:bg-red-900/30 text-xs p-2 rounded text-red-600">Invalid JSON Visualization Data</pre>;
                    }
                }
                if (block.type === 'code') {
                    return <CodeBlockRenderer key={key} lines={block.lines} />;
                }
                if (block.type === 'table' && block.lines.length > 1 && block.lines[1].includes('---')) {
                   return <TableRenderer key={key} rows={block.lines} />;
                }
                return <TextRenderer key={key} text={block.lines.join('\n')} />;
            })}
        </div>
    );
};

export default ContentRenderer;
