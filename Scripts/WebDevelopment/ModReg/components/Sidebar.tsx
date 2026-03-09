import React, { useState } from 'react';
// FIX: Using namespace import to resolve "no exported member" errors.
import * as ReactRouterDOM from 'react-router-dom';
import type { ModuleCategory, SystemCategory } from '../types';
import FolderIcon from './icons/FolderIcon';
import FileIcon from './icons/FileIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import LabIcon from './icons/LabIcon';
import HomeIcon from './icons/HomeIcon';
import MenuIcon from './icons/MenuIcon';
import SettingsIcon from './icons/SettingsIcon';
import Squares2X2Icon from './icons/Squares2X2Icon';
import { APP_VERSION } from '../version';

const { NavLink } = ReactRouterDOM;

interface SidebarProps {
  moduleData: ModuleCategory[];
  systemData: SystemCategory[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSettingsClick: () => void;
  onBulkClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ moduleData, systemData, isOpen, setIsOpen, onSettingsClick, onBulkClick }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [openSystemCategories, setOpenSystemCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleSystemCategory = (category: string) => {
    setOpenSystemCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const navLinkBaseClass = isOpen 
    ? "flex items-center group relative transition-all duration-200 w-full space-x-3 p-2 rounded-md text-text-secondary hover:bg-base-300/50 hover:text-neon-teal"
    : "flex items-center group relative transition-all duration-200 w-14 h-14 rounded-full justify-center border text-text-secondary border-neon-teal/20 hover:text-neon-teal hover:border-neon-teal/70 hover:shadow-glow-sm";
  
  const navLinkActiveClass = isOpen
    ? "bg-neon-teal/20 text-neon-teal shadow-glow-sm"
    : "text-neon-teal border-neon-teal/70 bg-neon-teal/10 shadow-glow-md";

  const moduleLinkBaseClass = "flex items-center space-x-3 w-full text-left p-2 rounded-md transition-all duration-200 text-text-secondary hover:bg-base-300/50 hover:text-text-primary";
  const moduleLinkActiveClass = "bg-neon-teal/10 text-neon-teal shadow-glow-sm";

  // When closed, we hide text using w-0 and overflow-hidden to prevent layout shift.
  // Delay is removed to prevent jitter during the closing transition.
  const labelClass = `whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100 w-auto ml-2 overflow-visible' : 'opacity-0 w-0 overflow-hidden ml-0'}`;

  return (
    <aside className={`bg-base-200/30 backdrop-blur-lg p-4 flex flex-col h-full border-r border-neon-teal/20 shadow-glow-lg transition-all duration-300 ease-in-out ${isOpen ? 'w-72' : 'w-24'} hidden md:flex`}>
      
      <div className={`flex items-center mb-6 transition-all duration-300 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        <h1 className={`text-2xl font-bold text-neon-teal tracking-widest transition-all duration-200 overflow-hidden ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
          REGISTRY
        </h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-base-300/50 text-neon-teal focus:outline-none focus:ring-2 focus:ring-neon-teal/50 flex-shrink-0">
          <MenuIcon className={`w-6 h-6 transition-transform duration-300 ${isOpen ? '' : 'rotate-90'}`} />
        </button>
      </div>

      <nav className="flex-grow overflow-y-auto overflow-x-hidden -mr-4 pr-4">
        <ul className={`space-y-2 ${!isOpen ? 'flex flex-col items-center' : ''}`}>
          <li>
            <NavLink to="/" end className={({ isActive }) => `${navLinkBaseClass} ${isActive ? navLinkActiveClass : ''}`}>
              <HomeIcon className="w-7 h-7 flex-shrink-0" />
              <span className={labelClass}>Home</span>
              {!isOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-base-300 text-text-primary text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-nowrap">
                  Home
                </div>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink to="/playground" className={({ isActive }) => `${navLinkBaseClass} ${isActive ? navLinkActiveClass : ''}`}>
              <LabIcon className="w-7 h-7 flex-shrink-0" />
              <span className={labelClass}>Playground</span>
              {!isOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-base-300 text-text-primary text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-nowrap">
                  Playground
                </div>
              )}
            </NavLink>
          </li>
          
          <div className={`w-full transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            {/* Systems Section */}
            {systemData.length > 0 && (
              <>
                <li className="pt-4 mt-4 border-t border-neon-teal/20">
                  <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider px-2 mb-2">Systems</h2>
                </li>
                {systemData.map((category) => (
                  <li key={category.category}>
                    <button
                      onClick={() => toggleSystemCategory(category.category)}
                      className="flex items-center justify-between w-full text-left p-2 rounded-md text-text-primary hover:bg-base-300/50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <Squares2X2Icon className="w-5 h-5 flex-shrink-0 text-neon-pink" />
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
                            >
                              <FileIcon className="w-5 h-5 flex-shrink-0 text-neon-pink/70"/>
                              <span className="truncate">{system.name}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </>
            )}

            {/* Modules Section */}
            <li className="pt-4 mt-4 border-t border-neon-teal/20">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider px-2 mb-2">Modules</h2>
            </li>
            {moduleData.map((category) => (
              <li key={category.category}>
                <button
                  onClick={() => toggleCategory(category.category)}
                  className="flex items-center justify-between w-full text-left p-2 rounded-md text-text-primary hover:bg-base-300/50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <FolderIcon className="w-5 h-5 flex-shrink-0" />
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
                        >
                          <FileIcon className="w-5 h-5 flex-shrink-0"/>
                          <span className="truncate">{module.name}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </div>
        </ul>
      </nav>

      <div className={`mt-auto pt-4 border-t border-neon-teal/20 flex flex-col gap-2 transition-all duration-300 ${isOpen ? 'justify-start' : 'items-center'}`}>
        <button onClick={onBulkClick} className={navLinkBaseClass}>
            <div className={`flex items-center justify-center flex-shrink-0`}>
                <span className={`flex items-center justify-center font-bold border-2 border-current rounded transition-all w-7 h-7 text-sm`}>+</span>
            </div>
            <span className={labelClass}>Bulk Actions</span>
             {!isOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-base-300 text-text-primary text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-nowrap">
                    Bulk Actions
                </div>
            )}
        </button>
        <button onClick={onSettingsClick} className={navLinkBaseClass}>
            <SettingsIcon className="w-7 h-7 flex-shrink-0" />
            <span className={labelClass}>Settings</span>
            {!isOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-base-300 text-text-primary text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-nowrap">
                    Settings
                </div>
            )}
        </button>
        
        {/* ZIKYinc Footer */}
        <div className={`text-center mt-2 overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 max-h-12' : 'opacity-0 max-h-0'}`}>
            <p className="text-[10px] text-text-secondary font-mono tracking-widest uppercase">ZIKYinc</p>
            <p className="text-[10px] text-neon-teal/60 font-mono">v{APP_VERSION}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;