import React, { useState, useEffect } from 'react';
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

const IpcWrapperExample: React.FC = () => {
    const [invokeResponse, setInvokeResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [isElectron] = useState(ipc.isElectron());

    const log = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));

    // Simulate listening to an event (only functional if Electron sends it, or mocked)
    useEffect(() => {
        const handlePing = (_event: any, data: string) => {
            log(`Received 'ping' event: ${data}`);
        };
        ipc.on('ping', handlePing);
        
        return () => {
            ipc.off('ping', handlePing);
        };
    }, []);

    const handleSend = () => {
        ipc.send('app:log', { message: 'Hello from Renderer' });
        log("Sent 'app:log' message (One-way)");
    };

    const handleInvoke = async () => {
        setIsLoading(true);
        log("Invoking 'db:get-users' (Bidirectional)...");
        try {
            const result = await ipc.invoke('db:get-users', { limit: 5 });
            setInvokeResponse(JSON.stringify(result, null, 2));
            log("Received response from 'db:get-users'");
        } catch (error: any) {
            setInvokeResponse(`Error: ${error.message}`);
            log("Error calling 'db:get-users'");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className={`p-4 rounded-lg border ${isElectron ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'bg-base-300/50 border-base-300 text-text-secondary'}`}>
                <p className="font-bold text-center">
                    Environment: {isElectron ? "Electron Detected" : "Browser (Mock Mode)"}
                </p>
                {!isElectron && <p className="text-center text-xs mt-1">IPC calls are logged to console and return dummy data.</p>}
            </div>

            <FuturisticCard title="IPC Operations" description="Test inter-process communication patterns.">
                <div className="flex gap-4">
                    <FuturisticButton onClick={handleSend} className="flex-1">
                        Send (One-way)
                    </FuturisticButton>
                    <FuturisticButton onClick={handleInvoke} disabled={isLoading} className="flex-1">
                        {isLoading ? 'Invoking...' : 'Invoke (Promise)'}
                    </FuturisticButton>
                </div>
            </FuturisticCard>

            {invokeResponse && (
                <FuturisticCard title="Main Process Response" description="Result from the 'db:get-users' invoke call.">
                    <pre className="bg-base-100/50 p-4 rounded text-text-primary font-mono text-sm whitespace-pre-wrap">
                        {invokeResponse}
                    </pre>
                </FuturisticCard>
            )}

            <FuturisticCard title="Renderer Logs" description="Local log of actions taken in this component.">
                <div className="bg-base-100/50 rounded p-3 h-40 overflow-y-auto">
                    {logs.map((entry, i) => (
                        <div key={i} className="font-mono text-sm text-text-secondary mb-1">{entry}</div>
                    ))}
                    {logs.length === 0 && <span className="text-text-secondary italic">No activity yet.</span>}
                </div>
            </FuturisticCard>
        </div>
    );
};

export default IpcWrapperExample;
