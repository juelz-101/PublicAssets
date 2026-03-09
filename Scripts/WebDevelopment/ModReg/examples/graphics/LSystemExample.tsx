
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { interpretLSystem, LSystem } from '../../modules/graphics/l-system';
import * as canvasUtils from '../../modules/graphics/canvas-utils';
import { interpolateColors } from '../../modules/graphics/color-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description?: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        {description && <p className="text-text-secondary mb-4">{description}</p>}
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const ToolbarSlider: React.FC<{ label: string; value: number; onChange: (value: number) => void; min: number; max: number; step: number }> =
    ({ label, value, onChange, min, max, step }) => (
        <div className="flex flex-col">
            <label className="flex justify-between text-sm text-text-secondary">
                <span>{label}</span>
                <span>{value}</span>
            </label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-base-300 accent-neon-pink"
            />
        </div>
    );

const PRESETS: Record<string, { system: LSystem; initialLength: number; lengthFactor: number; startPos: (w: number, h: number) => {x: number, y: number} }> = {
    'Fractal Plant': {
        system: { axiom: 'X', rules: { 'X': 'F+[[X]-X]-F[-FX]+X', 'F': 'FF' }, angle: 25 },
        initialLength: 300,
        lengthFactor: 0.5,
        startPos: (w, h) => ({ x: w / 2, y: h })
    },
    'Koch Snowflake': {
        system: { axiom: 'F++F++F', rules: { 'F': 'F-F++F-F' }, angle: 60, initialAngle: 0 },
        initialLength: 400,
        lengthFactor: 1 / 3,
        startPos: (w, h) => ({ x: w * 0.2, y: h * 0.2 })
    },
    'Dragon Curve': {
        system: { axiom: 'FX', rules: { 'X': 'X+YF+', 'Y': '-FX-Y' }, angle: 90, initialAngle: 0 },
        initialLength: 300,
        lengthFactor: 0.75,
        startPos: (w, h) => ({ x: w * 0.3, y: h * 0.6 })
    },
    'Sierpinski Triangle': {
        system: { axiom: 'F-G-G', rules: { 'F': 'F-G+F+G-F', 'G': 'GG' }, angle: 120, initialAngle: 0 },
        initialLength: 400,
        lengthFactor: 0.5,
        startPos: (w, h) => ({ x: w - 20, y: h * 0.8 })
    },
};


const LSystemExample: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    const [presetKey, setPresetKey] = useState('Fractal Plant');
    const [iterations, setIterations] = useState(4);
    const [isDrawing, setIsDrawing] = useState(false);

    const draw = useCallback(() => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        setIsDrawing(true);
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) {
            setIsDrawing(false);
            return;
        }

        const preset = PRESETS[presetKey];
        if (!preset) {
            setIsDrawing(false);
            return;
        }

        ctx.fillStyle = 'var(--color-background-base)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const generator = interpretLSystem(
            preset.system,
            iterations,
            preset.initialLength,
            preset.lengthFactor,
            preset.startPos(canvas.width, canvas.height)
        );
        
        const color1 = 'var(--color-accent-tertiary)';
        const color2 = 'var(--color-accent-primary)';

        const animate = () => {
            let hasDrawn = false;
            // Draw multiple segments per frame for speed
            for(let i=0; i < 50 && !hasDrawn; i++) {
                const result = generator.next();
                if (!result.done) {
                    const command = result.value;
                    if (command.type === 'line') {
                        const color = interpolateColors(color1, color2, command.depth / iterations);
                        canvasUtils.drawLine(ctx, command.from.x, command.from.y, command.to.x, command.to.y, {
                            strokeStyle: color,
                            lineWidth: 2,
                        });
                    }
                } else {
                    hasDrawn = true;
                }
            }

            if (hasDrawn) {
                setIsDrawing(false);
            } else {
                animationFrameId.current = requestAnimationFrame(animate);
            }
        };

        animate();
    }, [presetKey, iterations]);

    useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;
        const resize = () => {
            if (canvasEl.parentElement) {
                const size = Math.min(canvasEl.parentElement.clientWidth, 500);
                canvasEl.width = size;
                canvasEl.height = size;
                draw();
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [draw]);
    
    useEffect(() => {
        draw();
    }, [draw]);
    

    return (
        <div className="space-y-8">
            <FuturisticCard title="L-System Fractal Generator" description="Generates complex fractals from a simple set of rules. Change the preset and number of iterations to explore different patterns.">
                <canvas ref={canvasRef} className="bg-base-100 rounded-lg w-full max-w-[500px] aspect-square mx-auto" />
            </FuturisticCard>
            <FuturisticCard title="Controls">
                <div>
                    <label className="block text-text-secondary mb-2">Preset:</label>
                    <select
                        value={presetKey}
                        onChange={(e) => setPresetKey(e.target.value)}
                        disabled={isDrawing}
                        className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal"
                    >
                        {Object.keys(PRESETS).map(key => <option key={key} value={key}>{key}</option>)}
                    </select>
                </div>
                <ToolbarSlider 
                    label="Iterations" 
                    value={iterations} 
                    onChange={setIterations} 
                    min={1} 
                    max={presetKey === 'Dragon Curve' ? 12 : 7} 
                    step={1} 
                />
                 <button onClick={draw} disabled={isDrawing} className="bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition h-full disabled:bg-base-300 disabled:text-text-secondary disabled:border-base-300 disabled:cursor-not-allowed">
                    {isDrawing ? 'Drawing...' : 'Redraw'}
                 </button>
            </FuturisticCard>
        </div>
    );
};

export default LSystemExample;
