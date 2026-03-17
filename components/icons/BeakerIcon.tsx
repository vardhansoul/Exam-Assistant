import React from 'react';

const BeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.023.501.05.75.082m.75.082a24.301 24.301 0 014.5 0m4.5 0a24.301 24.301 0 014.5 0m-13.5 0c.251.023.501.05.75.082m-1.5.082v5.714a2.25 2.25 0 00.659 1.591L12.5 14.5M14.25 3.104c.251.023.501.05.75.082m-.75.082a24.301 24.301 0 004.5 0m4.5 0a24.301 24.301 0 004.5 0M12.5 14.5v5.714a2.25 2.25 0 01-1.591.659L9.75 21.75l-2.909-.659A2.25 2.25 0 015 19.5V14.5m14-9.396c.251.023.501.05.75.082M12.5 14.5h5.714a2.25 2.25 0 001.591-.659l2.909-2.909c.63-.63.63-1.652 0-2.282l-2.909-2.909A2.25 2.25 0 0018.214 5H12.5m-2.25 9.5h2.25" />
    </svg>
);

export default BeakerIcon;
