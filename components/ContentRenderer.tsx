
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import InformationCircleIcon from './icons/InformationCircleIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

// --- Lazy Loaders for Heavy React Components ---
const GeographyMap = lazy(() => import('./GeographyMap').then(m => ({ default: m.GeographyMap })));
const BarChart = lazy(() => import('./charts').then(m => ({ default: m.BarChart })));
const PieChart = lazy(() => import('./charts').then(m => ({ default: m.PieChart })));
const ShapeDiagram = lazy(() => import('./diagrams').then(m => ({ default: m.ShapeDiagram })));
const VennDiagram = lazy(() => import('./diagrams').then(m => ({ default: m.VennDiagram })));
const PyramidDiagram = lazy(() => import('./diagrams').then(m => ({ default: m.PyramidDiagram })));
const CycleDiagram = lazy(() => import('./diagrams').then(m => ({ default: m.CycleDiagram })));
const ProcessDiagram = lazy(() => import('./diagrams').then(m => ({ default: m.ProcessDiagram })));
const HierarchyDiagram = lazy(() => import('./diagrams').then(m => ({ default: m.HierarchyDiagram })));

// Re-export type Data for parsing
import type { BarChartData, PieChartData } from './charts';
import type { ShapeDiagramData, VennDiagramData, PyramidDiagramData, CycleDiagramData, ProcessDiagramData, HierarchyDiagramData } from './diagrams';

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

const SmilesBlock: React.FC<{ smiles: string }> = ({ smiles }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loaded, setLoaded] = useState(false);
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
    
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    
    useEffect(() => {
        loadSmilesDrawer().then(() => {
            if (canvasRef.current && (window as any).SmilesDrawer) {
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
                    if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }
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
    }, [smiles, isDark]);

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

const DecisionBlock: React.FC<{ data: any }> = ({ data }) => {
    const [selected, setSelected] = useState<number | null>(null);

    return (
        <div className="my-6 p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
            <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5" /> Decision Scenario
            </h4>
            <p className="text-slate-700 dark:text-slate-300 mb-6">{data.scenario}</p>
            <div className="space-y-3">
                {data.options.map((opt: any, idx: number) => (
                    <div key={idx}>
                        <button 
                            onClick={() => setSelected(idx)}
                            disabled={selected !== null}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                selected === null 
                                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400' 
                                    : selected === idx 
                                        ? opt.isCorrect 
                                            ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300' 
                                            : 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300'
                                        : opt.isCorrect
                                            ? 'bg-green-50 dark:bg-green-900/10 border-green-300 text-green-700 dark:text-green-400 opacity-70'
                                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-50'
                            }`}
                        >
                            {opt.text}
                        </button>
                        {selected !== null && (selected === idx || opt.isCorrect) && (
                            <div className={`mt-2 p-3 rounded-lg text-sm ${opt.isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
                                <span className="font-bold">{opt.isCorrect ? 'Correct!' : 'Incorrect.'}</span> {opt.explanation}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const SimulationBlock: React.FC<{ data: any }> = ({ data }) => {
    const [values, setValues] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        data.variables?.forEach((v: any) => initial[v.symbol] = v.value);
        return initial;
    });

    const handleSliderChange = (symbol: string, val: number) => {
        setValues(prev => ({ ...prev, [symbol]: val }));
    };

    const evaluateFormula = (formula: string) => {
        try {
            // Create a function that takes all variables as arguments
            const keys = Object.keys(values);
            const args = keys.map(k => values[k]);
            const fn = new Function(...keys, `return ${formula};`);
            const result = fn(...args);
            return isNaN(result) ? 'Error' : Number(result.toFixed(2));
        } catch (e) {
            return 'Error';
        }
    };

    return (
        <div className="my-6 p-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4">{data.title || 'Interactive Simulation'}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h5 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Variables</h5>
                    {data.variables?.map((v: any) => (
                        <div key={v.symbol}>
                            <div className="flex justify-between mb-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{v.name}</label>
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{values[v.symbol]}</span>
                            </div>
                            <input 
                                type="range" 
                                min={v.min} 
                                max={v.max} 
                                step={v.step || 1}
                                value={values[v.symbol]}
                                onChange={(e) => handleSliderChange(v.symbol, parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
                            />
                        </div>
                    ))}
                </div>
                
                <div className="space-y-4">
                    <h5 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Live Results</h5>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                        {data.outputs?.map((out: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <span className="text-slate-600 dark:text-slate-400">{out.name}</span>
                                <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{evaluateFormula(out.formula)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AnimationBlock: React.FC<{ data: any }> = ({ data }) => {
    return (
        <div className="my-6 p-6 bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center min-h-[200px]">
            {data.elements?.map((el: any, idx: number) => {
                const Element = motion.div;
                return (
                    <Element
                        key={idx}
                        initial={el.initial}
                        animate={el.animate}
                        transition={{ ...el.transition, repeat: Infinity, repeatType: "reverse" }}
                        className={`absolute flex items-center justify-center font-bold text-white shadow-lg ${
                            el.type === 'circle' ? 'rounded-full' : 'rounded-lg'
                        }`}
                        style={{
                            backgroundColor: el.color || '#4f46e5',
                            width: el.width || 80,
                            height: el.height || 80,
                            ...el.style
                        }}
                    >
                        {el.label}
                    </Element>
                );
            })}
            <div className="absolute bottom-2 right-2 text-xs text-slate-500 font-mono">Animated Concept</div>
        </div>
    );
};

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
    regex: /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\\)\$([^\s$]|([^\s$][^$]*?[^\s$]))(?<!\\)\$|\\(?:mathbb|mathcal|mathbf|mathrm|mathfrak|sum|prod|int|ce|sqrt)\{.*?\}|\\frac\{.*?\}\{.*?\})/, 
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
  { name: 'escapedDollar', regex: /\\\$/, renderer: (matches, key) => <React.Fragment key={key}>$</React.Fragment> },
  { name: 'escapedAsterisk', regex: /\\\*/, renderer: (matches, key) => <React.Fragment key={key}>*</React.Fragment> },
  { name: 'escapedUnderscore', regex: /\\_/, renderer: (matches, key) => <React.Fragment key={key}>_</React.Fragment> },
  { name: 'escapedTilde', regex: /\\~/, renderer: (matches, key) => <React.Fragment key={key}>~</React.Fragment> },
  { name: 'escapedSlash', regex: /\\\//, renderer: (matches, key) => <React.Fragment key={key}>/</React.Fragment> },
  { name: 'link', regex: /\[(.*?)\]\((.*?)\)/, renderer: (matches, key) => <a key={key} href={matches[2]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{matches[1]}</a> },
  { name: 'highlightPyq', regex: /==PYQ:(.*?)==/i, renderer: (matches, key) => <mark key={key} className="bg-purple-200 dark:bg-purple-900/50 text-purple-900 dark:text-purple-100 px-1.5 py-0.5 rounded font-bold">🎯 PYQ: {matches[1]}</mark> },
  { name: 'highlight', regex: /==(.*?)==/, renderer: (matches, key) => <mark key={key} className="bg-yellow-200 dark:bg-yellow-800/40 text-yellow-900 dark:text-yellow-100 px-1.5 py-0.5 rounded font-semibold">{matches[1]}</mark> },
  { name: 'boldItalic', regex: /\*\*\*(.*?)\*\*\*/, renderer: (matches, key) => <strong key={key}><em>{matches[1]}</em></strong> },
  { name: 'bold', regex: /\*\*(.*?)\*\*/, renderer: (matches, key) => <strong key={key}>{matches[1]}</strong> },
  { name: 'italic', regex: /\*(.*?)\*/, renderer: (matches, key) => <em key={key}>{matches[1]}</em> },
  { name: 'underline', regex: /__(.*?)__/, renderer: (matches, key) => <u key={key}>{matches[1]}</u> },
  { name: 'strikethrough', regex: /~~(.*?)~~/, renderer: (matches, key) => <s key={key}>{matches[1]}</s> },
  { name: 'superscript', regex: /\^(.*?)\^/, renderer: (matches, key) => <sup key={key}>{matches[1]}</sup> },
  { name: 'subscript', regex: /~(.*?)~/, renderer: (matches, key) => <sub key={key}>{matches[1]}</sub> },
  { name: 'inlineCode', regex: /`(.*?)`/, renderer: (matches, key) => <code key={key} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md px-1.5 py-0.5 font-mono text-sm">{matches[1]}</code> },
];

const combinedRegexCode = inlineParsers.map(p => `(${p.regex.source})`).join('|');
const globalRegex = new RegExp(combinedRegexCode, 'g');

const parseInlineText = (text: string): React.ReactNode => {
    if (!text) return text;
    
    // Fix for common hallucination where model outputs $/ instead of $ or /$
    let cleanedText = text.replace(/\$\//g, '$').replace(/\/\$/g, '$');
    
    // Fix for /${[ or similar hallucinated bracket garbage
    cleanedText = cleanedText.replace(/\/\$\{\[/g, '').replace(/\/\$\\]/g, '');

    // Fix for AI outputting \Frac instead of \frac in LaTeX
    cleanedText = cleanedText.replace(/\\Frac/g, '\\frac');
    
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Reset global regex index
    globalRegex.lastIndex = 0;
    
    let match;
    while ((match = globalRegex.exec(cleanedText)) !== null) {
        if (match.index > lastIndex) {
            elements.push(cleanedText.substring(lastIndex, match.index));
        }
        
        const matchedText = match[0];
        let parserFound = false;
        
        for (const parser of inlineParsers) {
            const parserMatch = matchedText.match(new RegExp(`^${parser.regex.source}$`));
            if (parserMatch) {
                elements.push(parser.renderer(parserMatch, elements.length));
                parserFound = true;
                break;
            }
        }
        
        if (!parserFound) {
            elements.push(matchedText);
        }
        
        lastIndex = globalRegex.lastIndex;
    }
    
    if (lastIndex < cleanedText.length) {
        elements.push(cleanedText.substring(lastIndex));
    }
    
    return <>{elements.map((el, i) => React.isValidElement(el) ? React.cloneElement(el, { key: i } as Partial<unknown>) : <React.Fragment key={i}>{el}</React.Fragment>)}</>;
};

const TextRenderer: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol', items: React.ReactNode[] } | null = null;
    
    const flushList = () => {
        if (currentList) {
            const ListTag = currentList.type;
            elements.push(<ListTag key={`list-${elements.length}`} className={currentList.type === 'ul' ? 'list-disc ml-5 mb-4 space-y-1' : 'list-decimal ml-5 mb-4 space-y-1'}>{currentList.items}</ListTag>);
            currentList = null;
        }
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // Notebook styling for Questions and Answers
        const qMatch = trimmedLine.match(/^(?:#+\s*)?(?:\*\*|\*|_*)?(?:Q|Question)(?:\s*\d*)?\s*:\s*(?:\*\*|\*|_*)?(.*)/i);
        if (qMatch) {
            flushList();
            elements.push(<div key={index} className="my-3 font-bold text-red-800 dark:text-red-300 text-lg">{parseInlineText(line)}</div>);
            return;
        }

        const aMatch = trimmedLine.match(/^(?:#+\s*)?(?:\*\*|\*|_*)?(?:A|Answer|Ans)(?:\s*\d*)?\s*:\s*(?:\*\*|\*|_*)?(.*)/i);
        if (aMatch) {
            flushList();
            elements.push(<div key={index} className="my-2 font-semibold text-blue-950 dark:text-blue-100 text-base">{parseInlineText(line)}</div>);
            return;
        }

        const calloutMatch = trimmedLine.match(/^>\s*\[!(NOTE|TIP|WARNING)\]\s*(.*)/i);
        if (calloutMatch) {
            flushList();
            const type = calloutMatch[1].toUpperCase();
            const content = calloutMatch[2];
            const styles = {
                NOTE: { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-400 dark:border-blue-600', iconColor: 'text-blue-500 dark:text-blue-400', icon: <InformationCircleIcon className="w-5 h-5" /> },
                TIP: { bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-400 dark:border-amber-600', iconColor: 'text-amber-500 dark:text-amber-400', icon: <LightBulbIcon className="w-5 h-5" /> },
                WARNING: { bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-400 dark:border-red-600', iconColor: 'text-red-500 dark:text-red-400', icon: <ExclamationTriangleIcon className="w-5 h-5" /> }
            };
            const style = styles[type as keyof typeof styles];
            elements.push(
                <div key={index} className={`my-4 p-4 rounded-lg border-l-4 ${style.bg} ${style.border}`}>
                    <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 ${style.iconColor}`}>{style.icon}</div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">{parseInlineText(content)}</div>
                    </div>
                </div>
            );
            return;
        }

        if (trimmedLine.startsWith('### ')) { flushList(); elements.push(<h3 key={index} className="text-lg font-semibold mt-4 mb-2">{parseInlineText(trimmedLine.substring(4))}</h3>); return; }
        if (trimmedLine.startsWith('## ')) { flushList(); elements.push(<h2 key={index} className="text-xl font-bold mt-6 mb-3">{parseInlineText(trimmedLine.substring(3))}</h2>); return; }
        if (trimmedLine.startsWith('# ')) { flushList(); elements.push(<h1 key={index} className="text-2xl font-extrabold mt-8 mb-4">{parseInlineText(trimmedLine.substring(2))}</h1>); return; }
        
        const ulMatch = trimmedLine.match(/^[*+-]\s+(.*)/);
        if (ulMatch) {
            if (!currentList || currentList.type !== 'ul') {
                flushList();
                currentList = { type: 'ul', items: [] };
            }
            currentList.items.push(<li key={index} className="pl-1">{parseInlineText(ulMatch[1])}</li>);
            return;
        }

        const olMatch = trimmedLine.match(/^\d+\.\s+(.*)/);
        if (olMatch) {
            if (!currentList || currentList.type !== 'ol') {
                flushList();
                currentList = { type: 'ol', items: [] };
            }
            currentList.items.push(<li key={index} className="pl-1">{parseInlineText(olMatch[1])}</li>);
            return;
        }

        flushList();
        if (trimmedLine === '') {
            elements.push(<br key={index} />);
            return;
        }

        elements.push(<p key={index} className="my-1">{parseInlineText(line)}</p>);
    });

    flushList();
    return <>{elements}</>;
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
    const raw = lines.join('\n');
    let lang = '';
    let code = raw;
    
    const match = raw.match(/^```([a-zA-Z0-9_\-+]+)?/);
    if (match) {
        lang = match[1] || '';
    }
    
    code = code.replace(/^```[a-zA-Z0-9_\-+]*[ \t]*\n?/, '').replace(/\n?```[ \t]*$/, '');

    return (
        <div className="my-4 bg-slate-800 rounded-lg overflow-hidden text-sm shadow-md">
            {lang && <div className="text-xs text-slate-300 bg-slate-900 px-4 py-1 font-mono uppercase tracking-wide">{lang}</div>}
            <pre className="p-4 overflow-x-auto"><code className="text-white font-mono">{code}</code></pre>
        </div>
    );
};

const ContentRenderer: React.FC<{ content: string; className?: string }> = ({ content, className }) => {
    if (!content) return null;

    const blocks = React.useMemo(() => {
        // Pre-process to remove hallucinated $/ ... /$ blocks or standalone $/ lines
        const cleanedContent = content.replace(/\$\/[\s\S]*?\/\$/g, '').replace(/^\s*\$\/.*$/gm, '');

        const parsedBlocks: { type: 'text' | 'json' | 'table' | 'code' | 'smiles' | 'math' | 'map'; lines: string[] }[] = [];
        let currentBlock = { type: 'text' as 'text' | 'json' | 'table' | 'code' | 'smiles' | 'math' | 'map', lines: [] as string[] };
        const lines = cleanedContent.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            const isInBlock = ['json', 'code', 'smiles', 'math', 'map'].includes(currentBlock.type);

            if (trimmedLine.startsWith('```') && !isInBlock) {
                if (currentBlock.lines.length > 0 && currentBlock.lines.join('').trim() !== '') parsedBlocks.push(currentBlock);
                let type: 'json' | 'code' | 'smiles' | 'map' = 'code';
                if (trimmedLine.startsWith('```json')) type = 'json';
                else if (trimmedLine.startsWith('```smiles')) type = 'smiles';
                else if (trimmedLine.startsWith('```map')) type = 'map';
                
                currentBlock = { type, lines: [line] };
            } else if (trimmedLine.startsWith('```') && isInBlock && currentBlock.type !== 'math') {
                currentBlock.lines.push(line);
                parsedBlocks.push(currentBlock);
                currentBlock = { type: 'text', lines: [] };
            } else if (trimmedLine.startsWith('$$') && !isInBlock) {
                if (currentBlock.lines.length > 0 && currentBlock.lines.join('').trim() !== '') parsedBlocks.push(currentBlock);
                if (trimmedLine === '$$') {
                    currentBlock = { type: 'math', lines: [line] };
                } else if (trimmedLine.endsWith('$$') && trimmedLine.length > 2) {
                    parsedBlocks.push({ type: 'math', lines: [line] });
                    currentBlock = { type: 'text', lines: [] };
                } else {
                    currentBlock = { type: 'math', lines: [line] };
                }
            } else if (trimmedLine.endsWith('$$') && currentBlock.type === 'math') {
                currentBlock.lines.push(line);
                parsedBlocks.push(currentBlock);
                currentBlock = { type: 'text', lines: [] };
            } else if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|') && !isInBlock) {
                if (currentBlock.type !== 'table') {
                    if (currentBlock.lines.length > 0 && currentBlock.lines.join('').trim() !== '') parsedBlocks.push(currentBlock);
                    currentBlock = { type: 'table', lines: [line] };
                } else {
                    currentBlock.lines.push(line);
                }
            } else if (isInBlock) {
                currentBlock.lines.push(line);
            } else {
                if (currentBlock.type === 'table') {
                    parsedBlocks.push(currentBlock);
                    currentBlock = { type: 'text', lines: [line] };
                } else {
                    currentBlock.lines.push(line);
                }
            }
        }
        if (currentBlock.lines.length > 0 && currentBlock.lines.join('').trim() !== '') parsedBlocks.push(currentBlock);
        
        return parsedBlocks;
    }, [content]);

    return (
        <div className={className}>
            {blocks.map((block, index) => {
                const key = `block-${index}`;

                if (block.type === 'smiles') {
                    let smilesStr = block.lines.join('\n');
                    smilesStr = smilesStr.replace(/^```smiles[ \t]*/i, '').replace(/\n?```[ \t]*$/i, '').trim();
                    return <SmilesBlock key={key} smiles={smilesStr} />;
                }

                if (block.type === 'math') {
                    const mathStr = block.lines.join('\n').replace(/^\$\$/, '').replace(/\$\$$/, '').replace(/\\Frac/g, '\\frac').trim();
                    return <MathSpan key={key} math={mathStr} block={true} />;
                }

                if (block.type === 'map') {
                    try {
                        let jsonString = block.lines.join('\n');
                        jsonString = jsonString.replace(/^```map[ \t]*\n?/i, '').replace(/\n?```[ \t]*$/i, '').trim();
                        // Strip comments and trailing commas from JSON
                        jsonString = jsonString.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/,(?=\s*[}\]])/g, '');
                        const mapData = JSON.parse(jsonString);
                        return <Suspense key={key} fallback={<div className="h-48 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl my-6 flex items-center justify-center text-slate-400 text-sm">Loading Interactive Map...</div>}><GeographyMap data={mapData} /></Suspense>;
                    } catch (e) {
                         return <pre key={key} className="bg-red-100 dark:bg-red-900/30 text-xs p-2 rounded text-red-600">Invalid Map visualization Data</pre>;
                    }
                }

                if (block.type === 'json') {
                    try {
                        let jsonString = block.lines.join('\n');
                        jsonString = jsonString.replace(/^```json[ \t]*\n?/i, '').replace(/\n?```[ \t]*$/i, '').trim();
                        // Strip comments and trailing commas from JSON
                        jsonString = jsonString.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/,(?=\s*[}\]])/g, '');
                        const diagramData = JSON.parse(jsonString);

                        const Fallback = <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl my-6 flex items-center justify-center text-slate-400 text-sm">Loading Chart...</div>;

                        if (diagramData.chartType === 'bar') return <Suspense fallback={Fallback} key={key}><BarChart data={diagramData as BarChartData} /></Suspense>;
                        if (diagramData.chartType === 'pie') return <Suspense fallback={Fallback} key={key}><PieChart data={diagramData as PieChartData} /></Suspense>;
                        if (diagramData.diagramType === 'shape') return <Suspense fallback={Fallback} key={key}><ShapeDiagram data={diagramData as ShapeDiagramData} /></Suspense>;
                        if (diagramData.diagramType === 'venn') return <Suspense fallback={Fallback} key={key}><VennDiagram data={diagramData as VennDiagramData} /></Suspense>;
                        if (diagramData.diagramType === 'pyramid') return <Suspense fallback={Fallback} key={key}><PyramidDiagram data={diagramData as PyramidDiagramData} /></Suspense>;
                        if (diagramData.diagramType === 'cycle') return <Suspense fallback={Fallback} key={key}><CycleDiagram data={diagramData as CycleDiagramData} /></Suspense>;
                        if (diagramData.diagramType === 'process') return <Suspense fallback={Fallback} key={key}><ProcessDiagram data={diagramData as ProcessDiagramData} /></Suspense>;
                        if (diagramData.diagramType === 'hierarchy') return <Suspense fallback={Fallback} key={key}><HierarchyDiagram data={diagramData as HierarchyDiagramData} /></Suspense>;
                        if (diagramData.type === 'decision') return <DecisionBlock key={key} data={diagramData} />;
                        if (diagramData.type === 'simulation') return <SimulationBlock key={key} data={diagramData} />;
                        if (diagramData.type === 'animation') return <AnimationBlock key={key} data={diagramData} />;
                        
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
