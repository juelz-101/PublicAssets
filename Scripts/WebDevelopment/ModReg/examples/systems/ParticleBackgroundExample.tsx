import React, { useState } from 'react';
import ParticleBackgroundSystem from '../../app/ui/ParticleBackgroundSystem';

const ParticleBackgroundExample: React.FC = () => {
  const [count, setCount] = useState(150);
  const [color, setColor] = useState('#08f7fe');
  const [speed, setSpeed] = useState(1.0);
  const [interactive, setInteractive] = useState(true);

  return (
    <div className="flex flex-col h-[500px] border border-neon-teal/20 rounded-xl overflow-hidden bg-base-300/30 relative">
      {/* Background System */}
      <div className="absolute inset-0 z-0">
        <ParticleBackgroundSystem 
          particleCount={count}
          particleColor={color}
          speed={speed}
          interactive={interactive}
        />
      </div>

      {/* Controls Overlay */}
      <div className="relative z-10 p-6 bg-base-200/80 backdrop-blur-md border-b border-neon-teal/20 max-w-xs m-4 rounded-lg shadow-glow-sm">
        <h3 className="text-lg font-bold text-neon-teal mb-4">System Controls</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1">Particle Count: {count}</label>
            <input 
              type="range" min="10" max="500" step="10"
              value={count} onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full accent-neon-teal"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1">Color: {color}</label>
            <input 
              type="color"
              value={color} onChange={(e) => setColor(e.target.value)}
              className="w-full h-8 bg-transparent cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1">Speed: {speed.toFixed(1)}x</label>
            <input 
              type="range" min="0.1" max="5.0" step="0.1"
              value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-neon-teal"
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" id="interactive"
              checked={interactive} onChange={(e) => setInteractive(e.target.checked)}
              className="accent-neon-teal"
            />
            <label htmlFor="interactive" className="text-sm text-text-primary cursor-pointer">Mouse Interaction</label>
          </div>
        </div>
      </div>

      <div className="mt-auto relative z-10 p-4 text-center">
        <p className="text-xs text-text-secondary bg-base-300/50 backdrop-blur-sm inline-block px-3 py-1 rounded-full border border-white/5">
          This example demonstrates the <strong>ParticleBackgroundSystem</strong> component.
        </p>
      </div>
    </div>
  );
};

export default ParticleBackgroundExample;
