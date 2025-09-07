import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M16.5 18.75h-9a9.75 9.75 0 011.056-5.25H15.444A9.75 9.75 0 0116.5 18.75z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 14.25v5.25m-6.75-5.25v5.25m13.5-5.25v5.25M12 3.75l-4.5 4.5v3.75h9V8.25l-4.5-4.5z"
    />
  </svg>
);