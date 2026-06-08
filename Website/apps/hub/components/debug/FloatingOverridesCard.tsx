import React, { useState, useCallback, useRef } from 'react';
import { ManifestUISettings } from '../../services/contentService';
import OverridesTab from './OverridesTab';

interface FloatingOverridesCardProps {
    settings: ManifestUISettings | undefined;
    onSettingsChange: (newSettings: ManifestUISettings) => void;
    onPopIn: () => void;
}

const PopInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 11a1 1 0 100 2h12a1 1 0 100-2H4z" />
        <path d="M3 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
        <path d="M10 2a1 1 0 011 1v1h-2V3a1 1 0 011-1zM9 15v1a1 1 0 002 0v-1H9z" />
    </svg>
);

const OpacityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 2a8 8 0 014.906 14.32l-9.812-9.812A7.962 7.962 0 0110 2z" />
    </svg>
);

const BlurIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M5 17v4m-2-2h4m11-12v4m2-2h-4m2 12h-4m4 2v-4M9 5a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
    </svg>
);


const FloatingOverridesCard: React.FC<FloatingOverridesCardProps> = ({ settings, onSettingsChange, onPopIn }) => {
    const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 80 });
    const [opacity, setOpacity] = useState(0.2);
    const [blur, setBlur] = useState(24);
    const cardRef = useRef<HTMLDivElement>(null);
    const dragInfo = useRef({ isDragging: false, offsetX: 0, offsetY: 0 });

    const handleDragMove = useCallback((e: MouseEvent) => {
        if (!dragInfo.current.isDragging) return;
        const newX = e.clientX - dragInfo.current.offsetX;
        const newY = e.clientY - dragInfo.current.offsetY;
        setPosition({ x: newX, y: newY });
    }, []);

    const stopDrag = useCallback(() => {
        dragInfo.current.isDragging = false;
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', stopDrag);
    }, [handleDragMove]);

    const startDrag = useCallback((e: React.MouseEvent) => {
        if (!cardRef.current || (e.target as HTMLElement).closest('button, input')) return;
        dragInfo.current.isDragging = true;
        const rect = cardRef.current.getBoundingClientRect();
        dragInfo.current.offsetX = e.clientX - rect.left;
        dragInfo.current.offsetY = e.clientY - rect.top;
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', stopDrag);
    }, [handleDragMove, stopDrag]);

    return (
        <div
            ref={cardRef}
            className="fixed z-[75] w-96 shadow-2xl ring-1 ring-white/10 rounded-2xl flex flex-col animate-fade-in-up transition-colors duration-200"
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
                backgroundColor: `rgba(17, 24, 39, ${opacity})`, // bg-gray-900 is rgb(17, 24, 39)
                backdropFilter: `blur(${blur}px)`
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="floating-overrides-title"
        >
            <header
                onMouseDown={startDrag}
                className="flex justify-between items-center p-3 border-b border-white/10 flex-shrink-0 cursor-move"
            >
                <h2 id="floating-overrides-title" className="text-md font-bold text-amber-400">UI Overrides</h2>
                <button
                    onClick={onPopIn}
                    className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
                    aria-label="Pop overrides back into debug menu"
                >
                    <PopInIcon />
                </button>
            </header>
            <div className="p-4 overflow-y-auto">
                <OverridesTab settings={settings} onSettingsChange={onSettingsChange} />
            </div>
            <footer className="p-3 border-t border-white/10 flex-shrink-0">
                 <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <OpacityIcon />
                        <input
                            type="range"
                            min="0.2"
                            max="1.0"
                            step="0.05"
                            value={opacity}
                            onChange={(e) => setOpacity(Number(e.target.value))}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            aria-label="Card opacity"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <BlurIcon />
                        <input
                            type="range"
                            min="0"
                            max="40"
                            step="1"
                            value={blur}
                            onChange={(e) => setBlur(Number(e.target.value))}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            aria-label="Card blur"
                        />
                    </div>
                 </div>
            </footer>
        </div>
    );
};

export default FloatingOverridesCard;