import React from 'react';
import { Tab } from '../types';
import { Manifest } from '../services/contentService';
import GitHubImage from './GitHubImage';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  manifest: Manifest | null;
  isDebug: boolean;
}

const TABS: Tab[] = [
  Tab.Home,
  Tab.Music,
  Tab.Art,
  Tab.Tools,
  Tab.Gaming,
  Tab.Community,
  Tab.Library,
  Tab.About,
];

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, manifest, isDebug }) => {
  
  const fullLogoPath = manifest?.data?.images?.logos
    ? `${manifest.data.images.logos.dir}/${manifest.data.images.logos.main_logo}`
    : '';

  const visibleTabs = TABS;
    
  return (
    <header className="w-full bg-gray-900/50 sticky top-0 z-50 border-b border-white/10 shadow-lg"
      style={{ backdropFilter: `blur(var(--header-blur-amount))` }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 flex flex-col md:flex-row md:justify-center md:items-center py-2 relative">
        
        {/* Logo Section - Positioned absolutely on desktop, stacked on mobile */}
        <div className="w-full md:w-auto md:absolute md:left-4 md:top-1/2 md:-translate-y-1/2 flex justify-center md:justify-start mb-2 md:mb-0">
          <div className="w-48">
            {fullLogoPath ? (
              <div
                className="relative w-full h-12"
                style={{ filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))' }}
              >
                <GitHubImage
                  manifest={manifest}
                  path={fullLogoPath}
                  alt="ZIKYinc Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="text-3xl font-bold text-amber-400 tracking-wider" style={{ textShadow: '0 0 8px rgba(251, 191, 36, 0.5)' }}>
                ZIKYinc
              </div>
            )}
          </div>
        </div>
      
        {/* Nav Section - Will be centered on desktop */}
        <nav aria-label="Main navigation">
          <div className="flex space-x-1 sm:space-x-2">
            {visibleTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-3 py-2 text-sm sm:px-4 sm:text-base font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-t-md ${
                  activeTab === tab
                    ? 'text-amber-400'
                    : 'text-gray-300 hover:text-white'
                }`}
                aria-current={activeTab === tab ? 'page' : undefined}
              >
                <span className="relative z-10 font-semibold tracking-wide">{tab}</span>
                 {activeTab === tab && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full z-0"
                    style={{ boxShadow: '0 0 8px rgba(251, 191, 36, 0.8)' }}
                    aria-hidden="true"
                  ></span>
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;