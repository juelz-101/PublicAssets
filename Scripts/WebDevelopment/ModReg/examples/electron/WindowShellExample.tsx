import React from 'react';
import { windowControls, shellUtils } from '../../modules/electron/window-shell-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const TitleBarButton: React.FC<{ onClick: () => void, color: string, label: string }> = ({ onClick, color, label }) => (
    <button 
        onClick={onClick}
        className={`w-4 h-4 rounded-full ${color} hover:opacity-80 transition-opacity flex items-center justify-center group`}
        title={label}
    >
        <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-black">{label[0]}</span>
    </button>
);

const WindowShellExample: React.FC = () => {
    return (
        <div className="space-y-8">
            <FuturisticCard title="Custom Title Bar" description="Test the window control functions. In a browser environment, these trigger mock IPC calls (check console).">
                <div className="w-full max-w-md mx-auto bg-base-300 rounded-lg overflow-hidden border border-base-100 shadow-2xl">
                    {/* Title Bar Area */}
                    <div className="h-10 bg-base-100 flex items-center justify-between px-4 select-none drag-region">
                        <div className="flex gap-2">
                            <TitleBarButton onClick={windowControls.close} color="bg-red-500" label="Close" />
                            <TitleBarButton onClick={windowControls.minimize} color="bg-yellow-500" label="Minimize" />
                            <TitleBarButton onClick={windowControls.maximize} color="bg-green-500" label="Maximize" />
                        </div>
                        <span className="text-sm text-text-secondary font-mono">My App</span>
                        <div className="w-16"></div> {/* Spacer for balance */}
                    </div>
                    {/* Window Content */}
                    <div className="p-8 text-center min-h-[150px] flex flex-col justify-center items-center">
                        <p className="text-text-primary mb-4">Content Area</p>
                        <p className="text-text-secondary text-xs">Drag region would be active on the header in Electron.</p>
                    </div>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Shell Operations" description="Interact with the operating system shell.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={() => shellUtils.openExternal('https://www.google.com')}
                        className="bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue font-bold py-3 px-4 rounded transition"
                    >
                        Open External URL
                    </button>
                    <button 
                        onClick={() => shellUtils.showItemInFolder('/Users/Example/Documents/report.pdf')}
                        className="bg-neon-pink/20 hover:bg-neon-pink/30 text-neon-pink border border-neon-pink font-bold py-3 px-4 rounded transition"
                    >
                        Show Item in Folder
                    </button>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default WindowShellExample;
