import React, { useState, useEffect } from 'react';
import { sysInfo, DisplayInfo, BatteryStatus, MemoryInfo } from '../../modules/electron/system-info';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const SystemInfoExample: React.FC = () => {
    const [platform, setPlatform] = useState('Loading...');
    const [displays, setDisplays] = useState<DisplayInfo[]>([]);
    const [battery, setBattery] = useState<BatteryStatus | null>(null);
    const [cursor, setCursor] = useState<{x: number, y: number}>({x: 0, y: 0});
    const [isDark, setIsDark] = useState<boolean | null>(null);
    const [memory, setMemory] = useState<MemoryInfo | null>(null);
    const [version, setVersion] = useState('');

    const refreshInfo = async () => {
        setPlatform(await sysInfo.getPlatform());
        setDisplays(await sysInfo.getDisplays());
        setBattery(await sysInfo.getBatteryStatus());
        setIsDark(await sysInfo.isDarkMode());
        setMemory(await sysInfo.getProcessMemoryInfo());
        setVersion(await sysInfo.getAppVersion());
    };

    useEffect(() => {
        refreshInfo();
        
        // Poll cursor position rapidly for demo purposes
        const interval = setInterval(async () => {
            setCursor(await sysInfo.getCursorPosition());
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">App Version: <span className="font-mono text-text-primary">{version}</span></span>
                <button onClick={refreshInfo} className="bg-neon-teal/20 text-neon-teal px-4 py-2 rounded border border-neon-teal hover:bg-neon-teal/30 transition">
                    Refresh Data
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FuturisticCard title="Platform & Theme" description="OS information.">
                    <div className="text-lg font-mono text-text-primary break-words mb-2">{platform}</div>
                    <div className={`p-2 rounded text-center font-bold border ${isDark ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-black border-gray-300'}`}>
                        {isDark === null ? 'Checking...' : isDark ? 'Dark Mode Active' : 'Light Mode Active'}
                    </div>
                </FuturisticCard>

                <FuturisticCard title="Battery" description="Power status of the device.">
                    {battery ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <div className="text-2xl font-bold">{(battery.level * 100).toFixed(0)}%</div>
                                <div className={`px-2 py-1 rounded text-xs font-bold ${battery.charging ? 'bg-neon-green text-black' : 'bg-base-300 text-text-secondary'}`}>
                                    {battery.charging ? 'CHARGING' : 'DISCHARGING'}
                                </div>
                            </div>
                            <div className="w-full bg-base-300 h-4 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${battery.level < 0.2 ? 'bg-neon-red' : 'bg-neon-green'}`} 
                                    style={{ width: `${battery.level * 100}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <p>Battery info unavailable.</p>
                    )}
                </FuturisticCard>

                <FuturisticCard title="Live Cursor" description="Global screen coordinates.">
                    <div className="text-center py-4">
                        <div className="text-4xl font-mono text-neon-pink">
                            {cursor.x}, {cursor.y}
                        </div>
                        <p className="text-xs text-text-secondary mt-2">
                            (Coordinates relative to {sysInfo.getPlatform.toString().includes('Web') ? 'window' : 'screen'})
                        </p>
                    </div>
                </FuturisticCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FuturisticCard title="Displays" description="Connected screens and their properties.">
                    <div className="grid grid-cols-1 gap-4">
                        {displays.map((disp, i) => (
                            <div key={i} className="p-4 bg-base-100/50 rounded border border-base-300 relative">
                                {disp.isPrimary && <span className="absolute top-2 right-2 text-[10px] bg-neon-teal text-black px-1 rounded font-bold">PRIMARY</span>}
                                <p className="font-mono text-neon-pink mb-1">Display #{disp.id}</p>
                                <p className="text-sm text-text-secondary">Resolution: <span className="text-text-primary">{disp.bounds.width} x {disp.bounds.height}</span></p>
                                <p className="text-sm text-text-secondary">Position: <span className="text-text-primary">({disp.bounds.x}, {disp.bounds.y})</span></p>
                                <p className="text-sm text-text-secondary">Scale Factor: <span className="text-text-primary">{disp.scaleFactor}x</span></p>
                            </div>
                        ))}
                    </div>
                </FuturisticCard>

                <FuturisticCard title="Process Memory" description="Memory usage stats (KB).">
                    {memory ? (
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-text-secondary">Used Heap</span>
                                    <span className="font-mono">{memory.private.toLocaleString()} KB</span>
                                </div>
                                <div className="w-full bg-base-300 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-neon-blue" style={{ width: `${Math.min(100, (memory.private / memory.total) * 100)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-text-secondary">Total Heap</span>
                                    <span className="font-mono">{memory.total.toLocaleString()} KB</span>
                                </div>
                                <div className="w-full bg-base-300 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-base-100" style={{ width: '100%' }} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>Memory info unavailable.</p>
                    )}
                </FuturisticCard>
            </div>
        </div>
    );
};

export default SystemInfoExample;
