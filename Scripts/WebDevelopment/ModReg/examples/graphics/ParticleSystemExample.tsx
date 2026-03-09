import React, { useRef, useEffect, useState } from 'react';
import { createAnimationLoop, AnimationLoop } from '../../modules/graphics/animation-loop';
import { createEmitter, ParticleEmitter } from '../../modules/graphics/particle-system';
import * as canvas from '../../modules/graphics/canvas-utils';

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
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-base-300 accent-neon-teal"
        />
    </div>
);


const ParticleSystemExample: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationLoopRef = useRef<AnimationLoop | null>(null);
    const emitterRef = useRef<ParticleEmitter | null>(null);

    const [lifespan, setLifespan] = useState(1500);
    const [speed, setSpeed] = useState(80);
    const [size, setSize] = useState(4);
    const [gravityY, setGravityY] = useState(90);
    const [emitCount, setEmitCount] = useState(50);
    
    useEffect(() => {
        const canvasEl = canvasRef.current;
        const ctx = canvas.getContext(canvasEl);
        if (!ctx || !canvasEl) return;
        
        const resizeCanvas = () => {
            const parent = canvasEl.parentElement;
            if (parent) {
                canvasEl.width = parent.clientWidth;
                canvasEl.height = 400;
            }
        };
        resizeCanvas();
        
        emitterRef.current = createEmitter({ 
            x: canvasEl.width / 2, 
            y: canvasEl.height / 2,
            particleLifespan: lifespan,
            particleSpeed: speed,
            particleSize: size,
            gravity: { x: 0, y: gravityY }
        });
        emitterRef.current.emit(emitCount);

        animationLoopRef.current = createAnimationLoop((deltaTime) => {
            canvas.clearCanvas(ctx);
            if (emitterRef.current) {
                emitterRef.current.update(deltaTime);
                emitterRef.current.draw(ctx);
            }
        });

        animationLoopRef.current.start();
        
        const handleCanvasClick = (e: MouseEvent) => {
             if (emitterRef.current) {
                const rect = canvasEl.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                emitterRef.current.setPosition(x, y);
                emitterRef.current.emit(emitCount);
            }
        };
        
        canvasEl.addEventListener('click', handleCanvasClick);
        window.addEventListener('resize', resizeCanvas);
        
        return () => {
            animationLoopRef.current?.stop();
            canvasEl.removeEventListener('click', handleCanvasClick);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);
    
    // Effect to update the emitter config when sliders change
    useEffect(() => {
        if (emitterRef.current) {
             emitterRef.current = createEmitter({ 
                x: emitterRef.current['pos'].x,
                y: emitterRef.current['pos'].y,
                particleLifespan: lifespan,
                particleSpeed: speed,
                particleSize: size,
                gravity: { x: 0, y: gravityY }
            });
        }
    }, [lifespan, speed, size, gravityY]);

    return (
        <div className="space-y-8">
            <FuturisticCard title="Particle Emitter" description="Click on the canvas to create a burst of particles. Use the controls below to change their behavior.">
                 <canvas ref={canvasRef} className="bg-base-100/50 rounded-lg w-full" />
            </FuturisticCard>
             <FuturisticCard title="Emitter Controls">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <ToolbarSlider label="Emit Count" value={emitCount} onChange={setEmitCount} min={10} max={300} step={10} />
                     <ToolbarSlider label="Lifespan (ms)" value={lifespan} onChange={setLifespan} min={200} max={5000} step={100} />
                     <ToolbarSlider label="Speed" value={speed} onChange={setSpeed} min={10} max={300} step={10} />
                     <ToolbarSlider label="Size" value={size} onChange={setSize} min={1} max={15} step={1} />
                     <ToolbarSlider label="Gravity" value={gravityY} onChange={setGravityY} min={0} max={500} step={10} />
                </div>
             </FuturisticCard>
        </div>
    );
};

export default ParticleSystemExample;
