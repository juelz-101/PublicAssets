import React, { useState } from 'react';
// FIX: Using namespace import to resolve "no exported member" errors.
import * as ReactRouterDOM from 'react-router-dom';
import type { ModuleCategory, SystemCategory } from '../types';
import FolderIcon from './icons/FolderIcon';
import FileIcon from './icons/FileIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import Squares2X2Icon from './icons/Squares2X2Icon';

const { NavLink } = ReactRouterDOM;

interface ModuleListModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleData: ModuleCategory[];
  systemData: SystemCategory[];
}

const ModuleListModal: React.FC<ModuleListModalProps> = ({ isOpen, onClose, moduleData, systemData }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [openSystemCategories, setOpenSystemCategories] = useState<Record<string, boolean>>({});

  if (!isOpen) {
    return null;
  }

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleSystemCategory = (category: string) => {
    setOpenSystemCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const moduleLinkBaseClass = "flex items-center space-x-3 w-full text-left p-2 rounded-md transition-all duration-200 text-text-secondary hover:bg-base-300/50 hover:text-text-primary";
  const moduleLinkActiveClass = "bg-neon-teal/10 text-neon-teal shadow-glow-sm";

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
      onClick={onClose}
    >
      <div
        className="fixed inset-x-0 bottom-0 top-16 bg-base-200/80 backdrop-blur-2xl rounded-t-2xl border-t border-neon-teal/20 shadow-glow-lg flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-neon-teal/20 flex-shrink-0">
          <h2 className="text-xl font-bold text-text-primary">Browse Registry</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-text-secondary hover:bg-base-300/50 hover:text-neon-teal focus:outline-none focus:ring-2 focus:ring-neon-teal/50"
            aria-label="Close module browser"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <nav className="flex-grow overflow-y-auto p-4">
          <ul className="space-y-4">
            {/* Systems Section */}
            {systemData.length > 0 && (
              <li>
                <h3 className="text-xs font-bold text-neon-pink uppercase tracking-widest mb-2 px-2">Systems</h3>
                <ul className="space-y-1">
                  {systemData.map((category) => (
                    <li key={category.category}>
                      <button
                        onClick={() => toggleSystemCategory(category.category)}
                        className="flex items-center justify-between w-full text-left p-2 rounded-md text-text-primary hover:bg-base-300/50 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <Squares2X2Icon className="w-5 h-5 text-neon-pink" />
                          <span className="font-semibold">{category.category}</span>
                        </div>
                        <ChevronDownIcon
                          className={`w-4 h-4 transform transition-transform duration-200 text-neon-pink ${
                            openSystemCategories[category.category] ? 'rotate-180' : 'rotate-0'
                          }`}
                        />
                      </button>
                      {openSystemCategories[category.category] && (
                        <ul className="pl-6 pt-2 space-y-1">
                          {category.systems.map((system) => (
                            <li key={system.name}>
                              <NavLink
                                to={`/systems/${encodeURIComponent(category.category)}/${encodeURIComponent(system.name)}`}
                                className={({ isActive }) => `${moduleLinkBaseClass} ${isActive ? moduleLinkActiveClass : ''}`}
                                onClick={handleLinkClick}
                              >
                                <FileIcon className="w-5 h-5 flex-shrink-0 text-neon-pink/70" />
                                <span className="truncate">{system.name}</span>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            )}

            {/* Modules Section */}
            <li>
              <h3 className="text-xs font-bold text-neon-teal uppercase tracking-widest mb-2 px-2">Modules</h3>
              <ul className="space-y-1">
                {moduleData.map((category) => (
                  <li key={category.category}>
                    <button
                      onClick={() => toggleCategory(category.category)}
                      className="flex items-center justify-between w-full text-left p-2 rounded-md text-text-primary hover:bg-base-300/50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <FolderIcon className="w-5 h-5" />
                        <span className="font-semibold">{category.category}</span>
                      </div>
                      <ChevronDownIcon
                        className={`w-4 h-4 transform transition-transform duration-200 text-neon-teal ${
                          openCategories[category.category] ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                    {openCategories[category.category] && (
                      <ul className="pl-6 pt-2 space-y-1">
                        {category.modules.map((module) => (
                          <li key={module.name}>
                            <NavLink
                              to={`/examples/${encodeURIComponent(category.category)}/${encodeURIComponent(module.name)}`}
                              className={({ isActive }) => `${moduleLinkBaseClass} ${isActive ? moduleLinkActiveClass : ''}`}
                              onClick={handleLinkClick}
                            >
                              <FileIcon className="w-5 h-5 flex-shrink-0" />
                              <span className="truncate">{module.name}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ModuleListModal;