
import React, { useState, useEffect, useCallback } from 'react';
import SettingsIcon from './icons/SettingsIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';

export interface BackgroundParams {
    speed: number;
    buildingCount: number;
    fov: number;
    worldWidth: number;
    gridDensity: number;
    hillComplexity: number;
    hillHeight: number;
    cameraHeight: number;
}

interface HomepageToolbarProps {
    params: BackgroundParams;
    setParams: React.Dispatch<React.SetStateAction<BackgroundParams>>;
    onToggleUI: () => void;
}

// A reusable slider component with improved typing and a description prop
interface ToolbarSliderProps {
    label: string;
    description: string;
    paramKey: keyof BackgroundParams;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (paramKey: keyof BackgroundParams, value: number) => void;
}

const ToolbarSlider: React.FC<ToolbarSliderProps> = ({ label, description, paramKey, value, min, max, step, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(paramKey, Number(e.target.value));
    };

    return (
        <div className="flex flex-col">
            <label className="flex justify-between text-sm text-text-secondary" title={description}>
                <span>{label}</span>
                <span>{value.toFixed(paramKey === 'speed' ? 1 : 0)}</span>
            </label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-base-300 accent-neon-teal"
            />
        </div>
    );
};

const HomepageToolbar: React.FC<HomepageToolbarProps> = ({ params, setParams, onToggleUI }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Use useCallback to memoize the change handler and prevent unnecessary re-renders
    const handleParamChange = useCallback(
        (paramKey: keyof BackgroundParams, value: number) => {
            setParams(prev => ({
                ...prev,
                [paramKey]: value
            }));
        }, [setParams]
    );

    // Close the settings panel on Escape key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <div className="fixed top-4 right-4 z-50 flex items-start space-x-2">
            <button
                onClick={onToggleUI}
                className="w-14 h-14 rounded-full flex items-center justify-center bg-base-200/50 backdrop-blur-lg border border-neon-teal/20 text-neon-teal hover:bg-neon-teal/20 hover:shadow-glow-md transition-all duration-300"
                aria-label="Toggle UI Focus Mode"
            >
                <EyeSlashIcon className="w-7 h-7" />
            </button>
            <div className="relative flex flex-col items-end">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 rounded-full flex items-center justify-center bg-base-200/50 backdrop-blur-lg border border-neon-teal/20 text-neon-teal hover:bg-neon-teal/20 hover:shadow-glow-md transition-all duration-300"
                    aria-label="Toggle background settings"
                    aria-expanded={isOpen}
                >
                    <SettingsIcon className={`w-7 h-7 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                {isOpen && (
                    <div className="absolute top-16 right-0 w-64 bg-base-200/80 backdrop-blur-lg border border-neon-teal/20 rounded-lg shadow-glow-lg p-4 animate-fade-in">
                        <h3 className="text-lg font-bold text-neon-teal mb-4">Background Controls</h3>
                        <div className="space-y-4">
                            <ToolbarSlider
                                label="Speed"
                                description="Controls the speed of objects and camera movement."
                                paramKey="speed"
                                value={params.speed}
                                min={0.1}
                                max={5}
                                step={0.1}
                                onChange={handleParamChange}
                            />
                            <ToolbarSlider
                                label="Asset Count"
                                description="Adjusts the number of buildings, trees, and vehicles."
                                paramKey="buildingCount"
                                value={params.buildingCount}
                                min={0}
                                max={200}
                                step={5}
                                onChange={handleParamChange}
                            />
                            <ToolbarSlider
                                label="Camera Height"
                                description="Changes the camera's vertical position above the ground."
                                paramKey="cameraHeight"
                                value={params.cameraHeight}
                                min={50}
                                max={500}
                                step={10}
                                onChange={handleParamChange}
                            />
                            <ToolbarSlider
                                label="Field of View (FOV)"
                                description="Adjusts the camera's perspective. Lower values create a wider view."
                                paramKey="fov"
                                value={params.fov}
                                min={100}
                                max={800}
                                step={10}
                                onChange={handleParamChange}
                            />
                            <ToolbarSlider
                                label="World Width"
                                description="Controls the width of the generated cityscape."
                                paramKey="worldWidth"
                                value={params.worldWidth}
                                min={500}
                                max={8000}
                                step={50}
                                onChange={handleParamChange}
                            />
                            <ToolbarSlider
                                label="Grid Density"
                                description="Determines the number of horizontal grid lines on the road."
                                paramKey="gridDensity"
                                value={params.gridDensity}
                                min={5}
                                max={50}
                                step={1}
                                onChange={handleParamChange}
                            />
                            <ToolbarSlider
                                label="Hill Complexity"
                                description="Increases the waviness and detail of the distant hills."
                                paramKey="hillComplexity"
                                value={params.hillComplexity}
                                min={10}
                                max={100}
                                step={5}
                                onChange={handleParamChange}
                            />
                            <ToolbarSlider
                                label="Hill Height"
                                description="Controls the maximum height of the distant hills."
                                paramKey="hillHeight"
                                value={params.hillHeight}
                                min={0}
                                max={100}
                                step={5}
                                onChange={handleParamChange}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomepageToolbar;
