
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { generateCliffordPoints, CliffordParams } from '../../modules/graphics/attractor-utils';

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
                <span>{value.toFixed(2)}</span>
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
    
const AttractorExample: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    const [params, setParams] = useState<CliffordParams>({ a: -1.4, b: 1.6, c: 1.0, d: 0.7 });
    const [iterations, setIterations] = useState(1000000);
    const [hueOffset, setHueOffset] = useState(180);

    const randomizeParams = () => {
        setParams({
            a: Math.random() * 4 - 2,
            b: Math.random() * 4 - 2,
            c: Math.random() * 4 - 2,
            d: Math.random() * 4 - 2,
        });
    };
    
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        ctx.fillStyle = 'rgba(10, 10, 10, 0.95)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const scale = Math.min(canvas.width, canvas.height) / 4;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const generator = generateCliffordPoints(params, 0, 0, iterations, 5000);

        const animate = () => {
            const result = generator.next();
            if (!result.done) {
                const batch = result.value;
                batch.forEach(p => {
                    const px = p.x * scale + centerX;
                    const py = p.y * scale + centerY;
                    const hue = (Math.atan2(p.y, p.x) * 180 / Math.PI + hueOffset) % 360;
                    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.1)`;
                    ctx.fillRect(px, py, 1, 1);
                });
                animationFrameId.current = requestAnimationFrame(animate);
            }
        };
        
        animate();

    }, [params, iterations, hueOffset]);


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
        
        return () => {
            window.removeEventListener('resize', resize);
        }

    }, [draw]);
    
    useEffect(() => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        draw();
        return () => {
             if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        }
    }, [draw]);


    return (
        <div className="space-y-8">
            <FuturisticCard title="Clifford Attractor" description="A strange attractor defined by a simple iterative formula. Small changes to the parameters (a, b, c, d) create wildly different patterns.">
                <canvas ref={canvasRef} className="bg-base-100 rounded-lg w-full max-w-[500px] aspect-square mx-auto" />
            </FuturisticCard>
            <FuturisticCard title="Controls">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <ToolbarSlider label="a" value={params.a} onChange={(v) => setParams(p => ({ ...p, a: v }))} min={-2} max={2} step={0.01} />
                    <ToolbarSlider label="b" value={params.b} onChange={(v) => setParams(p => ({ ...p, b: v }))} min={-2} max={2} step={0.01} />
                    <ToolbarSlider label="c" value={params.c} onChange={(v) => setParams(p => ({ ...p, c: v }))} min={-2} max={2} step={0.01} />
                    <ToolbarSlider label="d" value={params.d} onChange={(v) => setParams(p => ({ ...p, d: v }))} min={-2} max={2} step={0.01} />
                </div>
                 <div className="pt-4 border-t border-neon-teal/20">
                    <ToolbarSlider label="Color Hue" value={hueOffset} onChange={setHueOffset} min={0} max={360} step={1} />
                </div>
                <div className="pt-4 border-t border-neon-teal/20">
                    <button onClick={randomizeParams} className="bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition h-full">
                        Randomize Parameters
                     </button>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default AttractorExample;
