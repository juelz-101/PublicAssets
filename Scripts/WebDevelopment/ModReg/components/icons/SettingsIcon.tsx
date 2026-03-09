import React from 'react';

const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="3" ry="3" />
    <path d="M7 2v20M12 2v20M17 2v20M2 7h20M2 12h20M2 17h20" />
    <circle cx="12" cy="12" r="3" strokeWidth="2" />
  </svg>
);

export default SettingsIcon;