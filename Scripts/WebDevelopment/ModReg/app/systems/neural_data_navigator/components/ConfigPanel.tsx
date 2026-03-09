import React, { useState } from 'react';
import { Settings, Database, Eye, Activity, X } from 'lucide-react';

interface ConfigPanelProps {
  config: any;
  onConfigChange: (key: string, value: any) => void;
  backendData: any;
  onBackendDataChange: (key: string, value: any) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  config, 
  onConfigChange, 
  backendData, 
  onBackendDataChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'visuals' | 'backend'>('visuals');

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-6 right-6 p-3 bg-black/60 backdrop-blur-md border border-neon-teal/30 rounded-full text-neon-teal hover:bg-neon-teal/20 transition-all shadow-[0_0_15px_rgba(8,247,254,0.3)] z-50 group"
      >
        <Settings size={24} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>
    );
  }

  return (
    <div className="absolute top-6 right-6 w-80 bg-black/90 backdrop-blur-xl border border-neon-teal/50 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col transition-all animate-in fade-in slide-in-from-top-5">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neon-teal/20 bg-gradient-to-r from-neon-teal/10 to-transparent">
        <h3 className="text-neon-teal font-bold tracking-wider flex items-center gap-2">
          <Settings size={18} />
          SYSTEM CONFIG
        </h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neon-teal/20">
        <button
          onClick={() => setActiveTab('visuals')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'visuals' 
              ? 'bg-neon-teal/10 text-neon-teal border-b-2 border-neon-teal' 
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <Eye size={14} />
          Visuals
        </button>
        <button
          onClick={() => setActiveTab('backend')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'backend' 
              ? 'bg-neon-pink/10 text-neon-pink border-b-2 border-neon-pink' 
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <Database size={14} />
          Backend
        </button>
      </div>

      {/* Content */}
      <div className="p-5 max-h-[400px] overflow-y-auto custom-scrollbar">
        
        {activeTab === 'visuals' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs text-neon-teal font-bold uppercase flex justify-between">
                Node Size
                <span className="text-white">{config.nodeSize}</span>
              </label>
              <input 
                type="range" min="0.1" max="2" step="0.1"
                value={config.nodeSize}
                onChange={(e) => onConfigChange('nodeSize', parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-teal"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs text-neon-teal font-bold uppercase flex justify-between">
                Link Opacity
                <span className="text-white">{config.linkOpacity}</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.05"
                value={config.linkOpacity}
                onChange={(e) => onConfigChange('linkOpacity', parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-teal"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs text-neon-teal font-bold uppercase flex justify-between">
                Particle Count
                <span className="text-white">{config.particleCount}</span>
              </label>
              <input 
                type="range" min="0" max="2000" step="100"
                value={config.particleCount}
                onChange={(e) => onConfigChange('particleCount', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-teal"
              />
            </div>

             <div className="space-y-3">
              <label className="text-xs text-neon-teal font-bold uppercase flex justify-between">
                Bloom Intensity
                <span className="text-white">{config.bloomIntensity}</span>
              </label>
              <input 
                type="range" min="0" max="3" step="0.1"
                value={config.bloomIntensity}
                onChange={(e) => onConfigChange('bloomIntensity', parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-teal"
              />
            </div>
          </div>
        )}

        {activeTab === 'backend' && (
          <div className="space-y-6">
            <div className="p-3 bg-neon-pink/5 border border-neon-pink/20 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <Activity className="text-neon-pink shrink-0 mt-0.5" size={16} />
                <p className="text-[10px] text-gray-300 leading-relaxed">
                  Adjusting these parameters will restart the physics simulation.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-neon-pink font-bold uppercase flex justify-between">
                Repulsion Force
                <span className="text-white">{backendData.repulsion}</span>
              </label>
              <input 
                type="range" min="10" max="500" step="10"
                value={backendData.repulsion}
                onChange={(e) => onBackendDataChange('repulsion', parseInt(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-pink"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs text-neon-pink font-bold uppercase flex justify-between">
                Attraction Force
                <span className="text-white">{backendData.attraction}</span>
              </label>
              <input 
                type="range" min="0.001" max="0.1" step="0.001"
                value={backendData.attraction}
                onChange={(e) => onBackendDataChange('attraction', parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-pink"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs text-neon-pink font-bold uppercase flex justify-between">
                Gravity (Center)
                <span className="text-white">{backendData.gravity}</span>
              </label>
              <input 
                type="range" min="0" max="0.1" step="0.001"
                value={backendData.gravity}
                onChange={(e) => onBackendDataChange('gravity', parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-pink"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs text-neon-pink font-bold uppercase flex justify-between">
                Damping
                <span className="text-white">{backendData.damping}</span>
              </label>
              <input 
                type="range" min="0.1" max="0.99" step="0.01"
                value={backendData.damping}
                onChange={(e) => onBackendDataChange('damping', parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-pink"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ConfigPanel;
