import React, { useState } from 'react';
import type { BannerConfig, HeaderLogoConfig, CommonImageConfig, PositionalImageConfig } from '../types';
import { DebugIcon } from './ui/icons';

interface DebugProps {
  logs: string[];
  bannerConfig: BannerConfig;
  setBannerConfig: React.Dispatch<React.SetStateAction<BannerConfig | undefined>>;
  headerLogoConfig: HeaderLogoConfig;
  setHeaderLogoConfig: React.Dispatch<React.SetStateAction<HeaderLogoConfig | undefined>>;
}

const ControlSlider: React.FC<{ label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }> =
  ({ label, value, onChange, min = 0, max = 200, step = 1 }) => (
    <div className="mb-2">
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}: {value}px</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
  
const ControlInput: React.FC<{ label: string; value: number | undefined; onChange: (v: number | undefined) => void; }> =
  ({ label, value, onChange }) => (
    <div className="mb-2">
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <input
        type="number"
        value={value ?? ''}
        placeholder="auto"
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' ? undefined : Number(val));
        }}
        className="w-full bg-gray-700 text-white rounded-md p-1 text-sm border border-gray-600 focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );

const Debug: React.FC<DebugProps> = ({ logs, bannerConfig, setBannerConfig, headerLogoConfig, setHeaderLogoConfig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);

  const handleBannerChange = (view: 'desktop' | 'mobile', key: keyof CommonImageConfig, value: number) => {
    setBannerConfig(prev => prev ? ({
      ...prev,
      [view]: { ...prev[view], [key]: value }
    }) : undefined);
  };
  
  const handleHeaderLogoChange = (view: 'desktop' | 'mobile', key: keyof PositionalImageConfig, value: number | undefined) => {
    setHeaderLogoConfig(prev => prev ? ({
        ...prev,
        [view]: { ...prev[view], [key]: value }
    }) : undefined);
  };

  return (
    <>
      {/* Debug Panel */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-transform transform hover:scale-110"
          aria-label="Open debug menu"
        >
          <DebugIcon />
        </button>
        <div className={`absolute top-0 right-12 w-64 bg-gray-800/90 backdrop-blur-sm text-white rounded-lg shadow-2xl p-4 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
          <h3 className="font-bold text-lg mb-3 border-b border-gray-600 pb-2">Debug Controls</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold text-sm text-indigo-300 mb-2">Banner</h4>
            <ControlSlider label="Desktop Height" value={bannerConfig.desktop.maxHeight} onChange={v => handleBannerChange('desktop', 'maxHeight', v)} />
            <ControlSlider label="Mobile Height" value={bannerConfig.mobile.maxHeight} onChange={v => handleBannerChange('mobile', 'maxHeight', v)} />
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-sm text-indigo-300 mb-2">Header Logo</h4>
            <p className="text-xs text-gray-400 mb-2 font-bold">Desktop</p>
            <ControlSlider label="Max Height" value={headerLogoConfig.desktop.maxHeight} onChange={v => handleHeaderLogoChange('desktop', 'maxHeight', v)} />
            <ControlInput label="Top" value={headerLogoConfig.desktop.top} onChange={v => handleHeaderLogoChange('desktop', 'top', v)} />
            <ControlInput label="Left" value={headerLogoConfig.desktop.left} onChange={v => handleHeaderLogoChange('desktop', 'left', v)} />
            <ControlInput label="Right" value={headerLogoConfig.desktop.right} onChange={v => handleHeaderLogoChange('desktop', 'right', v)} />
            
            <p className="text-xs text-gray-400 mt-3 mb-2 font-bold">Mobile</p>
            <ControlSlider label="Max Height" value={headerLogoConfig.mobile.maxHeight} onChange={v => handleHeaderLogoChange('mobile', 'maxHeight', v)} />
            <ControlInput label="Top" value={headerLogoConfig.mobile.top} onChange={v => handleHeaderLogoChange('mobile', 'top', v)} />
            <ControlInput label="Left" value={headerLogoConfig.mobile.left} onChange={v => handleHeaderLogoChange('mobile', 'left', v)} />
            <ControlInput label="Right" value={headerLogoConfig.mobile.right} onChange={v => handleHeaderLogoChange('mobile', 'right', v)} />
          </div>

          <div className="mt-2 pt-3 border-t border-gray-600">
            <div className="flex items-center justify-between">
              <label htmlFor="console-toggle" className="text-sm font-medium text-gray-300">Show Console</label>
              <input
                type="checkbox"
                id="console-toggle"
                checked={isConsoleVisible}
                onChange={() => setIsConsoleVisible(prev => !prev)}
                className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Debug Console */}
      {isConsoleVisible && (
        <div className="fixed bottom-4 right-4 z-50 w-80 h-40 bg-black/70 backdrop-blur-sm rounded-lg p-2 font-mono text-xs text-green-400 overflow-hidden flex flex-col-reverse shadow-lg border border-gray-700">
           <button
            onClick={() => setIsConsoleVisible(false)}
            className="absolute top-1 right-1 text-gray-400 hover:text-white p-1 z-10"
            aria-label="Hide console"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="overflow-y-auto">
              {logs.map((log, i) => (
                  <p key={i} className="whitespace-nowrap">{log}</p>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Debug;