import React from 'react';

// Define the view types
export type ViewMode = 'card' | 'list' | 'conveyor';

// Icon components
const CardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v3H5V5zm0 5h10v5H5v-5z" />
    </svg>
);

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const ConveyorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" transform="rotate(90)">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2-2H4a2 2 0 01-2-2v-4z" />
    </svg>
);


interface ViewSwitcherProps {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ activeView, setActiveView }) => {
  const views: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'card', icon: <CardIcon />, label: 'Card View' },
    { mode: 'list', icon: <ListIcon />, label: 'List View' },
    { mode: 'conveyor', icon: <ConveyorIcon />, label: 'Conveyor View' },
  ];

  return (
    <div className="flex items-center gap-1">
      {views.map(({ mode, icon, label }) => (
        <div key={mode} className="relative group">
          <button
            onClick={() => setActiveView(mode)}
            className={`px-2.5 py-1.5 flex items-center justify-center rounded-md transition-all duration-200 ${
              activeView === mode
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
            aria-label={label}
            aria-pressed={activeView === mode}
          >
            {icon}
          </button>
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ViewSwitcher;