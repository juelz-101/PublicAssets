import React from 'react';
// FIX: Using namespace import to resolve "no exported member" errors.
import * as ReactRouterDOM from 'react-router-dom';
import LabIcon from './icons/LabIcon';
import FolderIcon from './icons/FolderIcon';

const { Link } = ReactRouterDOM;

interface WelcomeProps {
  onBrowseModules: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onBrowseModules }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onBrowseModules();
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-full">
      <div className="text-center p-8">
        <h2 className="text-4xl font-bold text-neon-teal mb-4" style={{ textShadow: '0 0 10px var(--color-glow)' }}>Welcome to the Module Registry</h2>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          A centralized hub for discovering, testing, and experimenting with reusable code modules.
          Use the sidebar to navigate or jump into the playground to brainstorm new ideas.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div
            onClick={onBrowseModules}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            className="bg-base-200/30 backdrop-blur-md p-6 rounded-xl border border-neon-teal/20 shadow-glow-md transition-all hover:border-neon-teal/40 hover:shadow-glow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-neon-teal/50"
          >
            <FolderIcon className="h-10 w-10 text-neon-teal mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-text-primary mb-2">Browse Modules</h3>
            <p className="text-text-secondary">
              Explore categorized modules in the sidebar. Each module has a dedicated page with documentation and interactive examples to demonstrate its functionality.
            </p>
          </div>
          <Link 
            to="/playground"
            className="block bg-base-200/30 backdrop-blur-md p-6 rounded-xl border border-neon-teal/20 shadow-glow-md transition-all hover:border-neon-teal/40 hover:shadow-glow-lg focus:outline-none focus:ring-2 focus:ring-neon-teal/50"
          >
            <LabIcon className="h-10 w-10 text-neon-teal mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-text-primary mb-2">Experiment in the Playground</h3>
            <p className="text-text-secondary">
              The Playground is your personal sandbox. Test out module functions, prototype new ideas, or just experiment freely without affecting any of the registered modules.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;