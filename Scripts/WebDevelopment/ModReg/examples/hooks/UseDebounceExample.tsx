import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../modules/hooks/use-debounce';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const OutputBox: React.FC<{ title: string, children: React.ReactNode, isPending?: boolean }> = ({ title, children, isPending = false }) => (
    <div className="mt-2 p-4 bg-base-100/50 rounded">
        <p className="text-text-secondary">{title}</p>
        <p className={`text-text-primary font-mono text-lg transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>{children || '""'}</p>
    </div>
);

const UseDebounceExample: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [delay, setDelay] = useState(500);
    const [apiLog, setApiLog] = useState<string[]>([]);
    
    // The useDebounce hook in action
    const debouncedSearchTerm = useDebounce(inputValue, delay);

    // Effect to simulate an API call when the debounced value changes
    useEffect(() => {
        if (debouncedSearchTerm) {
            setApiLog(prev => [`${new Date().toLocaleTimeString()}: Searching for "${debouncedSearchTerm}"...`, ...prev].slice(0, 5));
            // In a real app, you would make your API call here, e.g.,
            // fetch(`https://api.example.com/search?q=${debouncedSearchTerm}`)
        }
    }, [debouncedSearchTerm]);

    const isDebouncing = inputValue !== debouncedSearchTerm;

    return (
        <div className="space-y-8">
            <FuturisticCard
                title="useDebounce(value, delay)"
                description="This hook delays updating a value until the user has stopped typing for a specified period. It's ideal for performance-intensive tasks like live search."
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-text-secondary mb-2">Search Input:</label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type here to see the effect..."
                            className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                        />
                    </div>
                     <div>
                        <label className="block text-text-secondary mb-2">Debounce Delay (ms): {delay}</label>
                         <input
                            type="range"
                            min="100"
                            max="2000"
                            step="100"
                            value={delay}
                            onChange={(e) => setDelay(Number(e.target.value))}
                            className="w-full accent-neon-teal"
                         />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <OutputBox title="Current Value:">
                        {inputValue}
                    </OutputBox>
                     <OutputBox title="Debounced Value:" isPending={isDebouncing}>
                        {debouncedSearchTerm}
                    </OutputBox>
                </div>
            </FuturisticCard>

            <FuturisticCard
                title="Simulated API Call Log"
                description="This log updates only when the debounced value changes, preventing excessive API calls while the user is typing."
            >
                <div className="bg-base-100/50 rounded p-3 h-32 overflow-y-auto flex flex-col-reverse">
                    {apiLog.length === 0 ? (
                        <p className="text-text-secondary/70 italic">Type in the search box to trigger API calls...</p>
                    ) : (
                         <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono">
                            {apiLog.join('\n')}
                        </pre>
                    )}
                </div>
            </FuturisticCard>
        </div>
    );
};

export default UseDebounceExample;
