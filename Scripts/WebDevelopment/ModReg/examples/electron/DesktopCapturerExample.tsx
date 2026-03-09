import React, { useState } from 'react';
import { desktopCapturer, DesktopCapturerSource } from '../../modules/electron/desktop-capturer';
import { ipc } from '../../modules/electron/ipc-wrapper';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button {...props} className={`bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition duration-300 disabled:bg-base-300 disabled:text-text-secondary disabled:border-base-300 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

const DesktopCapturerExample: React.FC = () => {
    const [sources, setSources] = useState<DesktopCapturerSource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSource, setSelectedSource] = useState<DesktopCapturerSource | null>(null);

    const handleGetSources = async () => {
        setIsLoading(true);
        try {
            const result = await desktopCapturer.getSources({ 
                types: ['window', 'screen'],
                thumbnailSize: { width: 300, height: 200 }
            });
            setSources(result);
        } catch (error) {
            console.error(error);
            alert("Failed to get sources.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (source: DesktopCapturerSource) => {
        setSelectedSource(source);
        if (ipc.isElectron()) {
            console.log(`Selected source ID for getUserMedia: ${source.id}`);
        } else {
            console.log(`[Mock] Selected source: ${source.name}`);
        }
    };

    return (
        <div className="space-y-8">
             <div className={`p-4 rounded-lg border ${ipc.isElectron() ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'}`}>
                <p className="font-bold text-center">
                    {ipc.isElectron() ? "Electron Environment" : "Browser Mock Mode"}
                </p>
                {!ipc.isElectron() && <p className="text-center text-xs mt-1">Sources are simulated. In Electron, these would be real windows/screens.</p>}
            </div>

            <FuturisticCard title="Screen Sources" description="List available screens and windows for capture.">
                <div className="mb-4">
                    <FuturisticButton onClick={handleGetSources} disabled={isLoading} className="w-full">
                        {isLoading ? 'Scanning Sources...' : 'Get Sources'}
                    </FuturisticButton>
                </div>
                
                {sources.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                        {sources.map(source => (
                            <div 
                                key={source.id} 
                                onClick={() => handleSelect(source)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-base-300/50 ${selectedSource?.id === source.id ? 'border-neon-teal bg-neon-teal/10' : 'border-base-300 bg-base-100/50'}`}
                            >
                                <div className="aspect-video bg-black rounded overflow-hidden mb-2 border border-base-300">
                                    <img src={source.thumbnail} alt={source.name} className="w-full h-full object-contain" />
                                </div>
                                <p className="font-bold text-sm truncate" title={source.name}>{source.name}</p>
                                <p className="text-xs text-text-secondary font-mono truncate">{source.id}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-text-secondary py-8 italic bg-base-100/30 rounded-lg">
                        No sources loaded. Click "Get Sources" to begin.
                    </div>
                )}
            </FuturisticCard>

            {selectedSource && (
                <FuturisticCard title="Selection Details" description="Information needed to start a stream.">
                    <div className="space-y-2 font-mono text-sm">
                        <p><span className="text-text-secondary">Name:</span> <span className="text-neon-pink">{selectedSource.name}</span></p>
                        <p><span className="text-text-secondary">ID:</span> <span className="text-text-primary">{selectedSource.id}</span></p>
                        <p><span className="text-text-secondary">Display ID:</span> <span className="text-text-primary">{selectedSource.display_id || 'N/A'}</span></p>
                    </div>
                    <div className="mt-4 p-3 bg-base-300/50 rounded text-xs text-text-secondary">
                        To capture this source in a real app, you would pass <code>chromeMediaSourceId: '{selectedSource.id}'</code> to <code>navigator.mediaDevices.getUserMedia</code>.
                    </div>
                </FuturisticCard>
            )}
        </div>
    );
};

export default DesktopCapturerExample;
