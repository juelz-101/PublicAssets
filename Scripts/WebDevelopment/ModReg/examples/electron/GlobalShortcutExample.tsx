import React, { useState, useEffect } from 'react';
import { globalShortcut } from '../../modules/electron/global-shortcut';
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

const GlobalShortcutExample: React.FC = () => {
    const [triggerCount, setTriggerCount] = useState(0);
    const [lastTriggered, setLastTriggered] = useState<string>('None');
    const [isRegistered, setIsRegistered] = useState(false);
    
    // Define the accelerator
    const accelerator = 'CommandOrControl+Shift+K'; // Example shortcut

    const handleShortcut = () => {
        setTriggerCount(prev => prev + 1);
        setLastTriggered(new Date().toLocaleTimeString());
        
        // Visual feedback
        const flash = document.createElement('div');
        flash.className = 'fixed inset-0 bg-neon-teal/20 pointer-events-none z-50 transition-opacity duration-200';
        document.body.appendChild(flash);
        setTimeout(() => {
            flash.classList.add('opacity-0');
            setTimeout(() => flash.remove(), 200);
        }, 100);
    };

    const toggleRegistration = () => {
        if (isRegistered) {
            globalShortcut.unregister(accelerator);
            setIsRegistered(false);
        } else {
            const success = globalShortcut.register(accelerator, handleShortcut);
            if (success) setIsRegistered(true);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            globalShortcut.unregisterAll();
        };
    }, []);

    return (
        <div className="space-y-8">
             <div className={`p-4 rounded-lg border ${ipc.isElectron() ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'}`}>
                <p className="font-bold text-center">
                    {ipc.isElectron() ? "Electron Environment" : "Browser Mock Mode"}
                </p>
                {!ipc.isElectron() && <p className="text-center text-xs mt-1">Shortcuts work only when the browser window is focused in Mock Mode.</p>}
            </div>

            <FuturisticCard title="Shortcut Registration" description={`Register listener for: ${accelerator}`}>
                <div className="flex items-center justify-between bg-base-100/50 p-4 rounded-lg">
                    <span className="text-text-primary font-mono font-bold text-lg">{accelerator}</span>
                    <button 
                        onClick={toggleRegistration}
                        className={`px-4 py-2 rounded font-bold transition-colors ${isRegistered ? 'bg-neon-red/20 text-neon-red border border-neon-red' : 'bg-neon-teal/20 text-neon-teal border border-neon-teal'}`}
                    >
                        {isRegistered ? 'Unregister' : 'Register'}
                    </button>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Event Log" description="History of triggered shortcuts.">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-base-100/50 rounded">
                        <p className="text-text-secondary text-sm">Total Triggers</p>
                        <p className="text-4xl font-bold text-neon-teal">{triggerCount}</p>
                    </div>
                    <div className="p-4 bg-base-100/50 rounded">
                        <p className="text-text-secondary text-sm">Last Triggered At</p>
                        <p className="text-xl font-mono text-text-primary mt-2">{lastTriggered}</p>
                    </div>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default GlobalShortcutExample;
