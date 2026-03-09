import React, { useState, useEffect } from 'react';
import { powerMonitor, PowerEvent } from '../../modules/electron/power-monitor';
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

const PowerMonitorExample: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState('Unknown');

    const log = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 8));

    useEffect(() => {
        const handleSuspend = () => { log('System Suspended'); setStatus('Suspended'); };
        const handleResume = () => { log('System Resumed'); setStatus('Active'); };
        const handleOnAC = () => { log('Switched to AC Power'); setStatus('On AC'); };
        const handleOnBattery = () => { log('Switched to Battery Power'); setStatus('On Battery'); };
        const handleLock = () => { log('Screen Locked'); };
        const handleUnlock = () => { log('Screen Unlocked'); };

        powerMonitor.on('suspend', handleSuspend);
        powerMonitor.on('resume', handleResume);
        powerMonitor.on('on-ac', handleOnAC);
        powerMonitor.on('on-battery', handleOnBattery);
        powerMonitor.on('lock-screen', handleLock);
        powerMonitor.on('unlock-screen', handleUnlock);

        return () => {
            powerMonitor.off('suspend', handleSuspend);
            powerMonitor.off('resume', handleResume);
            powerMonitor.off('on-ac', handleOnAC);
            powerMonitor.off('on-battery', handleOnBattery);
            powerMonitor.off('lock-screen', handleLock);
            powerMonitor.off('unlock-screen', handleUnlock);
        };
    }, []);

    // Helper for buttons
    const simulate = (evt: PowerEvent) => {
        if (!ipc.isElectron()) {
            powerMonitor.mockTrigger(evt);
        } else {
            alert("In Electron, these events must be triggered by the OS.");
        }
    };

    return (
        <div className="space-y-8">
             <div className={`p-4 rounded-lg border ${ipc.isElectron() ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'}`}>
                <p className="font-bold text-center">
                    {ipc.isElectron() ? "Electron Environment" : "Browser Mock Mode"}
                </p>
                {!ipc.isElectron() && <p className="text-center text-xs mt-1">Use the buttons below to simulate OS events.</p>}
            </div>

            <FuturisticCard title="Power Status" description="Current system state based on events.">
                <div className="text-center p-6">
                    <p className="text-4xl font-bold text-neon-pink tracking-widest">{status}</p>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Event Simulation (Mock Only)" description="Trigger power events manually to test listeners.">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <button onClick={() => simulate('suspend')} disabled={ipc.isElectron()} className="p-2 bg-base-300 rounded hover:bg-base-100 border border-base-300 transition disabled:opacity-50">Suspend</button>
                    <button onClick={() => simulate('resume')} disabled={ipc.isElectron()} className="p-2 bg-base-300 rounded hover:bg-base-100 border border-base-300 transition disabled:opacity-50">Resume</button>
                    <button onClick={() => simulate('on-ac')} disabled={ipc.isElectron()} className="p-2 bg-base-300 rounded hover:bg-base-100 border border-base-300 transition disabled:opacity-50">AC Power</button>
                    <button onClick={() => simulate('on-battery')} disabled={ipc.isElectron()} className="p-2 bg-base-300 rounded hover:bg-base-100 border border-base-300 transition disabled:opacity-50">Battery Power</button>
                    <button onClick={() => simulate('lock-screen')} disabled={ipc.isElectron()} className="p-2 bg-base-300 rounded hover:bg-base-100 border border-base-300 transition disabled:opacity-50">Lock Screen</button>
                    <button onClick={() => simulate('unlock-screen')} disabled={ipc.isElectron()} className="p-2 bg-base-300 rounded hover:bg-base-100 border border-base-300 transition disabled:opacity-50">Unlock Screen</button>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Event Logs" description="Recent power events.">
                <div className="bg-base-100/50 rounded p-3 h-40 overflow-y-auto">
                    {logs.map((entry, i) => (
                        <div key={i} className="font-mono text-sm text-text-secondary mb-1 border-b border-base-300/20 pb-1">{entry}</div>
                    ))}
                    {logs.length === 0 && <span className="text-text-secondary italic">No events detected yet.</span>}
                </div>
            </FuturisticCard>
        </div>
    );
};

export default PowerMonitorExample;
