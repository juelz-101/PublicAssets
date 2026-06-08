import React, { useState, useEffect, useRef } from 'react';
import { ToolBridge } from '../../services/ToolBridge';
import { Manifest } from '../../services/contentService';

interface StandaloneLoaderProps {
    toolConfig: any;
    manifest?: Manifest | null;
    onClose: () => void;
}

const StandaloneLoader: React.FC<StandaloneLoaderProps> = ({ toolConfig, manifest, onClose }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [launchUrl, setLaunchUrl] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!toolConfig) return;

        const path = toolConfig.app_path;
        if (!path) {
            setError(`System Failure: Tool configuration is missing an executable path.`);
            setLoading(false);
            return;
        }

        // Check if the manifest info is available and it targets a github repo deployment
        // Combine with repo params as requested
        if (manifest && manifest.data?.git) {
             const { user, repo, branch } = manifest.data.git;
             
             // If source type is explicitly 'repo' or they want to combine with repo params
             // Assume they are hosting via GitHub Pages for now (since raw content blocks scripts)
             // Or they can map it to their specific domain.
             let cleanPath = path.startsWith('/') ? path.slice(1) : path;
             // If the app_path implies public directory, ensure it maps to their Github pages repo correctly.
             // Normally gh-pages hosts the `public` or repo root at the base path.
             const repoUrl = `https://${user}.github.io/${repo}/${cleanPath}`;
             
             setLaunchUrl(repoUrl);
             // Note: In development mode, if GitHub Pages isn't deployed yet, this might return 404
             // but this correctly combines the app link with repo params.
        } else {
             // Fallback local construction
             const cleanPath = path.startsWith('/') ? path : `/${path}`;
             const currentBase = window.location.href.split('?')[0].split('#')[0];
             const appUrl = new URL(cleanPath, currentBase);
             setLaunchUrl(appUrl.toString());
        }
    }, [toolConfig, manifest]);

    useEffect(() => {
        const cleanup = ToolBridge.listenToTool((data) => {
            if (data.action === 'READY') {
                setIsReady(true);
                setLoading(false);
                console.log('[ZIKY_OS] Tool reported READY:', data.payload);
            }
        });

        return cleanup;
    }, []);

    // Fallback to clear loading state if tool doesn't send READY
    const handleIframeLoad = () => {
        setTimeout(() => {
            if (!isReady) {
                setLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="flex-grow flex flex-col bg-gray-950 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-3xl animate-fade-in-up relative h-full min-h-[600px]">
            {/* Control Bar */}
            <div className="h-14 bg-gray-900/90 backdrop-blur-xl border-b border-white/10 px-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`} />
                    <h2 className="text-amber-400 font-bold tracking-wider uppercase text-sm truncate max-w-[150px] sm:max-w-none">{toolConfig?.name || 'Loading...'}</h2>
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 rounded-lg transition-all"
                >
                    <span className="hidden sm:inline">Close System</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Viewport */}
            <div className="flex-grow relative bg-white overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 z-20">
                        <div className="w-12 h-12 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin mb-6" />
                        <div className="text-amber-400 font-mono text-[10px] tracking-[0.3em] uppercase animate-pulse">Initializing Virtual Sandbox...</div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-center p-6 z-20">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/30">
                             <span className="text-red-500 text-3xl">!</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">Container Failure</h3>
                        <p className="text-gray-400 max-w-sm text-sm leading-relaxed mb-4">{error}</p>
                        <button onClick={onClose} className="px-8 py-3 bg-white/5 text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold uppercase text-xs tracking-widest">Return to Base</button>
                    </div>
                )}

                {launchUrl && !error && (
                    <iframe
                        ref={iframeRef}
                        src={launchUrl}
                        title={toolConfig?.name || 'Tool'}
                        className="w-full h-full border-none"
                        sandbox="allow-scripts allow-same-origin"
                        onLoad={handleIframeLoad}
                    />
                )}
            </div>
            
            {/* Status Strip */}
            <div className="h-6 bg-black border-t border-white/5 px-4 flex items-center justify-between">
                 <div className="flex gap-4 text-[8px] font-mono font-bold text-gray-500">
                    <span>MODE: BRIDGE_DIRECT</span>
                    <span>PATH: {toolConfig?.app_path || 'UNDEFINED'}</span>
                    <span>BRIDGE: {isReady ? 'CONNECTED' : 'WAITING'}</span>
                 </div>
                 <div className="text-[8px] font-mono text-amber-500/40 uppercase tracking-widest">
                    ZIKY_OS_V2
                 </div>
            </div>
        </div>
    );
};

export default StandaloneLoader;
