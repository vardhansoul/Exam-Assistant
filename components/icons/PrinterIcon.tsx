
import React from 'react';

const PrinterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.89l-4.72-4.72 4.72-4.72m10.56 0l4.72 4.72-4.72 4.72M4.5 9h15" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 21h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75A2.25 2.25 0 006.75 21z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15h6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75V6" />
    </svg>
);

export default PrinterIcon;
