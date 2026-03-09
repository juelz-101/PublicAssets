import React from 'react';
// FIX: Using namespace import to resolve "no exported member" errors.
import * as ReactRouterDOM from 'react-router-dom';
import HomeIcon from './icons/HomeIcon';
import LabIcon from './icons/LabIcon';
import Squares2X2Icon from './icons/Squares2X2Icon';
import SettingsIcon from './icons/SettingsIcon';

const { NavLink } = ReactRouterDOM;

interface MobileToolbarProps {
  onModulesClick: () => void;
  onSettingsClick: () => void;
  onBulkClick: () => void;
}

const MobileToolbar: React.FC<MobileToolbarProps> = ({ onModulesClick, onSettingsClick, onBulkClick }) => {
  const navLinkBaseClass = "flex flex-col items-center justify-center space-y-1 p-2 flex-grow transition-colors duration-200 text-text-secondary hover:text-neon-teal";
  const navLinkActiveClass = "text-neon-teal";

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-base-200/80 backdrop-blur-2xl border-t border-neon-teal/20 shadow-glow-lg flex items-center justify-around z-30 md:hidden">
      <NavLink to="/" end className={({ isActive }) => `${navLinkBaseClass} ${isActive ? navLinkActiveClass : ''}`}>
        <HomeIcon className="w-6 h-6" />
        <span className="text-xs">Home</span>
      </NavLink>
      <button onClick={onModulesClick} className={navLinkBaseClass}>
        <Squares2X2Icon className="w-6 h-6" />
        <span className="text-xs">Modules</span>
      </button>
      <NavLink to="/playground" className={({ isActive }) => `${navLinkBaseClass} ${isActive ? navLinkActiveClass : ''}`}>
        <LabIcon className="w-6 h-6" />
        <span className="text-xs">Playground</span>
      </NavLink>
      <button onClick={onBulkClick} className={navLinkBaseClass}>
        <span className="text-xl font-bold leading-none">+</span>
        <span className="text-xs">Bulk</span>
      </button>
      <button onClick={onSettingsClick} className={navLinkBaseClass}>
        <SettingsIcon className="w-6 h-6" />
        <span className="text-xs">Settings</span>
      </button>
    </div>
  );
};

export default MobileToolbar;