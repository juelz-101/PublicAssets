import React, { useState, useEffect } from 'react';
import { DataManager } from '../../modules/ziky_inc/data/db';

// --- Components ---
const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
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

const OutputBox: React.FC<{ title: string, children: React.ReactNode, lang?: string }> = ({ title, children, lang = 'json' }) => (
    <div className="mt-2 p-4 bg-base-100/50 rounded-md border border-base-300/50 max-h-96 overflow-auto">
        <p className="text-text-secondary">{title}</p>
        <pre className={`language-${lang} text-text-primary font-mono whitespace-pre-wrap text-sm`}>{children}</pre>
    </div>
);

// --- Main Example ---
const IDBHandlerExample: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [data, setData] = useState<any>(null);
    const [databases, setDatabases] = useState<IDBDatabaseInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const runInitialization = async () => {
        setIsLoading(true);
        setLogs([]);
        setSettings(null);
        setData(null);

        const manager = new DataManager();
        manager.onLog = (message: string) => {
            setLogs(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev]);
        };

        try {
            await manager.init('./ref/appdata_ref.json');
            setSettings(manager.getSettings());
            setData(manager.getData());
            
            // Check which databases were actually created
            if (indexedDB.databases) {
                const dbs = await indexedDB.databases();
                setDatabases(dbs);
            }

        } catch (error) {
            // Error is already logged by the manager
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <FuturisticCard 
                title="Data Manager Initialization"
                description="This module initializes application data based on the structure defined in `ref/appdata_ref.json`. It handles loading defaults, merging files, and setting up IndexedDB databases."
            >
                <FuturisticButton onClick={runInitialization} disabled={isLoading}>
                    {isLoading ? 'Initializing...' : 'Run Initialization'}
                </FuturisticButton>
            </FuturisticCard>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FuturisticCard title="Initialization Log">
                    <div className="bg-base-100/50 rounded p-3 h-96 overflow-y-auto flex flex-col-reverse">
                        <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono">
                            {logs.length > 0 ? logs.join('\n') : 'Click "Run Initialization" to begin.'}
                        </pre>
                    </div>
                </FuturisticCard>
                <FuturisticCard title="Verified Databases">
                    <div className="bg-base-100/50 rounded p-3 h-96 overflow-y-auto">
                        {databases.length > 0 ? (
                            <ul>
                                {databases.map(db => (
                                    <li key={db.name} className="p-2 border-b border-base-300">
                                        <p className="font-mono text-neon-teal">{db.name}</p>
                                        <p className="text-sm text-text-secondary">Version: {db.version}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-text-secondary italic">No databases detected. Run initialization.</p>
                        )}
                    </div>
                </FuturisticCard>
            </div>
            
            { (data || settings) &&
                <FuturisticCard title="Loaded Data">
                    {settings && <OutputBox title="Final Settings Object">{JSON.stringify(settings, null, 2)}</OutputBox>}
                    {data && <OutputBox title="Final Data Object">{JSON.stringify(data, null, 2)}</OutputBox>}
                </FuturisticCard>
            }
        </div>
    );
};

export default IDBHandlerExample;