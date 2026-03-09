import React, { useState } from 'react';
import { taskbar } from '../../modules/electron/taskbar-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const TaskbarUtilsExample: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [badgeCount, setBadgeCount] = useState(0);
    const [recentPath, setRecentPath] = useState('/path/to/file.txt');
    const [tooltip, setTooltip] = useState('My App');

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setProgress(val);
        taskbar.setProgressBar(val);
    };

    const handleBadgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setBadgeCount(val);
        taskbar.setBadgeCount(val);
    };

    const handleFlash = () => {
        taskbar.flashFrame(true);
        setTimeout(() => taskbar.flashFrame(false), 3000); // Stop after 3s
    };

    const setOverlayGreen = () => {
        // Simple green dot data URI
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='8' fill='#00ff9f'/></svg>`;
        const dataUri = `data:image/svg+xml;base64,${btoa(svg)}`;
        taskbar.setOverlayIcon(dataUri, 'Status: OK');
    };

    const clearOverlay = () => {
        taskbar.setOverlayIcon(null, '');
    };

    const updateTooltip = () => {
        taskbar.setThumbnailTooltip(tooltip);
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="Taskbar / Dock Integration" description="Control how the application appears in the OS taskbar.">
                <div>
                    <label className="block text-text-secondary mb-2">Progress Bar ({Math.round(progress * 100)}%)</label>
                    <input 
                        type="range" 
                        min="-1" 
                        max="1" 
                        step="0.1" 
                        value={progress} 
                        onChange={handleProgressChange} 
                        className="w-full accent-neon-teal"
                    />
                    <p className="text-xs text-text-secondary mt-1">-1 clears the progress bar.</p>
                </div>

                <div>
                    <label className="block text-text-secondary mb-2">Badge Count (MacOS/Linux)</label>
                    <input 
                        type="number" 
                        min="0" 
                        value={badgeCount} 
                        onChange={handleBadgeChange} 
                        className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary"
                    />
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={handleFlash}
                        className="flex-1 bg-neon-pink/20 hover:bg-neon-pink/30 text-neon-pink border border-neon-pink font-bold py-2 px-4 rounded transition"
                    >
                        Flash Frame
                    </button>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Windows Specific Features" description="Overlay icons and jump lists.">
                <div className="flex gap-4 mb-4">
                    <button onClick={setOverlayGreen} className="flex-1 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green font-bold py-2 px-4 rounded">Set Overlay (Green)</button>
                    <button onClick={clearOverlay} className="flex-1 bg-base-300 hover:bg-base-300/80 text-text-primary border border-base-300 font-bold py-2 px-4 rounded">Clear Overlay</button>
                </div>
                
                <div className="flex gap-2 items-end mb-4">
                    <div className="flex-grow">
                        <label className="block text-text-secondary mb-1">Thumbnail Tooltip</label>
                        <input 
                            type="text" 
                            value={tooltip} 
                            onChange={(e) => setTooltip(e.target.value)} 
                            className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary"
                        />
                    </div>
                    <button onClick={updateTooltip} className="bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded">Set</button>
                </div>

                <div className="flex gap-2 items-end">
                    <div className="flex-grow">
                        <label className="block text-text-secondary mb-1">Recent Document Path</label>
                        <input 
                            type="text" 
                            value={recentPath} 
                            onChange={(e) => setRecentPath(e.target.value)} 
                            className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary"
                        />
                    </div>
                    <button onClick={() => taskbar.addRecentDocument(recentPath)} className="bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue font-bold py-2 px-4 rounded">Add</button>
                </div>
                <div className="mt-2 text-right">
                     <button onClick={() => taskbar.clearRecentDocuments()} className="text-xs text-neon-red hover:underline">Clear All Recent Docs</button>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default TaskbarUtilsExample;
