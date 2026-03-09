import React, { useState } from 'react';
import { menu, MenuItem } from '../../modules/electron/menu-manager';

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

const MenuManagerExample: React.FC = () => {
    const [status, setStatus] = useState('Idle');
    const [isFeatureEnabled, setIsFeatureEnabled] = useState(true);

    const handleSetAppMenu = () => {
        const template: MenuItem[] = [
            {
                label: 'Demo App',
                submenu: [
                    { label: 'Status Check', click: () => setStatus('App Menu: Status OK') },
                    { type: 'separator' },
                    { id: 'toggle-feature', label: 'Enable Feature', type: 'checkbox', checked: isFeatureEnabled, click: toggleFeatureFromMenu },
                    { label: 'Quit', click: () => setStatus('Quit clicked (mock)') }
                ]
            }
        ];
        menu.setApplicationMenu(template);
        setStatus('Application menu updated. Check the "Demo App" menu.');
    };

    // Callback for the menu item
    const toggleFeatureFromMenu = () => {
        // Toggle local state
        setIsFeatureEnabled(prev => {
            const newState = !prev;
            setStatus(`Feature is now ${newState ? 'ENABLED' : 'DISABLED'}`);
            // Also ensure the menu reflects this if it wasn't triggered by the menu itself
            // (Though in this case, the menu click triggered it, so standard behavior updates the UI)
            return newState;
        });
    };

    // Button to toggle the menu item state programmatically
    const toggleFeatureProgrammatically = () => {
        const newState = !isFeatureEnabled;
        setIsFeatureEnabled(newState);
        
        // Dynamically update the menu item
        menu.updateMenuItem('toggle-feature', { 
            checked: newState, 
            label: newState ? 'Enable Feature (On)' : 'Enable Feature (Off)' 
        });
        
        setStatus(`Programmatically set feature to ${newState ? 'ENABLED' : 'DISABLED'}`);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const template: MenuItem[] = [
            { label: 'Copy Info', click: () => setStatus('Copied Info!') },
            { id: 'ctx-save', label: 'Save Item', enabled: isFeatureEnabled, click: () => setStatus('Saved!') },
            { type: 'separator' },
            { 
                label: 'More Options',
                submenu: [
                    { label: 'Deep Scan', click: () => setStatus('Deep Scan started') }
                ]
            }
        ];
        
        menu.showContextMenu(template, { x: e.clientX, y: e.clientY });
        setStatus(`Context menu requested at (${e.clientX}, ${e.clientY})`);
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="System Menus" description="Control native application menus.">
                <div className="flex gap-4 mb-4">
                    <FuturisticButton onClick={handleSetAppMenu} className="flex-1">
                        Set Application Menu
                    </FuturisticButton>
                    <FuturisticButton onClick={toggleFeatureProgrammatically} className="flex-1">
                        Toggle Feature ({isFeatureEnabled ? 'On' : 'Off'})
                    </FuturisticButton>
                </div>
                
                <div 
                    onContextMenu={handleContextMenu}
                    className="h-48 bg-base-100/50 rounded-lg border-2 border-dashed border-neon-pink/50 flex items-center justify-center cursor-context-menu hover:bg-base-100/80 transition-colors"
                >
                    <p className="text-text-secondary text-center">
                        Right-click here.<br/>
                        <span className="text-xs">The 'Save Item' option is {isFeatureEnabled ? 'enabled' : 'disabled'} based on the toggle above.</span>
                    </p>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Status Log" description="Feedback from menu actions.">
                <pre className="bg-base-100/50 p-4 rounded text-text-primary font-mono text-sm whitespace-pre-wrap">
                    {status}
                </pre>
            </FuturisticCard>
        </div>
    );
};

export default MenuManagerExample;
