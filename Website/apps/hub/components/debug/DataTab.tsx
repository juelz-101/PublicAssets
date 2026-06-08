import React, { useState } from 'react';
import { Manifest, SiteData } from '../../services/contentService';

interface DataTabProps {
    manifest: Manifest | null;
    siteData: SiteData | null;
}

type DataSubTab = 'Manifest' | 'Site Data';

const SubTabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-200 ${
            active ? 'bg-amber-500/20 text-amber-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
    >
        {children}
    </button>
);


const DataTab: React.FC<DataTabProps> = ({ manifest, siteData }) => {
    const [activeSubTab, setActiveSubTab] = useState<DataSubTab>('Manifest');

    return (
        <div className="space-y-4 h-full flex flex-col">
            <nav className="flex gap-2 flex-shrink-0">
                <SubTabButton active={activeSubTab === 'Manifest'} onClick={() => setActiveSubTab('Manifest')}>Manifest</SubTabButton>
                <SubTabButton active={activeSubTab === 'Site Data'} onClick={() => setActiveSubTab('Site Data')}>Site Data</SubTabButton>
            </nav>
            <div className="flex-grow overflow-hidden">
                <pre className="text-xs bg-black/30 p-2 rounded-md text-gray-300 h-full overflow-y-auto">
                    <code>
                        {activeSubTab === 'Manifest' && JSON.stringify(manifest, null, 2)}
                        {activeSubTab === 'Site Data' && JSON.stringify(siteData, null, 2)}
                    </code>
                </pre>
            </div>
        </div>
    );
};

export default DataTab;
