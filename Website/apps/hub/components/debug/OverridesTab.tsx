import React, { useState } from 'react';
import { ManifestUISettings } from '../../services/contentService';

interface OverridesTabProps {
    settings: ManifestUISettings | undefined;
    onSettingsChange: (newSettings: ManifestUISettings) => void;
    onPopOut?: () => void;
}

type OverridesSubTab = 'Layout' | 'Effects' | 'Background';

const SubTabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-200 ${
            active ? 'bg-amber-500/20 text-amber-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
    >
        {children}
    </button>
);

const DebugSlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
}> = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = 'px' }) => (
    <div>
        <label className="block text-sm font-medium text-amber-200">
            {label}: <span className="font-mono text-white">{value}{unit}</span>
        </label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer mt-1"
        />
    </div>
);

const DebugToggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; }> = ({ label, checked, onChange }) => (
     <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-amber-200">{label}</label>
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                checked ? 'bg-amber-500' : 'bg-gray-700'
            }`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                checked ? 'translate-x-6' : 'translate-x-1'
            }`} />
        </button>
    </div>
);

const PopOutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
);


const OverridesTab: React.FC<OverridesTabProps> = ({ settings, onSettingsChange, onPopOut }) => {
    const [activeSubTab, setActiveSubTab] = useState<OverridesSubTab>('Layout');
    
    if (!settings) {
        return <p>Settings not loaded.</p>;
    }

    const handleLayoutChange = (field: keyof ManifestUISettings['layout'], value: number) => {
        onSettingsChange({
            ...settings,
            layout: { ...settings.layout, [field]: value }
        });
    };

    const handleEffectsChange = (field: keyof ManifestUISettings['effects'], value: number | boolean) => {
        onSettingsChange({
            ...settings,
            effects: { ...settings.effects, [field]: value }
        });
    };
    
    const handleBackgroundsChange = (field: keyof ManifestUISettings['backgrounds'], value: number | boolean) => {
        onSettingsChange({
            ...settings,
            backgrounds: { ...settings.backgrounds, [field]: value }
        });
    };

    const renderContent = () => {
        switch (activeSubTab) {
            case 'Layout':
                return (
                    <div className="space-y-4">
                        <DebugSlider label="Base Padding Unit" value={settings.layout.padding_base_unit_px} onChange={v => handleLayoutChange('padding_base_unit_px', v)} max={20}/>
                        <DebugSlider label="Main Content Padding Multiplier" value={settings.layout.main_content_padding_multiplier} onChange={v => handleLayoutChange('main_content_padding_multiplier', v)} max={10} unit="x"/>
                        <DebugSlider label="Panel Padding Multiplier" value={settings.layout.panel_padding_multiplier} onChange={v => handleLayoutChange('panel_padding_multiplier', v)} max={12} unit="x"/>
                        <DebugSlider label="Panel Border Radius" value={settings.layout.panel_border_radius_px} onChange={v => handleLayoutChange('panel_border_radius_px', v)} max={40}/>
                        <DebugSlider label="Panel Ring Opacity" value={settings.layout.panel_ring_opacity_percent} onChange={v => handleLayoutChange('panel_ring_opacity_percent', v)} max={100} unit="%"/>
                    </div>
                );
            case 'Effects':
                 return (
                    <div className="space-y-4">
                        <DebugSlider label="Background Blur" value={settings.effects.background_blur_px} onChange={v => handleEffectsChange('background_blur_px', v)} max={40}/>
                        <DebugSlider label="Header Blur" value={settings.effects.header_blur_px} onChange={v => handleEffectsChange('header_blur_px', v)} max={40}/>
                        <DebugSlider label="Footer Blur" value={settings.effects.footer_blur_px} onChange={v => handleEffectsChange('footer_blur_px', v)} max={40}/>
                        <DebugSlider label="HUD Blur" value={settings.effects.hud_blur_px} onChange={v => handleEffectsChange('hud_blur_px', v)} max={40}/>
                        <hr className="border-white/10 my-4" />
                        <DebugToggle label="Enable Glow Effect" checked={settings.effects.enable_glow_effect} onChange={v => handleEffectsChange('enable_glow_effect', v)} />
                        <DebugSlider label="Glow Opacity" value={settings.effects.glow_primary_opacity_percent} onChange={v => handleEffectsChange('glow_primary_opacity_percent', v)} max={100} unit="%"/>
                    </div>
                );
            case 'Background':
                return (
                    <div className="space-y-4">
                        <DebugToggle label="Allow Auto Change" checked={settings.backgrounds.allow_auto_change} onChange={v => handleBackgroundsChange('allow_auto_change', v)} />
                        <DebugToggle label="Per-Page Backgrounds" checked={settings.backgrounds.per_page_switching} onChange={v => handleBackgroundsChange('per_page_switching', v)} />
                        <hr className="border-white/10 my-4" />
                        <DebugSlider label="Min Interval" value={settings.backgrounds.change_interval_min_seconds} onChange={v => handleBackgroundsChange('change_interval_min_seconds', v)} max={120} unit="s"/>
                        <DebugSlider label="Max Interval" value={settings.backgrounds.change_interval_max_seconds} onChange={v => handleBackgroundsChange('change_interval_max_seconds', v)} min={settings.backgrounds.change_interval_min_seconds} max={240} unit="s"/>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-start">
                 <nav className="flex gap-2">
                    <SubTabButton active={activeSubTab === 'Layout'} onClick={() => setActiveSubTab('Layout')}>Layout</SubTabButton>
                    <SubTabButton active={activeSubTab === 'Effects'} onClick={() => setActiveSubTab('Effects')}>Effects</SubTabButton>
                    <SubTabButton active={activeSubTab === 'Background'} onClick={() => setActiveSubTab('Background')}>Background</SubTabButton>
                </nav>
                {onPopOut && (
                     <button
                        onClick={onPopOut}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-gray-800/60 rounded-md hover:bg-gray-700/80 transition-colors flex items-center gap-1.5"
                        aria-label="Pop out overrides tab"
                    >
                        <PopOutIcon />
                        Pop Out
                    </button>
                )}
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg ring-1 ring-white/10">
                {renderContent()}
            </div>
        </div>
    );
};

export default OverridesTab;
