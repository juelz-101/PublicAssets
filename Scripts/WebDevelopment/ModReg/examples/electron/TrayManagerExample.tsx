import React, { useEffect, useState } from 'react';
import { tray } from '../../modules/electron/tray-manager';
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

const TrayManagerExample: React.FC = () => {
    const [bounds, setBounds] = useState<string>('');

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            tray.destroy();
        };
    }, []);

    const createTray = () => {
        // Use a dummy path that the mock handles gracefully
        tray.create('/path/to/icon.png', 'My App Tray');
        
        // Set a simple menu
        tray.setContextMenu([
            { label: 'Status: Online', enabled: false },
            { type: 'separator' },
            { label: 'Open App', click: () => alert('Open App Clicked') },
            { label: 'Quit', click: () => alert('Quit Clicked') }
        ]);
    };

    const updateTooltip = () => {
        const time = new Date().toLocaleTimeString();
        tray.setToolTip(`Updated at ${time}`);
    };

    const showBalloon = () => {
        tray.displayBalloon({
            title: 'Notification',
            content: 'This is a simulated system tray balloon.',
            iconType: 'info'
        });
    };

    const toggleIcon = () => {
        // In a real app, these would be valid paths. 
        // The mock will update the background-image style.
        const randomColor = Math.floor(Math.random()*16777215).toString(16);
        // Using a data URI for the mock to actually show something visual
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><rect width='32' height='32' fill='#${randomColor}'/></svg>`;
        const dataUri = `data:image/svg+xml;base64,${btoa(svg)}`;
        tray.setImage(dataUri);
    };

    const checkBounds = async () => {
        const b = await tray.getBounds();
        setBounds(JSON.stringify(b, null, 2));
    };

    return (
        <div className="space-y-8">
             <div className={`p-4 rounded-lg border ${ipc.isElectron() ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'}`}>
                <p className="font-bold text-center">
                    {ipc.isElectron() ? "Electron Environment" : "Browser Mock Mode"}
                </p>
                {!ipc.isElectron() && <p className="text-center text-xs mt-1">Tray icon will appear as a fixed element in the bottom-right corner.</p>}
            </div>

            <FuturisticCard title="Tray Controls" description="Manage the system tray icon.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FuturisticButton onClick={createTray}>Create Tray Icon</FuturisticButton>
                    <FuturisticButton onClick={toggleIcon}>Change Icon Image</FuturisticButton>
                    <FuturisticButton onClick={updateTooltip}>Update Tooltip</FuturisticButton>
                    <FuturisticButton onClick={showBalloon}>Show Notification (Balloon)</FuturisticButton>
                    <FuturisticButton onClick={checkBounds}>Get Bounds</FuturisticButton>
                    <FuturisticButton onClick={() => tray.setTitle(' 4 New Msgs ')} className="md:col-span-2">Set Title (MacOS only)</FuturisticButton>
                    <FuturisticButton onClick={() => tray.destroy()} className="border-neon-red text-neon-red hover:bg-neon-red/20 md:col-span-2">Destroy Tray</FuturisticButton>
                </div>
                {bounds && (
                    <div className="mt-4 p-2 bg-base-100/50 rounded border border-base-300">
                        <p className="text-xs text-text-secondary">Bounds:</p>
                        <pre className="font-mono text-sm">{bounds}</pre>
                    </div>
                )}
            </FuturisticCard>
        </div>
    );
};

export default TrayManagerExample;
