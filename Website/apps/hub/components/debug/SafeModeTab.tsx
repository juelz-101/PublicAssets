// components/debug/SafeModeTab.tsx
import React from 'react';
import { Manifest, SafeModeSettings } from '../../types';

interface SafeModeTabProps {
    manifest: Manifest | null;
    onManifestChange: (newManifest: Manifest) => void;
}

const DebugToggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; description?: string }> = ({ label, checked, onChange, description }) => (
    <div className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
        <div className="flex-grow mr-4">
            <label className="block text-sm font-medium text-amber-200">{label}</label>
            {description && <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>}
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0 ${
                checked ? 'bg-amber-500' : 'bg-gray-700'
            }`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                checked ? 'translate-x-6' : 'translate-x-1'
            }`} />
        </button>
    </div>
);

const SafeModeTab: React.FC<SafeModeTabProps> = ({ manifest, onManifestChange }) => {
    if (!manifest) return null;

    const safe = manifest.settings.safe_mode;

    const updateSafe = (updater: (prev: SafeModeSettings) => SafeModeSettings) => {
        onManifestChange({
            ...manifest,
            settings: {
                ...manifest.settings,
                safe_mode: updater(safe)
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                <DebugToggle 
                    label="MASTER SAFE MODE SWITCH" 
                    checked={safe.on} 
                    onChange={v => updateSafe(s => ({ ...s, on: v }))} 
                    description="Globally enable/disable all security and performance restrictions."
                />
            </div>

            <div className={`space-y-6 transition-opacity ${safe.on ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <section>
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 px-2">Image Overrides</h3>
                    <div className="space-y-2 bg-black/20 rounded-lg p-2">
                        <DebugToggle label="Block All Images" checked={safe.override.images.block_all_images} onChange={v => updateSafe(s => ({ ...s, override: { ...s.override, images: { ...s.override.images, block_all_images: v } } }))} />
                        <DebugToggle label="Request Limit Enabled" checked={safe.override.images.limit_image_requests.on} onChange={v => updateSafe(s => ({ ...s, override: { ...s.override, images: { ...s.override.images, limit_image_requests: { ...s.override.images.limit_image_requests, on: v } } } }))} />
                        <DebugToggle label="Block Transitions (Background)" checked={safe.override.images.block_background.on} onChange={v => updateSafe(s => ({ ...s, override: { ...s.override, images: { ...s.override.images, block_background: { ...s.override.images.block_background, on: v } } } }))} />
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 px-2">Data Overrides</h3>
                    <div className="space-y-2 bg-black/20 rounded-lg p-2">
                        <DebugToggle label="Block Online Data" checked={safe.override.data.block_all_online_data} onChange={v => updateSafe(s => ({ ...s, override: { ...s.override, data: { ...s.override.data, block_all_online_data: v } } }))} description="Prevents the app from fetching fresh JSON files from GitHub." />
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 px-2">Performance Overrides</h3>
                    <div className="space-y-2 bg-black/20 rounded-lg p-2">
                        <DebugToggle label="Reduced Motion" checked={safe.override.performance.reduced_motion} onChange={v => updateSafe(s => ({ ...s, override: { ...s.override, performance: { ...s.override.performance, reduced_motion: v } } }))} description="Kills all transitions and fade animations." />
                        <DebugToggle label="Low Bandwidth Mode" checked={safe.override.performance.low_bandwidth_mode} onChange={v => updateSafe(s => ({ ...s, override: { ...s.override, performance: { ...s.override.performance, low_bandwidth_mode: v } } }))} description="Forces low-res hex placeholders across the entire site." />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SafeModeTab;
