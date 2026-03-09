
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PerlinNoise } from '../../modules/graphics/noise-utils';
import { createAnimationLoop, AnimationLoop } from '../../modules/graphics/animation-loop';
import * as canvasUtils from '../../modules/graphics/canvas-utils';
import { Vector, createVector, add, multiply, normalize, limit } from '../../modules/graphics/vector-utils';
import { useEventListener } from '../../modules/hooks/use-event-listener';


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

interface Particle {
    pos: Vector;
    vel: Vector;
    acc: Vector;
    maxSpeed: number;
    color: string;
}

const NoiseUtilsExample: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationLoopRef = useRef<AnimationLoop | null>(null);
    const noiseRef = useRef<PerlinNoise>(new PerlinNoise(Math.random()));
    const particlesRef = useRef<Particle[]>([]);

    const [particleCount, setParticleCount] = useState(1500);
    const [noiseScale, setNoiseScale] = useState(0.005);
    const [forceStrength, setForceStrength] = useState(0.1);
    const [particleSpeed, setParticleSpeed] = useState(2);
    const [showField, setShowField] = useState(false);
    const [colorCycle, setColorCycle] = useState(0);

    const reset = useCallback((canvas: HTMLCanvasElement) => {
        noiseRef.current = new PerlinNoise(Math.random());
        particlesRef.current = Array.from({ length: particleCount }, () => ({
            pos: createVector(Math.random() * canvas.width, Math.random() * canvas.height),
            vel: createVector(0, 0),
            acc: createVector(0, 0),
            maxSpeed: particleSpeed,
            color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)`
        }));
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = 'var(--color-background-base)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [particleCount, particleSpeed]);

    useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;
        
        const resizeCanvas = () => {
            if (canvasEl.parentElement) {
                canvasEl.width = canvasEl.parentElement.clientWidth;
                canvasEl.height = 500;
                reset(canvasEl);
            }
        };
        resizeCanvas();

        animationLoopRef.current = createAnimationLoop((_dt, totalTime) => {
            const ctx = canvasUtils.getContext(canvasEl);
            if (!ctx) return;
            
            setColorCycle(totalTime / 10000);

            // Create trails
            canvasUtils.drawRect(ctx, 0, 0, canvasEl.width, canvasEl.height, { fillStyle: 'rgba(10, 10, 10, 0.05)'});

            if (showField) {
                const resolution = 20;
                for (let x = 0; x < canvasEl.width; x += resolution) {
                    for (let y = 0; y < canvasEl.height; y += resolution) {
                        const angle = noiseRef.current.get(x * noiseScale, y * noiseScale) * Math.PI * 2;
                        canvasUtils.withState(ctx, () => {
                            ctx.translate(x, y);
                            ctx.rotate(angle);
                            canvasUtils.drawLine(ctx, 0, 0, resolution * 0.8, 0, { strokeStyle: 'rgba(255, 255, 255, 0.1)' });
                        });
                    }
                }
            }

            particlesRef.current.forEach(p => {
                const angle = noiseRef.current.get(p.pos.x * noiseScale, p.pos.y * noiseScale) * Math.PI * 2 * 4;
                const force = createVector(Math.cos(angle), Math.sin(angle));
                force.x *= forceStrength;
                force.y *= forceStrength;
                
                p.acc = add(p.acc, force);
                p.vel = add(p.vel, p.acc);
                p.vel = limit(p.vel, p.maxSpeed);
                p.pos = add(p.pos, p.vel);
                p.acc = multiply(p.acc, 0); // reset acceleration

                // Edge wrapping
                if (p.pos.x > canvasEl.width) p.pos.x = 0;
                if (p.pos.x < 0) p.pos.x = canvasEl.width;
                if (p.pos.y > canvasEl.height) p.pos.y = 0;
                if (p.pos.y < 0) p.pos.y = canvasEl.height;
                
                const hue = (p.pos.x / canvasEl.width * 60 + 180 + colorCycle * 360) % 360;
                canvasUtils.drawCircle(ctx, p.pos.x, p.pos.y, 1, { fillStyle: `hsla(${hue}, 100%, 70%, 0.8)` });
            });
        });

        animationLoopRef.current.start();
        
        window.addEventListener('resize', resizeCanvas);
        
        return () => {
            animationLoopRef.current?.stop();
            window.removeEventListener('resize', resizeCanvas);
        };

    }, [reset, noiseScale, forceStrength, showField, colorCycle]);

    return (
        <div className="space-y-8">
            <FuturisticCard title="Perlin Noise Flow Field" description="Thousands of particles follow a vector field generated by Perlin noise, creating organic, flowing patterns.">
                <canvas ref={canvasRef} className="bg-base-100 rounded-lg w-full" />
            </FuturisticCard>
            <FuturisticCard title="Controls">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ToolbarSlider label="Particle Count" value={particleCount} onChange={setParticleCount} min={100} max={5000} step={100} />
                    <ToolbarSlider label="Max Speed" value={particleSpeed} onChange={setParticleSpeed} min={0.5} max={10} step={0.5} />
                    <ToolbarSlider label="Force" value={forceStrength} onChange={setForceStrength} min={0.01} max={0.5} step={0.01} />
                    <ToolbarSlider label="Noise Scale (Zoom)" value={noiseScale} onChange={setNoiseScale} min={0.001} max={0.02} step={0.001} />
                    <div className="flex items-center justify-between p-2 bg-base-100/50 rounded-lg col-span-1 md:col-span-2 lg:col-span-1">
                        <label htmlFor="show-field-toggle" className="font-semibold text-text-primary text-sm">Show Vector Field</label>
                        <button
                            id="show-field-toggle"
                            onClick={() => setShowField(!showField)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showField ? 'bg-neon-green' : 'bg-base-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showField ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                     <button onClick={() => canvasRef.current && reset(canvasRef.current)} className="bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition h-full">
                        Reset (New Seed)
                     </button>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default NoiseUtilsExample;
