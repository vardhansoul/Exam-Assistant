import React from 'react';
const InformationCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.25 2.25M12 17.25h.008v.008H12v-.008zm0 0h.008v.008H12v-.008zm0-8.25h.008v.008H12V9zm0 0h.008v.008H12V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
);
export default InformationCircleIcon;
