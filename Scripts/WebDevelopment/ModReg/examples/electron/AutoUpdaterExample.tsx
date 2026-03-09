import React, { useState, useEffect } from 'react';
import { autoUpdater } from '../../modules/electron/auto-updater';
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

const AutoUpdaterExample: React.FC = () => {
    const [status, setStatus] = useState('Idle (Version 1.0.0)');
    const [progress, setProgress] = useState(0);
    const [isUpdateReady, setIsUpdateReady] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        const onChecking = () => {
            setStatus('Checking for updates...');
            setIsChecking(true);
            setProgress(0);
            setIsUpdateReady(false);
        };
        const onAvailable = (info: any) => {
            setStatus(`Update Available: ${info?.version || 'New Version'}. Starting download...`);
        };
        const onNotAvailable = () => {
            setStatus('No updates available.');
            setIsChecking(false);
        };
        const onProgress = (info: { percent: number }) => {
            setProgress(info.percent);
            setStatus(`Downloading: ${Math.round(info.percent)}%`);
        };
        const onDownloaded = () => {
            setStatus('Update Downloaded. Ready to install.');
            setIsUpdateReady(true);
            setIsChecking(false);
        };
        const onError = (err: any) => {
            setStatus(`Error: ${err?.message || 'Unknown error'}`);
            setIsChecking(false);
        };

        autoUpdater.on('checking-for-update', onChecking);
        autoUpdater.on('update-available', onAvailable);
        autoUpdater.on('update-not-available', onNotAvailable);
        autoUpdater.on('download-progress', onProgress);
        autoUpdater.on('update-downloaded', onDownloaded);
        autoUpdater.on('error', onError);

        return () => {
            autoUpdater.off('checking-for-update', onChecking);
            autoUpdater.off('update-available', onAvailable);
            autoUpdater.off('update-not-available', onNotAvailable);
            autoUpdater.off('download-progress', onProgress);
            autoUpdater.off('update-downloaded', onDownloaded);
            autoUpdater.off('error', onError);
        };
    }, []);

    return (
        <div className="space-y-8">
             <div className={`p-4 rounded-lg border ${ipc.isElectron() ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'}`}>
                <p className="font-bold text-center">
                    {ipc.isElectron() ? "Electron Environment" : "Browser Mock Mode"}
                </p>
                {!ipc.isElectron() && <p className="text-center text-xs mt-1">Updates are simulated. "Check for Updates" simulates random availability.</p>}
            </div>

            <FuturisticCard title="Software Update" description="Manage application updates.">
                <div className="text-center space-y-4">
                    <p className="text-lg font-mono text-text-primary">{status}</p>
                    
                    {progress > 0 && progress < 100 && (
                        <div className="w-full bg-base-300 rounded-full h-4 overflow-hidden">
                            <div className="bg-neon-teal h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}

                    {!isUpdateReady ? (
                        <FuturisticButton onClick={() => autoUpdater.checkForUpdates()} disabled={isChecking}>
                            Check for Updates
                        </FuturisticButton>
                    ) : (
                        <FuturisticButton onClick={() => autoUpdater.quitAndInstall()} className="animate-pulse">
                            Quit and Install
                        </FuturisticButton>
                    )}
                </div>
            </FuturisticCard>
        </div>
    );
};

export default AutoUpdaterExample;
