import React from 'react';
import { ZoomIn, ZoomOut, Maximize, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface CameraControlsProps {
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: (direction: 'left' | 'right' | 'up' | 'down') => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({ onFitView, onZoomIn, onZoomOut, onRotate }) => {
  return (
    <div className="flex flex-col gap-2 pointer-events-auto">
      {/* Zoom / Fit Group */}
      <div className="flex flex-col gap-1 bg-black/80 backdrop-blur-md border border-neon-teal/30 rounded-lg p-1.5 shadow-[0_0_15px_rgba(8,247,254,0.1)]">
        <button
          onClick={onFitView}
          className="p-1.5 text-neon-teal/70 hover:text-neon-teal hover:bg-white/10 rounded-md transition-colors"
          title="Fit View"
        >
          <Maximize size={16} />
        </button>
        <div className="h-px w-full bg-neon-teal/20 my-0.5" />
        <button
          onClick={onZoomIn}
          className="p-1.5 text-neon-teal/70 hover:text-neon-teal hover:bg-white/10 rounded-md transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={onZoomOut}
          className="p-1.5 text-neon-teal/70 hover:text-neon-teal hover:bg-white/10 rounded-md transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
      </div>

      {/* D-Pad Group */}
      <div className="grid grid-cols-3 gap-1 bg-black/80 backdrop-blur-md border border-neon-teal/30 rounded-lg p-1.5 shadow-[0_0_15px_rgba(8,247,254,0.1)] w-[84px]">
        <div />
        <button
          onClick={() => onRotate('up')}
          className="p-1.5 text-neon-teal/70 hover:text-neon-teal hover:bg-white/10 rounded-md transition-colors flex justify-center"
        >
          <ArrowUp size={14} />
        </button>
        <div />
        
        <button
          onClick={() => onRotate('left')}
          className="p-1.5 text-neon-teal/70 hover:text-neon-teal hover:bg-white/10 rounded-md transition-colors flex justify-center"
        >
          <ArrowLeft size={14} />
        </button>
        <div className="flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-teal/50" />
        </div>
        <button
          onClick={() => onRotate('right')}
          className="p-1.5 text-neon-teal/70 hover:text-neon-teal hover:bg-white/10 rounded-md transition-colors flex justify-center"
        >
          <ArrowRight size={14} />
        </button>

        <div />
        <button
          onClick={() => onRotate('down')}
          className="p-1.5 text-neon-teal/70 hover:text-neon-teal hover:bg-white/10 rounded-md transition-colors flex justify-center"
        >
          <ArrowDown size={14} />
        </button>
        <div />
      </div>
    </div>
  );
};

export default CameraControls;
