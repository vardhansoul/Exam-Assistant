import{r as n,e as y,f as k,j as e,B as d,I as o,L as C,X as E,l as S,A as P,a as R}from"./index-x_IE3o7i.js";import{C as l}from"./Card-Bn45mCvn.js";import{P as I}from"./PrinterIcon-Iyzyx9V6.js";const j="resume_builder_state",_=({language:f,isOnline:N,user:i,canAccessPremium:c,requestAuth:p})=>{const[x,u]=n.useState({}),[h,b]=n.useState(null),[s,g]=n.useState(()=>y(j)||{fullName:"",email:"",phone:"",address:"",summary:"",workExperience:[],education:[],skills:[]});n.useEffect(()=>{k(j,s)},[s]);const r=(t,m)=>{g(a=>({...a,[t]:m}))},v=async()=>{if(!c){p();return}u(t=>({...t,summary:!0})),b(null);try{const t=`
                Full Name: ${s.fullName}
                Experience: ${s.workExperience.map(a=>`${a.jobTitle} at ${a.company}`).join(", ")}
                Skills: ${s.skills.join(", ")}
            `,m=await E(t,f,!i);g(a=>({...a,summary:m})),S((i==null?void 0:i.uid)||null,{type:"RESUME_BUILT",description:"Generated a resume summary with COC",view:P.AI_RESUME_BUILDER,context:{}})}catch(t){b(R(t))}u(t=>({...t,summary:!1}))},w=()=>{window.print()};return c?e.jsxs("div",{className:"max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start print-section-wrapper",children:[e.jsxs("div",{className:"space-y-6 no-print",children:[e.jsx("h1",{className:"text-3xl font-bold text-slate-800",children:"COC Resume Builder"}),h&&e.jsx("div",{className:"bg-red-100 text-red-700 p-3 rounded-md",children:h}),e.jsxs(l,{children:[e.jsx("h2",{className:"font-bold text-lg mb-4",children:"Personal Details"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsx(o,{label:"Full Name",value:s.fullName,onChange:t=>r("fullName",t.target.value)}),e.jsx(o,{label:"Email",type:"email",value:s.email,onChange:t=>r("email",t.target.value)}),e.jsx(o,{label:"Phone",type:"tel",value:s.phone,onChange:t=>r("phone",t.target.value)}),e.jsx(o,{label:"Address",value:s.address,onChange:t=>r("address",t.target.value)})]})]}),e.jsxs(l,{children:[e.jsxs("div",{className:"flex justify-between items-center mb-4",children:[e.jsx("h2",{className:"font-bold text-lg",children:"Professional Summary"}),e.jsx(d,{onClick:v,disabled:!N||x.summary,className:"!px-3 !py-1.5 text-xs flex items-center gap-1.5",children:x.summary?e.jsx(C,{}):"COC Generate"})]}),e.jsx("textarea",{value:s.summary,onChange:t=>r("summary",t.target.value),rows:5,className:"w-full p-2 border rounded"})]}),e.jsx(l,{children:e.jsx("p",{className:"text-sm text-slate-500",children:"More sections (Experience, Education, Skills) coming soon."})})]}),e.jsx("div",{className:"sticky top-24 print:static print:block print:w-full",children:e.jsxs(l,{className:"print:border-none print:shadow-none print:p-0",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 no-print",children:[e.jsx("h2",{className:"font-bold text-lg",children:"Live Preview"}),e.jsxs(d,{onClick:w,variant:"outline",className:"flex items-center gap-2 w-full sm:w-auto justify-center",children:[e.jsx(I,{className:"w-4 h-4"})," Print / Save PDF"]})]}),e.jsxs("div",{id:"resume-preview",className:"bg-white p-8 border rounded-lg min-h-[60vh] text-sm print:border-none print:p-0 print:text-black",children:[e.jsx("h2",{className:"text-3xl font-bold text-center text-slate-900 mb-1",children:s.fullName||"Your Name"}),e.jsx("p",{className:"text-center text-sm text-slate-600 mb-6",children:[s.email,s.phone,s.address].filter(Boolean).join(" | ")}),e.jsx("div",{className:"border-b-2 border-slate-300 mb-3 pb-1",children:e.jsx("h3",{className:"font-bold text-lg uppercase tracking-wide text-slate-800",children:"Professional Summary"})}),e.jsx("p",{className:"text-slate-700 leading-relaxed mb-6",children:s.summary||"Your professional summary will appear here."}),e.jsx("div",{className:"border-b-2 border-slate-300 mb-3 pb-1",children:e.jsx("h3",{className:"font-bold text-lg uppercase tracking-wide text-slate-800",children:"Experience"})}),e.jsx("p",{className:"text-slate-500 italic mb-6",children:"Add work experience to see it here."}),e.jsx("div",{className:"border-b-2 border-slate-300 mb-3 pb-1",children:e.jsx("h3",{className:"font-bold text-lg uppercase tracking-wide text-slate-800",children:"Education"})}),e.jsx("p",{className:"text-slate-500 italic mb-6",children:"Add education to see it here."})]})]})}),e.jsx("style",{children:`
                @media print {
                    .no-print, header, .sidebar, .mobile-taskbar, button { display: none !important; }
                    body, #root, main, .print-section-wrapper { 
                        display: block !important; 
                        position: static !important; 
                        background: white !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        width: 100% !important; 
                        height: auto !important; 
                        overflow: visible !important;
                    }
                    /* Hide the form column */
                    .print-section-wrapper > div:first-child {
                        display: none !important;
                    }
                    /* Style the preview column */
                    .print-section-wrapper > div:last-child {
                        display: block !important;
                        width: 100% !important;
                        position: static !important;
                    }
                    
                    @page { margin: 1cm; }
                }
            `})]}):e.jsx("div",{className:"max-w-4xl mx-auto",children:e.jsxs(l,{className:"text-center",children:[e.jsx("h2",{className:"text-2xl font-bold text-slate-800 dark:text-slate-100",children:"Premium Feature"}),e.jsx("p",{className:"mt-2 text-slate-500 dark:text-slate-400",children:"Your trial has ended. Please sign up or log in to use the COC Resume Builder."}),e.jsx("div",{className:"mt-6",children:e.jsx(d,{onClick:p,children:"Sign Up / Log In"})})]})})};export{_ as default};
