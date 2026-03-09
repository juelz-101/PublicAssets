
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createReactionDiffusion, ReactionDiffusionSystem, RDSysParams } from '../../modules/graphics/reaction-diffusion';
import { createAnimationLoop, AnimationLoop } from '../../modules/graphics/animation-loop';
import * as canvasUtils from '../../modules/graphics/canvas-utils';

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
            <label className="flex justify-between text-sm text-text-secondary font-mono">
                <span>{label}</span>
                <span>{value.toFixed(4)}</span>
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

// Presets from http://mrob.com/pub/comp/xmorphia/
const PRESETS: Record<string, { f: number; k: number }> = {
    'Mitosis': { f: 0.0367, k: 0.0649 },
    'Coral Growth': { f: 0.0545, k: 0.0620 },
    'Worms & Spots': { f: 0.0300, k: 0.0630 },
    'Mazes': { f: 0.029, k: 0.057 },
    'Chaotic': { f: 0.026, k: 0.051 },
    'Bubbles': { f: 0.012, k: 0.050 },
};

const SIM_WIDTH = 200;
const SIM_HEIGHT = 200;
const UPDATE_STEPS_PER_FRAME = 5;

const ReactionDiffusionExample: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const systemRef = useRef<ReactionDiffusionSystem | null>(null);
    const animationLoopRef = useRef<AnimationLoop | null>(null);

    const [params, setParams] = useState({ f: 0.0545, k: 0.0620 });
    const [isSimulating, setIsSimulating] = useState(false);

    const draw = useCallback(() => {
        const system = systemRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!system || !canvas || !ctx) return;
        
        const imageData = ctx.createImageData(SIM_WIDTH, SIM_HEIGHT);
        const data = imageData.data;
        const gridB = system.getGrid('B');

        for (let y = 0; y < SIM_HEIGHT; y++) {
            for (let x = 0; x < SIM_WIDTH; x++) {
                const i = (y * SIM_WIDTH + x) * 4;
                const b = gridB[y][x];
                // Color mapping: b controls brightness/color
                const colorVal = Math.floor(b * 255);
                data[i] = 8;        // R
                data[i + 1] = 247 - colorVal;  // G
                data[i + 2] = 254;      // B
                data[i + 3] = 255;      // A
            }
        }
        
        // Scale up the low-res simulation to the larger canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = SIM_WIDTH;
        tempCanvas.height = SIM_HEIGHT;
        tempCanvas.getContext('2d')?.putImageData(imageData, 0, 0);

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

    }, []);

    const resetSystem = useCallback(() => {
        const rdParams: RDSysParams = { dA: 1.0, dB: 0.5, f: params.f, k: params.k, dt: 1.0 };
        const system = createReactionDiffusion(SIM_WIDTH, SIM_HEIGHT, rdParams);
        system.seed(SIM_WIDTH / 2, SIM_HEIGHT / 2, 15);
        systemRef.current = system;
        draw();
    }, [params, draw]);

    useEffect(() => {
        resetSystem();
    }, [params, resetSystem]);

    useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;
        
        const resizeCanvas = () => {
            if (canvasEl.parentElement) {
                const size = Math.min(canvasEl.parentElement.clientWidth, 500);
                canvasEl.width = size;
                canvasEl.height = size;
                draw();
            }
        };
        resizeCanvas();

        animationLoopRef.current = createAnimationLoop(() => {
            if (systemRef.current) {
                for (let i = 0; i < UPDATE_STEPS_PER_FRAME; i++) {
                    systemRef.current.update();
                }
                draw();
            }
        });

        setIsSimulating(true);
        animationLoopRef.current.start();

        window.addEventListener('resize', resizeCanvas);
        return () => {
            animationLoopRef.current?.stop();
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [draw]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const system = systemRef.current;
        if (!system) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / rect.width * SIM_WIDTH);
        const y = Math.floor((e.clientY - rect.top) / rect.height * SIM_HEIGHT);
        system.seed(x, y, 10);
    };
    
    const handleRandomize = () => {
        const keys = Object.keys(PRESETS);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        setParams(PRESETS[randomKey]);
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="Reaction-Diffusion" description="A simulation of the Gray-Scott model. Click the canvas to 'seed' the reaction. Different 'f' and 'k' values produce unique patterns.">
                <canvas ref={canvasRef} onClick={handleCanvasClick} className="bg-base-100 rounded-lg w-full max-w-[500px] aspect-square mx-auto cursor-pointer" />
            </FuturisticCard>
            <FuturisticCard title="Controls">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <ToolbarSlider label="f (feed)" value={params.f} onChange={(v) => setParams(p => ({ ...p, f: v }))} min={0.01} max={0.1} step={0.0001} />
                    <ToolbarSlider label="k (kill)" value={params.k} onChange={(v) => setParams(p => ({ ...p, k: v }))} min={0.04} max={0.07} step={0.0001} />
                </div>
                <div className="pt-4 border-t border-neon-teal/20 flex flex-wrap gap-4">
                     <button onClick={resetSystem} className="bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition h-full">
                        Restart
                     </button>
                     <button onClick={handleRandomize} className="bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition h-full">
                        Randomize (f, k)
                     </button>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default ReactionDiffusionExample;
