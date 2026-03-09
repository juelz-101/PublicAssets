import React, { useState, useEffect } from 'react';
import { webFrame } from '../../modules/electron/web-frame';
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

const WebFrameExample: React.FC = () => {
    const [zoomFactor, setZoomFactor] = useState(1);

    useEffect(() => {
        setZoomFactor(webFrame.getZoomFactor());
    }, []);

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = parseFloat(e.target.value);
        setZoomFactor(newVal);
        webFrame.setZoomFactor(newVal);
    };

    const resetZoom = () => {
        setZoomFactor(1);
        webFrame.setZoomFactor(1);
    };

    return (
        <div className="space-y-8">
             <div className={`p-4 rounded-lg border ${ipc.isElectron() ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'}`}>
                <p className="font-bold text-center">
                    {ipc.isElectron() ? "Electron Environment" : "Browser Mock Mode"}
                </p>
                {!ipc.isElectron() && <p className="text-center text-xs mt-1">Zoom is applied to the preview box below, not the whole page.</p>}
            </div>

            <FuturisticCard title="Zoom Control" description="Adjust the application zoom level.">
                <div className="flex items-center gap-4 mb-4">
                    <input 
                        type="range" 
                        min="0.5" 
                        max="3.0" 
                        step="0.1" 
                        value={zoomFactor} 
                        onChange={handleZoomChange} 
                        className="w-full accent-neon-teal"
                    />
                    <span className="font-mono w-16 text-right">{(zoomFactor * 100).toFixed(0)}%</span>
                </div>
                <button 
                    onClick={resetZoom}
                    className="bg-base-300 hover:bg-base-300/80 text-text-primary px-4 py-2 rounded transition w-full"
                >
                    Reset to 100%
                </button>
            </FuturisticCard>

            <FuturisticCard title="Visual Preview" description="This content scales based on the 'webFrame' zoom factor setting.">
                <div className="h-64 overflow-hidden bg-base-100/50 rounded-lg flex items-center justify-center border border-base-300 relative">
                    <div 
                        className="transition-transform duration-200 origin-center text-center p-8 bg-base-200 border border-neon-pink rounded-xl shadow-glow-sm"
                        style={{ transform: `scale(${zoomFactor})` }}
                    >
                        <h4 className="text-2xl font-bold text-neon-pink mb-2">Zoomable Content</h4>
                        <p className="text-text-primary">Current Scale: {zoomFactor}</p>
                        <div className="mt-4 flex gap-2 justify-center">
                            <div className="w-8 h-8 bg-neon-teal rounded-full animate-bounce" style={{ animationDuration: '1s' }}></div>
                            <div className="w-8 h-8 bg-neon-green rounded-full animate-bounce" style={{ animationDuration: '1.2s' }}></div>
                            <div className="w-8 h-8 bg-neon-blue rounded-full animate-bounce" style={{ animationDuration: '1.4s' }}></div>
                        </div>
                    </div>
                    <div className="absolute bottom-2 right-2 text-xs text-text-secondary opacity-50">
                        Preview Container
                    </div>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default WebFrameExample;
