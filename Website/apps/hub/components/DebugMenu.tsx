// components/DebugMenu.tsx
import React, { useState, useCallback, useRef } from 'react';
import { SiteData } from '../services/contentService';
import { Manifest, ManifestUISettings } from '../types';
import CreatorTab from './debug/CreatorTab';
import DataTab from './debug/DataTab';
import OverridesTab from './debug/OverridesTab';
import SafeModeTab from './debug/SafeModeTab';
import FloatingOverridesCard from './debug/FloatingOverridesCard';

interface DebugMenuProps {
    manifest: Manifest | null;
    siteData: SiteData | null;
    uiSettings: ManifestUISettings | undefined;
    setUiSettings: (settings: ManifestUISettings) => void;
    setManifest: (manifest: Manifest) => void;
}

type MainDebugTab = 'Overrides' | 'Safe Mode' | 'Data' | 'Creator';

const DebugIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 16v-2m0-8v-2m0 4h.01M6 12H4m16 0h-2m-8-6H8m8 0h-2m-4 8H8m8 0h-2" />
    </svg>
);

const CloseIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
            active ? 'bg-amber-500/20 text-amber-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
    >
        {children}
    </button>
);


const DebugMenu: React.FC<DebugMenuProps> = ({ manifest, siteData, uiSettings, setUiSettings, setManifest }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<MainDebugTab>('Overrides');
    
    const [panelWidth, setPanelWidth] = useState(896); 
    const [isOverridesPoppedOut, setIsOverridesPoppedOut] = useState(false);

    const handleResize = useCallback((e: MouseEvent) => {
        const newWidth = window.innerWidth - e.clientX;
        setPanelWidth(Math.max(500, Math.min(newWidth, window.innerWidth * 0.9)));
    }, []);

    const stopResize = useCallback(() => {
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', stopResize);
    }, [handleResize]);

    const startResize = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', handleResize);
        window.addEventListener('mouseup', stopResize);
    }, [handleResize, stopResize]);

    const handlePopOut = () => {
        setIsOverridesPoppedOut(true);
        setIsOpen(false); 
    };
    const handlePopIn = () => setIsOverridesPoppedOut(false);

    if (!manifest?.cfg?.debug?.show_debug_icon) {
        return null;
    }

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'Overrides':
                if (isOverridesPoppedOut) {
                    return (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                            <h3 className="text-lg font-semibold text-amber-300">Overrides Popped Out</h3>
                            <p className="mt-1">The UI overrides panel is currently floating.</p>
                             <button
                                onClick={handlePopIn}
                                className="mt-4 px-4 py-2 text-sm font-semibold text-gray-900 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors"
                            >
                                Pop Back In
                            </button>
                        </div>
                    );
                }
                return <OverridesTab settings={uiSettings} onSettingsChange={setUiSettings} onPopOut={handlePopOut} />;
            case 'Safe Mode':
                return <SafeModeTab manifest={manifest} onManifestChange={setManifest} />;
            case 'Data':
                return <DataTab manifest={manifest} siteData={siteData} />;
            case 'Creator':
                return <CreatorTab />;
            default:
                return null;
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 right-4 z-[70] p-3 text-amber-300 bg-gray-900/50 backdrop-blur-md rounded-full ring-1 ring-white/10 shadow-lg hover:bg-gray-900/80 hover:text-amber-400 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="Toggle Debug Menu"
            >
                <DebugIcon />
            </button>
            
            {isOverridesPoppedOut && (
                <FloatingOverridesCard 
                    settings={uiSettings} 
                    onSettingsChange={setUiSettings} 
                    onPopIn={handlePopIn} 
                />
            )}

            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65]"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div 
                role="dialog"
                aria-modal="true"
                aria-labelledby="debug-menu-title"
                className={`fixed top-0 right-0 h-full bg-gray-900/80 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 z-[70] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ width: `${panelWidth}px` }}
            >
                <div
                    onMouseDown={startResize}
                    className="absolute top-0 -left-1 w-2 h-full cursor-col-resize z-10"
                    aria-label="Resize debug menu"
                />
                <div className="flex flex-col h-full">
                    <header className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0">
                        <h2 id="debug-menu-title" className="text-xl font-bold text-amber-400">Debug Menu</h2>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
                            aria-label="Close debug menu"
                        >
                            <CloseIcon />
                        </button>
                    </header>
                    <nav className="p-2 border-b border-white/10 flex-shrink-0 flex gap-2">
                        <TabButton active={activeTab === 'Overrides'} onClick={() => setActiveTab('Overrides')}>Overrides</TabButton>
                        <TabButton active={activeTab === 'Safe Mode'} onClick={() => setActiveTab('Safe Mode')}>Safe Mode</TabButton>
                        <TabButton active={activeTab === 'Data'} onClick={() => setActiveTab('Data')}>Data</TabButton>
                        <TabButton active={activeTab === 'Creator'} onClick={() => setActiveTab('Creator')}>Creator</TabButton>
                    </nav>
                    <div className="p-4 overflow-y-auto flex-grow">
                       {renderActiveTab()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DebugMenu;
