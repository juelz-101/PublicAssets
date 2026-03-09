import React, { useState } from 'react';
import { crashReporter, CrashReport } from '../../modules/electron/crash-reporter';
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

const CrashReporterExample: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [reports, setReports] = useState<CrashReport[]>([]);
    const [metadataKey, setMetadataKey] = useState('');
    const [metadataValue, setMetadataValue] = useState('');

    const startReporter = () => {
        crashReporter.start({
            submitURL: 'https://example.com/crashes',
            companyName: 'ZIKYinc',
            productName: 'React Module Registry'
        });
        setIsRunning(true);
    };

    const triggerMockCrash = () => {
        if (ipc.isElectron()) {
            alert("Cannot simulate actual process crash in this demo safely.");
        } else {
            crashReporter.mockCrash();
            setReports(crashReporter.getUploadedReports());
        }
    };

    const addMetadata = () => {
        if (metadataKey && metadataValue) {
            crashReporter.addExtraParameter(metadataKey, metadataValue);
            alert(`Added metadata: ${metadataKey}=${metadataValue}`);
            setMetadataKey('');
            setMetadataValue('');
        }
    };

    return (
        <div className="space-y-8">
             <div className={`p-4 rounded-lg border ${ipc.isElectron() ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'}`}>
                <p className="font-bold text-center">
                    {ipc.isElectron() ? "Electron Environment" : "Browser Mock Mode"}
                </p>
                {!ipc.isElectron() && <p className="text-center text-xs mt-1">Crashes are simulated and stored in memory.</p>}
            </div>

            <FuturisticCard title="Crash Monitor" description="Configure and test the crash reporting system.">
                <div className="flex gap-4 items-center mb-4">
                    <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-neon-green animate-pulse' : 'bg-neon-red'}`}></div>
                    <span className="text-text-primary font-mono">{isRunning ? 'Reporter Running' : 'Reporter Stopped'}</span>
                </div>
                
                <div className="flex gap-4">
                    <FuturisticButton onClick={startReporter} disabled={isRunning} className="flex-1">
                        Start Reporter
                    </FuturisticButton>
                    <FuturisticButton onClick={triggerMockCrash} disabled={!isRunning} className="flex-1 border-neon-red text-neon-red hover:bg-neon-red/20">
                        Simulate Crash
                    </FuturisticButton>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Metadata" description="Add context to crash reports (e.g., user ID, state).">
                <div className="flex gap-2 mb-2">
                    <input 
                        type="text" 
                        placeholder="Key (e.g., userID)" 
                        value={metadataKey} 
                        onChange={(e) => setMetadataKey(e.target.value)} 
                        className="bg-base-100/50 border border-base-300 rounded p-2 text-text-primary flex-1 focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    />
                    <input 
                        type="text" 
                        placeholder="Value (e.g., 12345)" 
                        value={metadataValue} 
                        onChange={(e) => setMetadataValue(e.target.value)} 
                        className="bg-base-100/50 border border-base-300 rounded p-2 text-text-primary flex-1 focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    />
                </div>
                <FuturisticButton onClick={addMetadata} disabled={!isRunning || !metadataKey || !metadataValue} className="w-full">
                    Add Parameter
                </FuturisticButton>
            </FuturisticCard>

            {reports.length > 0 && (
                <FuturisticCard title="Crash History" description="List of recorded crash reports.">
                    <div className="space-y-2">
                        {reports.map((report, i) => (
                            <div key={i} className="p-3 bg-base-100/50 rounded border border-neon-red/30 flex justify-between items-center">
                                <span className="font-mono text-neon-red text-sm">ID: {report.id}</span>
                                <span className="text-xs text-text-secondary">{report.date.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </FuturisticCard>
            )}
        </div>
    );
};

export default CrashReporterExample;
