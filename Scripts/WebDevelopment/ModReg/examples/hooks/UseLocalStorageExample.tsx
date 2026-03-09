
import React from 'react';
import { useLocalStorage } from '../../modules/hooks/use-local-storage';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const OutputBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-2 p-4 bg-base-100/50 rounded">
        <p className="text-text-secondary">{title}</p>
        <pre className="text-text-primary font-mono whitespace-pre-wrap">{children || '""'}</pre>
    </div>
);

const UseLocalStorageExample: React.FC = () => {
    // Example 1: Storing a simple string
    const [name, setName] = useLocalStorage<string>('username', '');

    // Example 2: Storing a boolean
    const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage<boolean>('notificationsEnabled', true);
    
    // Example 3: Storing an object
    const [settings, setSettings] = useLocalStorage<{ theme: string; fontSize: number }>('appSettings', {
        theme: 'dark',
        fontSize: 16,
    });
    
    const handleSettingsChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: name === 'fontSize' ? Number(value) : value
        }));
    };

    return (
        <div className="space-y-8">
            <FuturisticCard
                title="String Value"
                description="This input's value is saved to localStorage. Type something and then refresh the page to see it persist."
            >
                <div>
                    <label htmlFor="name-input" className="block text-text-secondary mb-2">Username:</label>
                    <input
                        id="name-input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name..."
                        className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    />
                </div>
                <OutputBox title="Value in localStorage for key 'username':">
                    {JSON.stringify(name)}
                </OutputBox>
            </FuturisticCard>
            
            <FuturisticCard
                title="Boolean Value"
                description="Toggle the switch to save a boolean value. This preference will be remembered on your next visit."
            >
                <div className="flex items-center justify-between p-3 bg-base-100/50 rounded-lg">
                    <label htmlFor="notifications-toggle" className="font-semibold text-text-primary">Enable Notifications</label>
                    <button
                        id="notifications-toggle"
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-neon-green' : 'bg-base-300'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                 <OutputBox title="Value in localStorage for key 'notificationsEnabled':">
                    {JSON.stringify(notificationsEnabled)}
                </OutputBox>
            </FuturisticCard>
            
            <FuturisticCard
                title="Object Value"
                description="The hook can also store complex objects. Changes made here will be saved automatically."
            >
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="theme-select" className="block text-text-secondary mb-2">Theme:</label>
                        <select
                            id="theme-select"
                            name="theme"
                            value={settings.theme}
                            onChange={handleSettingsChange}
                            className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                            <option value="cyberpunk">Cyberpunk</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="fontSize-range" className="block text-text-secondary mb-2">Font Size: {settings.fontSize}px</label>
                         <input
                            id="fontSize-range"
                            type="range"
                            name="fontSize"
                            min="12"
                            max="24"
                            value={settings.fontSize}
                            onChange={handleSettingsChange}
                            className="w-full accent-neon-pink"
                         />
                    </div>
                 </div>
                 <OutputBox title="Value in localStorage for key 'appSettings':">
                    {JSON.stringify(settings, null, 2)}
                </OutputBox>
            </FuturisticCard>
        </div>
    );
};

export default UseLocalStorageExample;
