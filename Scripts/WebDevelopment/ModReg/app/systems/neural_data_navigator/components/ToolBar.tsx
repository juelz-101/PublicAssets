import React from 'react';
import { MousePointer2, Move, RotateCw, Hand } from 'lucide-react';

interface ToolBarProps {
  interactionMode: 'camera' | 'drag';
  setInteractionMode: (mode: 'camera' | 'drag') => void;
}

const ToolBar: React.FC<ToolBarProps> = ({ interactionMode, setInteractionMode }) => {
  return (
    <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md border border-neon-teal/30 rounded-full p-1 shadow-[0_0_15px_rgba(8,247,254,0.1)]">
      <button
        onClick={() => setInteractionMode('camera')}
        className={`p-2 rounded-full transition-all duration-300 ${
          interactionMode === 'camera'
            ? 'bg-neon-teal text-black shadow-[0_0_10px_rgba(8,247,254,0.5)]'
            : 'text-neon-teal/70 hover:text-neon-teal hover:bg-white/10'
        }`}
        title="Camera Rotate (Left Click)"
      >
        <RotateCw size={18} />
      </button>
      <div className="w-px h-4 bg-neon-teal/20 mx-1" />
      <button
        onClick={() => setInteractionMode('drag')}
        className={`p-2 rounded-full transition-all duration-300 ${
          interactionMode === 'drag'
            ? 'bg-neon-teal text-black shadow-[0_0_10px_rgba(8,247,254,0.5)]'
            : 'text-neon-teal/70 hover:text-neon-teal hover:bg-white/10'
        }`}
        title="Drag Nodes (Left Click)"
      >
        <Hand size={18} />
      </button>
    </div>
  );
};

export default ToolBar;
