import React from 'react';

interface LabIconProps extends React.SVGProps<SVGSVGElement> {
  // no custom props
}

const LabIcon: React.FC<LabIconProps> = (props) => (
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
    {/* Base of the flask */}
    <path d="M7 21h10L14 12H10z" />
    {/* Neck of the flask */}
    <path d="M12 21L12 12" />
    <path d="M10 5h4" />
    <path d="M9 7L9 10" />
    <path d="M15 7L15 10" />
    {/* Bubbles or liquid inside */}
    <circle cx="12" cy="18" r="1.5" />
    <circle cx="10" cy="15" r="1" />
  </svg>
);

export default LabIcon;