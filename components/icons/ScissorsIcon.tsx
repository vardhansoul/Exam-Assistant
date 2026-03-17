import React from 'react';

const ScissorsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.23 7.23 16.77 16.77M7.23 16.77 16.77 7.23" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM15 16.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z" />
  </svg>
);

export default ScissorsIcon;