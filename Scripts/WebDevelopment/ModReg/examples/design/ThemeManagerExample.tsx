import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { applyTheme, importTheme, exportTheme } from '../../modules/design/theme-utils';
import type { Theme, ThemeColors } from '../../types';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const ThemeManagerExample: React.FC = () => {
    const { theme, setTheme, mode } = useTheme();
    const [customTheme, setCustomTheme] = useState<Theme>(theme);
    const importFileRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        setCustomTheme(theme);
        applyTheme(theme, mode);
    }, [theme, mode]);


    const handleColorChange = (key: keyof ThemeColors, value: string) => {
        setCustomTheme(prevTheme => {
            const newTheme = JSON.parse(JSON.stringify(prevTheme));
            
            const oldColorValue = newTheme.colors[key];
            let newColorValue;

            if (typeof oldColorValue === 'object' && oldColorValue !== null) {
                newColorValue = { ...oldColorValue, [mode]: value };
            } else {
                newColorValue = {
                    light: mode === 'light' ? value : oldColorValue || value,
                    dark: mode === 'dark' ? value : oldColorValue || value,
                };
            }
            
            newTheme.colors[key] = newColorValue;
            newTheme.name = `${theme.name.replace(' (custom)', '')} (custom)`;
            
            applyTheme(newTheme, mode); // Apply live preview

            return newTheme;
        });
    };
    
    const handleRevert = () => {
        setCustomTheme(theme);
        applyTheme(theme, mode);
    };
    
    const handleSetAsCurrent = () => {
        setTheme(customTheme);
    };

    const handleImportClick = () => importFileRef.current?.click();

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setError('');
            const imported = await importTheme(file);
            setCustomTheme(imported);
            applyTheme(imported, mode);
        } catch (err: any) {
            setError(err.message || 'Failed to import theme.');
        } finally {
            if (e.target) e.target.value = '';
        }
    };
    
    return (
        <div className="space-y-8">
            <FuturisticCard title="Live Theme Customizer" description={`You are currently editing in ${mode.toUpperCase()} mode. Changes here are temporary until you set them as the current theme.`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(customTheme.colors).map(([key, colorValue]) => {
                        const currentColor = typeof colorValue === 'string' ? colorValue : (colorValue?.[mode] ?? '');
                        return (
                            <div key={key}>
                                <label className="block text-sm font-mono text-text-secondary mb-1">{key}</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="color"
                                        value={currentColor || '#000000'}
                                        onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                                        className="w-10 h-10 p-1 bg-transparent border border-base-300 rounded"
                                    />
                                    <input
                                        type="text"
                                        value={currentColor || ''}
                                        onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                                        className="w-full bg-base-100/50 p-2 rounded border border-base-300 font-mono focus:outline-none focus:ring-2 focus:ring-neon-teal"
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-neon-teal/20">
                    <button onClick={handleSetAsCurrent} className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green font-bold py-2 px-4 rounded transition">Set as Current Theme</button>
                    <button onClick={handleRevert} className="bg-base-300 hover:bg-base-300/70 text-text-primary font-bold py-2 px-4 rounded transition">Revert to Saved Theme</button>
                </div>
            </FuturisticCard>
            <FuturisticCard title="Import / Export" description="Save your custom theme to a file, or load one you've created previously.">
                 <div className="flex flex-wrap gap-2">
                    <button onClick={() => exportTheme(customTheme)} className="bg-base-300 hover:bg-base-300/70 text-text-primary font-bold py-2 px-4 rounded transition">Export Custom Theme</button>
                    <button onClick={handleImportClick} className="bg-base-300 hover:bg-base-300/70 text-text-primary font-bold py-2 px-4 rounded transition">Import from JSON</button>
                    <input type="file" ref={importFileRef} onChange={handleFileSelected} accept=".json" className="hidden"/>
                 </div>
                 {error && <p className="text-neon-red mt-2 text-sm">{error}</p>}
            </FuturisticCard>
             <FuturisticCard title="Current Theme JSON" description="The raw JSON object for the currently applied custom theme.">
                <pre className="text-sm bg-base-100/50 p-3 rounded max-h-96 overflow-auto font-mono text-text-primary">
                    {JSON.stringify(customTheme, null, 2)}
                </pre>
             </FuturisticCard>
        </div>
    );
};

export default ThemeManagerExample;