import React, { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { Theme, ThemePresetCategory } from '../types';
import { themePresets } from '../modules/design/theme-presets';
import { importTheme, exportTheme } from '../modules/design/theme-utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemePreview: React.FC<{ theme: Theme, onSelect: () => void, isActive: boolean }> = ({ theme, onSelect, isActive }) => (
    <div 
        onClick={onSelect}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
        role="button"
        tabIndex={0}
        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${isActive ? 'border-neon-teal shadow-glow-md' : 'border-base-300 hover:border-neon-teal/50'}`}
    >
        <p className="font-semibold text-text-primary mb-2">{theme.name}</p>
        <div className="flex h-8 rounded overflow-hidden">
            {Object.values(theme.colors).slice(0, 7).map((color, index) => {
                // Fix: Safely access the 'dark' property on theme color values. The type of 'color' is inferred as 'unknown',
                // so we use type guards and optional chaining to prevent runtime errors.
                const displayColor = typeof color === 'string' ? color : ((color as any)?.dark ?? 'transparent');
                return <div key={index} style={{ backgroundColor: displayColor }} className="flex-1" />
            })}
        </div>
    </div>
);


const ThemeSelector: React.FC = () => {
    const { theme, setTheme, mode, setMode } = useTheme();
    const importFileRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImportClick = () => {
        importFileRef.current?.click();
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setError(null);
            const importedTheme = await importTheme(file);
            setTheme(importedTheme);
        } catch (err: any) {
            setError(err.message || 'Failed to import theme.');
        } finally {
            if (e.target) e.target.value = '';
        }
    };
    
    const handleExportClick = () => {
        exportTheme(theme);
    };

    return (
         <section>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Appearance</h3>
             <div className="flex items-center justify-between p-3 bg-base-300/50 rounded-lg mb-6">
                <span className="font-semibold text-text-primary">Color Mode</span>
                <div className="flex items-center gap-2 p-1 bg-base-200 rounded-full">
                    <button onClick={() => setMode('light')} className={`px-3 py-1 text-sm font-semibold rounded-full transition ${mode === 'light' ? 'bg-neon-teal/30 text-neon-teal' : 'text-text-secondary hover:bg-base-300'}`}>Light</button>
                    <button onClick={() => setMode('dark')} className={`px-3 py-1 text-sm font-semibold rounded-full transition ${mode === 'dark' ? 'bg-neon-teal/30 text-neon-teal' : 'text-text-secondary hover:bg-base-300'}`}>Dark</button>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-text-primary mb-4">Theme Selection</h3>
            <div className="space-y-6">
                {themePresets.map((category: ThemePresetCategory) => (
                    <div key={category.category}>
                        <h4 className="text-md font-semibold text-text-secondary mb-3">{category.category}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {category.themes.map((preset) => (
                                <ThemePreview 
                                    key={preset.name} 
                                    theme={preset} 
                                    onSelect={() => setTheme(preset)}
                                    isActive={theme.name === preset.name}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 pt-4 border-t border-neon-teal/20">
                 <h4 className="text-md font-semibold text-text-secondary mb-3">Custom Themes</h4>
                 <div className="flex flex-wrap gap-2">
                    <button onClick={handleImportClick} className="bg-base-300 hover:bg-base-300/70 text-text-primary font-bold py-2 px-4 rounded transition">Import from JSON</button>
                    <input type="file" ref={importFileRef} onChange={handleFileSelected} accept=".json" className="hidden"/>
                    <button onClick={handleExportClick} className="bg-base-300 hover:bg-base-300/70 text-text-primary font-bold py-2 px-4 rounded transition">Export Current Theme</button>
                 </div>
                 {error && <p className="text-neon-red mt-2 text-sm">{error}</p>}
            </div>
        </section>
    );
};


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('theme');

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="bg-base-200 w-full max-w-2xl h-auto max-h-[80vh] rounded-xl border border-neon-teal/20 shadow-glow-lg flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-neon-teal/20 flex-shrink-0">
          <h2 id="settings-title" className="text-xl font-bold text-text-primary">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-text-secondary hover:bg-base-300/50 hover:text-neon-teal focus:outline-none focus:ring-2 focus:ring-neon-teal/50"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="flex flex-grow overflow-hidden">
          <aside className="w-48 p-4 border-r border-neon-teal/20">
            <nav>
              <ul>
                <li>
                  <button
                    onClick={() => setActiveTab('theme')}
                    className={`w-full text-left px-3 py-2 rounded-md font-semibold transition-colors ${activeTab === 'theme' ? 'bg-neon-teal/20 text-neon-teal' : 'text-text-secondary hover:bg-base-300/50 hover:text-text-primary'}`}
                  >
                    Theme
                  </button>
                </li>
              </ul>
            </nav>
          </aside>
          <main className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'theme' && <ThemeSelector />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;