import React from 'react';

const iconProps = {
  className: "w-5 h-5 mr-2",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const ShapesIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

export const ColorsIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 2a10 10 0 000 20z"></path>
    <path d="M12 2a10 10 0 010 20z"></path>
    <path d="M2 12A10 10 0 0112 2v20a10 10 0 01-10-10z"></path>
  </svg>
);

export const LogoIcon = () => (
    <svg {...iconProps}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
);

export const CornersIcon = () => (
    <svg {...iconProps}>
        <path d="M3 8V4a1 1 0 0 1 1-1h4"></path>
        <path d="M21 8V4a1 1 0 0 0-1-1h-4"></path>
        <path d="M3 16v4a1 1 0 0 0 1 1h4"></path>
        <path d="M21 16v4a1 1 0 0 1-1 1h-4"></path>
    </svg>
);

export const FramesIcon = () => (
    <svg {...iconProps}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <rect x="7" y="7" width="10" height="10" rx="1" ry="1"></rect>
    </svg>
);

export const ExperimentalIcon = () => (
    <svg {...iconProps}>
        <path d="M10 2v7.31"></path>
        <path d="M14 9.31V2"></path>
        <path d="M12 15a4 4 0 0 0-4-4H4a4 4 0 0 0 4 4v4a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4v-4a4 4 0 0 0 4-4h-4a4 4 0 0 0-4 4Z"></path>
    </svg>
);

export const StarIcon = () => (
    <svg {...iconProps}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

export const PlusIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export const XIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export const DebugIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      <path d="M14.5 10.4a6 6 0 1 1-5 0" />
      <path d="M8 14h8" />
      <path d="M10 18h4" />
      <path d="M18 8l2-2" />
      <path d="m6 8-2-2" />
      <path d="m18 14 2 2" />
      <path d="m6 14-2 2" />
      <path d="M12 5V2" />
    </svg>
);