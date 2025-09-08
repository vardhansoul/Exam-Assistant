import React from 'react';

export const RectangleGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 7.125A2.25 2.25 0 014.5 4.875h15a2.25 2.25 0 012.25 2.25v9.75a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v-9.75z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12h19.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.875v14.25"
    />
  </svg>
);