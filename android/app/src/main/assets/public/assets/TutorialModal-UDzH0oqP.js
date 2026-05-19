import{j as e,L as m,E as c,B as o}from"./index-x_IE3o7i.js";import{C as a}from"./ContentRenderer-Cqas2dsG.js";import{P as b}from"./PrinterIcon-Iyzyx9V6.js";const j=({isOpen:d,onClose:n,tutorial:t,isLoading:i,error:l,onRetry:p})=>{if(!d)return null;const x=()=>{window.print()};return e.jsxs("div",{className:"fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex flex-col animate-slide-up print-container",children:[e.jsxs("div",{className:"w-full h-full flex flex-col",children:[e.jsxs("header",{className:"p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0 bg-white dark:bg-slate-800 no-print",children:[e.jsx("h3",{className:"text-xl font-bold text-slate-800 dark:text-slate-100 truncate",children:(t==null?void 0:t.title)||"Tutorial"}),e.jsx("button",{onClick:n,className:"p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",className:"w-6 h-6",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsx("div",{className:"overflow-y-auto p-4 sm:p-6 flex-grow print-content",children:e.jsxs("div",{className:"max-w-5xl mx-auto h-full",children:[i&&e.jsxs("div",{className:"flex flex-col justify-center items-center h-full text-center no-print",children:[e.jsx(m,{}),e.jsx("p",{className:"mt-4 text-slate-600 dark:text-slate-400 text-lg",children:"COC AI is building your step-by-step tutorial..."})]}),l&&e.jsx(c,{message:l,onRetry:p}),t&&e.jsxs("div",{className:"space-y-8 pb-10",children:[e.jsxs("div",{className:"print-title hidden print:block mb-8 text-center",children:[e.jsx("h1",{className:"text-3xl font-extrabold text-slate-900",children:t.title}),e.jsx("p",{className:"text-slate-500 mt-2",children:"Study Tutorial - Club of Competition"})]}),e.jsx("div",{className:"p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:shadow-none print:border-none print:p-0",children:e.jsx(a,{content:t.introduction,className:"prose prose-lg dark:prose-invert max-w-none print:text-slate-900"})}),t.prerequisites.length>0&&e.jsxs("div",{className:"print:break-inside-avoid",children:[e.jsx("h4",{className:"text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 print:text-indigo-700",children:"Prerequisites"}),e.jsx("ul",{className:"list-disc list-inside bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 space-y-2 print:border-none print:p-0 print:text-slate-800",children:t.prerequisites.map((r,s)=>e.jsx("li",{children:r},s))})]}),e.jsxs("div",{className:"print:break-before-auto",children:[e.jsx("h4",{className:"text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 print:text-indigo-700",children:"Step-by-Step Guide"}),e.jsx("div",{className:"space-y-6",children:t.steps.map(r=>e.jsxs("div",{className:"p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:shadow-none print:border-l-4 print:border-indigo-200 print:rounded-none print:bg-transparent print:mb-6 print:break-inside-avoid",children:[e.jsxs("p",{className:"text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-2",children:["Step ",r.step,": ",r.title]}),e.jsx("div",{className:"mt-2 prose prose-lg dark:prose-invert max-w-none print:text-slate-800",children:e.jsx(a,{content:r.content})}),r.example&&e.jsx("div",{className:"mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600 prose prose-lg dark:prose-invert max-w-none print:bg-slate-100 print:text-slate-700",children:e.jsx(a,{content:`**Example:** ${r.example}`})})]},r.step))})]}),e.jsxs("div",{className:"p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:shadow-none print:p-0 print:break-inside-avoid",children:[e.jsx("h4",{className:"text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 print:text-indigo-700",children:"Worked Example"}),e.jsx("div",{className:"prose prose-lg dark:prose-invert max-w-none print:text-slate-800",children:e.jsx(a,{content:t.workedExample})})]}),e.jsxs("div",{className:"p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-l-4 border-amber-400 dark:border-amber-600 print:bg-amber-50 print:border-amber-400 print:break-inside-avoid",children:[e.jsx("h4",{className:"text-lg font-bold text-amber-800 dark:text-amber-200 mb-3",children:"Common Pitfalls"}),e.jsx("ul",{className:"list-disc list-inside text-amber-700 dark:text-amber-300 space-y-2 print:text-amber-900",children:t.commonPitfalls.map((r,s)=>e.jsx("li",{children:r},s))})]}),e.jsxs("div",{className:"p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:shadow-none print:p-0 print:break-inside-avoid",children:[e.jsx("h4",{className:"text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 print:text-indigo-700",children:"Summary"}),e.jsx("div",{className:"prose prose-lg dark:prose-invert max-w-none print:text-slate-800",children:e.jsx(a,{content:t.summary})})]}),t.nextSteps.length>0&&e.jsxs("div",{className:"print:break-inside-avoid",children:[e.jsx("h4",{className:"text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 print:text-indigo-700",children:"Next Steps"}),e.jsx("ul",{className:"list-disc list-inside bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 space-y-2 print:border-none print:p-0 print:text-slate-800",children:t.nextSteps.map((r,s)=>e.jsx("li",{children:r},s))})]})]})]})}),e.jsxs("footer",{className:"p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0 no-print",children:[e.jsxs(o,{onClick:x,variant:"purple",disabled:!t||i,className:"flex items-center gap-2 !px-6",children:[e.jsx(b,{className:"w-5 h-5"}),"Print to PDF"]}),e.jsx(o,{variant:"secondary",onClick:n,className:"!px-6",children:"Close"})]})]}),e.jsx("style",{children:`
            @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            
            @media print {
                /* Reset standard page margins for clean PDF */
                @page { margin: 2cm; }

                /* Hide non-print elements */
                .no-print, header, footer, button, .sidebar, .mobile-taskbar {
                    display: none !important;
                }

                /* Container adjustments */
                body, #root, .print-container {
                    background: white !important;
                    height: auto !important;
                    position: static !important;
                    overflow: visible !important;
                }

                /* Content layout */
                .print-content {
                    position: static !important;
                    overflow: visible !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    width: 100% !important;
                }

                .max-w-5xl {
                    max-width: 100% !important;
                    width: 100% !important;
                }

                /* Typographical improvements for print */
                .prose {
                    color: #1a1a1a !important;
                    font-size: 11pt !important;
                    line-height: 1.5 !important;
                }

                .prose h1, .prose h2, .prose h3, .prose h4 {
                    color: #1a1a1a !important;
                    page-break-after: avoid;
                }

                .print-title {
                    display: block !important;
                }

                /* Theme fix: Force light mode colors for printing */
                * {
                    color-scheme: light !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                /* Ensure dark mode text is visible on white paper */
                .dark .print-content * {
                    color: #1a1a1a !important;
                    border-color: #e2e8f0 !important;
                }
            }
       `})]})};export{j as default};
