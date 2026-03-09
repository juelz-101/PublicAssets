
import React, { useState } from 'react';
import { localStore, sessionStore } from '../../modules/web-apis/storage-utils';

interface StorageAPI {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttlSeconds?: number): void;
  remove(key: string): void;
  clear(): void;
}

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'blue' | 'green' | 'yellow' | 'red' }> = ({ children, className, variant = 'blue', ...props }) => {
    const colors = {
        blue: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-400',
        green: 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-400',
        yellow: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-400',
        red: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-400',
    };
    return (
        <button {...props} className={`font-bold py-2 px-4 rounded transition duration-300 border flex-grow ${colors[variant]} ${className}`}>
            {children}
        </button>
    );
};

const StorageTester: React.FC<{ title: string; store: StorageAPI, description: string }> = ({ title, store, description }) => {
    const [key, setKey] = useState('userProfile');
    const [value, setValue] = useState('{ "name": "Alex", "theme": "dark" }');
    const [ttl, setTtl] = useState('');
    const [retrievedValue, setRetrievedValue] = useState('');

    const handleSet = () => {
        try {
            const parsedValue = JSON.parse(value);
            const ttlSeconds = ttl ? parseInt(ttl, 10) : undefined;
            if (ttl && isNaN(ttlSeconds)) {
                setRetrievedValue('Error: TTL must be a number.');
                return;
            }
            store.set(key, parsedValue, ttlSeconds);
            setRetrievedValue(`Value set successfully!${ttlSeconds ? ` It will expire in ${ttlSeconds} seconds.` : ''}`);
        } catch (e) {
            setRetrievedValue('Error: Invalid JSON in value field.');
        }
    };

    const handleGet = () => {
        const result = store.get(key);
        if (result === null) {
            setRetrievedValue(`No value found for key "${key}". (It may have been removed or expired).`);
        } else {
            setRetrievedValue(JSON.stringify(result, null, 2));
        }
    };
    
    const handleRemove = () => {
        store.remove(key);
        setRetrievedValue(`Removed value for key "${key}".`);
    };
    
    const handleClear = () => {
        store.clear();
        setRetrievedValue('All items cleared from this storage.');
    };

    return (
        <div>
            <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
            <p className="text-text-secondary mb-4">{description}</p>
            <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-text-secondary mb-1">Key:</label>
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                        />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-text-secondary mb-1">Value (as JSON):</label>
                         <input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                        />
                    </div>
                </div>
                 <div>
                    <label className="block text-text-secondary mb-1">Expiration (Time-To-Live in seconds, optional):</label>
                     <input
                        type="number"
                        value={ttl}
                        onChange={(e) => setTtl(e.target.value)}
                        placeholder="e.g., 60 for 1 minute"
                        className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    />
                </div>
                 <div className="flex flex-wrap gap-2">
                    <FuturisticButton onClick={handleSet} variant="blue">Set</FuturisticButton>
                    <FuturisticButton onClick={handleGet} variant="green">Get</FuturisticButton>
                    <FuturisticButton onClick={handleRemove} variant="yellow">Remove</FuturisticButton>
                    <FuturisticButton onClick={handleClear} variant="red">Clear All</FuturisticButton>
                </div>
                <div className="mt-4 p-4 bg-base-100/50 rounded min-h-[100px]">
                    <p className="text-text-secondary">Result:</p>
                    <pre className="text-text-primary font-mono whitespace-pre-wrap">{retrievedValue}</pre>
                </div>
            </div>
        </div>
    );
}

const StorageUtilsExample: React.FC = () => {
  return (
    <div className="space-y-8">
      <StorageTester 
        title="localStore"
        store={localStore}
        description="Data persists even after closing the browser tab or window. Useful for storing user settings or long-term information."
      />
      <StorageTester
        title="sessionStore"
        store={sessionStore}
        description="Data is cleared when the page session ends (i.e., when the browser tab is closed). Useful for temporary data related to a single visit."
       />
    </div>
  );
};

export default StorageUtilsExample;
