import React, { useState } from 'react';
import { powerSaveBlocker, PowerSaveBlockerType } from '../../modules/electron/power-save-blocker';
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

interface ActiveBlocker {
    id: number;
    type: PowerSaveBlockerType;
    timestamp: string;
}

const PowerSaveBlockerExample: React.FC = () => {
    const [blockers, setBlockers] = useState<ActiveBlocker[]>([]);

    const handleStart = async (type: PowerSaveBlockerType) => {
        try {
            const id = await powerSaveBlocker.start(type);
            setBlockers(prev => [...prev, { id, type, timestamp: new Date().toLocaleTimeString() }]);
        } catch (e) {
            alert("Failed to start blocker");
        }
    };

    const handleStop = async (id: number) => {
        await powerSaveBlocker.stop(id);
        setBlockers(prev => prev.filter(b => b.id !== id));
    };

    return (
        <div className="space-y-8">
             <div className={`p-4 rounded-lg border ${ipc.isElectron() ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'}`}>
                <p className="font-bold text-center">
                    {ipc.isElectron() ? "Electron Environment" : "Browser Mock Mode"}
                </p>
                {!ipc.isElectron() && <p className="text-center text-xs mt-1">Blockers are simulated in-memory.</p>}
            </div>

            <FuturisticCard title="Prevent Sleep" description="Keep the system awake for critical tasks like downloads or playback.">
                <div className="flex flex-col sm:flex-row gap-4">
                    <FuturisticButton onClick={() => handleStart('prevent-app-suspension')} className="flex-1">
                        Prevent App Suspension
                    </FuturisticButton>
                    <FuturisticButton onClick={() => handleStart('prevent-display-sleep')} className="flex-1">
                        Prevent Display Sleep
                    </FuturisticButton>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Active Blockers" description="Currently active power save blockers.">
                {blockers.length === 0 ? (
                    <p className="text-text-secondary text-center italic">No active blockers.</p>
                ) : (
                    <div className="space-y-2">
                        {blockers.map(blocker => (
                            <div key={blocker.id} className="flex items-center justify-between p-3 bg-base-100/50 rounded-lg border border-base-300">
                                <div>
                                    <p className="font-bold text-neon-pink">ID: {blocker.id}</p>
                                    <p className="text-sm text-text-secondary">{blocker.type}</p>
                                    <p className="text-xs text-text-secondary opacity-70">Started at {blocker.timestamp}</p>
                                </div>
                                <button 
                                    onClick={() => handleStop(blocker.id)}
                                    className="text-neon-red border border-neon-red hover:bg-neon-red/10 px-3 py-1 rounded text-sm transition"
                                >
                                    Stop
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </FuturisticCard>
        </div>
    );
};

export default PowerSaveBlockerExample;
