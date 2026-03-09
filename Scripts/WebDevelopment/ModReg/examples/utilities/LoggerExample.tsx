
import React, { useState, useEffect } from 'react';
import { Logger, LogLevel, LogMessage } from '../../modules/utilities/logger';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'teal' | 'yellow' | 'red' | 'blue' }> = ({ children, className, variant = 'teal', ...props }) => {
    const colors = {
        teal: 'bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border-neon-teal',
        yellow: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-400',
        red: 'bg-neon-red/20 hover:bg-neon-red/30 text-neon-red border-neon-red',
        blue: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-400',
    };
    return (
        <button {...props} className={`font-bold py-2 px-4 rounded transition duration-300 border ${colors[variant]} ${className}`}>
            {children}
        </button>
    );
};

const getLogLevelColor = (level: LogLevel): string => {
    switch(level) {
        case LogLevel.DEBUG: return 'text-purple-400';
        case LogLevel.INFO: return 'text-neon-teal';
        case LogLevel.WARN: return 'text-yellow-400';
        case LogLevel.ERROR: return 'text-neon-red';
        default: return 'text-text-secondary';
    }
}

const LoggerExample: React.FC = () => {
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [loggerInstance] = useState(() => Logger.getInstance());
    const [logMessage, setLogMessage] = useState('This is a test message.');
    const [minLevel, setMinLevel] = useState(LogLevel.INFO);

    useEffect(() => {
        // Create a callback transport to display logs in the UI
        const callbackTransport = (log: LogMessage) => {
            setLogs(prev => [log, ...prev].slice(0, 50));
        };
        
        // Setup the logger for this component
        loggerInstance.clearTransports();
        loggerInstance.addTransport(loggerInstance.consoleTransport()); // Keep logging to console
        loggerInstance.addTransport(callbackTransport); // Also log to our UI
        loggerInstance.setConfig({ level: minLevel });

        loggerInstance.info('LoggerExample component mounted and logger configured.');
        
        return () => {
             loggerInstance.info('LoggerExample component unmounted.');
             // Reset logger to default for other parts of the app
             loggerInstance.clearTransports();
             loggerInstance.addTransport(loggerInstance.consoleTransport());
             loggerInstance.setConfig({ level: LogLevel.INFO });
        }

    }, [loggerInstance, minLevel]);
    
    return (
        <div className="space-y-8">
            <FuturisticCard title="Log Viewer" description="Logs from the logger instance are displayed here via a custom callback transport.">
                <div className="flex justify-end">
                    <FuturisticButton onClick={() => setLogs([])} variant="red" className="py-1 px-3 text-sm">Clear UI Logs</FuturisticButton>
                </div>
                 <div className="bg-base-100/50 rounded p-3 h-64 overflow-y-auto flex flex-col-reverse">
                    <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono">
                        {logs.map((log, index) => (
                            <div key={index}>
                                <span className="text-gray-500">{log.timestamp.toLocaleTimeString()}</span>
                                <span className={`font-bold mx-2 ${getLogLevelColor(log.level)}`}>[{log.levelString}]</span>
                                <span>{log.message}</span>
                                {log.args.length > 0 && <span className="text-gray-400 block pl-4">{JSON.stringify(log.args)}</span>}
                            </div>
                        ))}
                    </pre>
                </div>
            </FuturisticCard>
            
            <FuturisticCard title="Logger Controls" description="Trigger log messages and configure the logger's behavior.">
                <div>
                    <label className="block text-text-secondary mb-1">Minimum Log Level:</label>
                    <select
                        value={minLevel}
                        onChange={(e) => setMinLevel(Number(e.target.value))}
                        className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    >
                        <option value={LogLevel.DEBUG}>DEBUG</option>
                        <option value={LogLevel.INFO}>INFO</option>
                        <option value={LogLevel.WARN}>WARN</option>
                        <option value={LogLevel.ERROR}>ERROR</option>
                        <option value={LogLevel.SILENT}>SILENT (Off)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-text-secondary mb-1">Log Message:</label>
                     <input
                        type="text"
                        value={logMessage}
                        onChange={(e) => setLogMessage(e.target.value)}
                        className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    <FuturisticButton onClick={() => loggerInstance.debug(logMessage, { data: 123 })} variant="blue">Log Debug</FuturisticButton>
                    <FuturisticButton onClick={() => loggerInstance.info(logMessage)} variant="teal">Log Info</FuturisticButton>
                    <FuturisticButton onClick={() => loggerInstance.warn(logMessage)} variant="yellow">Log Warn</FuturisticButton>
                    <FuturisticButton onClick={() => loggerInstance.error(logMessage, { errorCode: 500 })} variant="red">Log Error</FuturisticButton>
                </div>
                <p className="text-text-secondary text-sm italic">
                    Note: Logs below the minimum level will not be processed or appear in the console or the UI viewer above.
                </p>
            </FuturisticCard>
        </div>
    );
};

export default LoggerExample;
