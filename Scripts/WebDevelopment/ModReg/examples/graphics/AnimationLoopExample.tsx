import React, { useRef, useEffect, useState } from 'react';
import { createAnimationLoop, AnimationLoop } from '../../modules/graphics/animation-loop';
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

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'green' | 'red' }> = ({ children, className, variant = 'green', ...props }) => {
    const colors = {
        green: 'bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border-neon-green',
        red: 'bg-neon-red/20 hover:bg-neon-red/30 text-neon-red border-neon-red',
    };
    return (
        <button {...props} className={`font-bold py-2 px-4 rounded transition duration-300 border ${colors[variant]} ${className}`}>
            {children}
        </button>
    );
};

const OutputBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-2 bg-base-100/50 rounded-md border border-base-300/50">
        <p className="text-text-secondary text-sm">{title}</p>
        <p className="text-text-primary font-mono text-base">{children}</p>
    </div>
);

const AnimationLoopExample: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationLoopRef = useRef<AnimationLoop | null>(null);
    const boxRef = useRef({ x: 50, y: 50, vx: 100, vy: 80 }); // vx/vy in pixels per second

    const [isRunning, setIsRunning] = useState(false);
    const [deltaTime, setDeltaTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);

    useEffect(() => {
        const canvasEl = canvasRef.current;
        const ctx = canvas.getContext(canvasEl);
        if (!ctx || !canvasEl) return;
        
        const resizeCanvas = () => {
            const parent = canvasEl.parentElement;
            if (parent) {
                canvasEl.width = parent.clientWidth;
                canvasEl.height = 300;
            }
        };
        resizeCanvas();

        const update = (dt: number, tt: number) => {
            // Cap delta time to prevent large jumps if the tab is inactive
            const cappedDt = Math.min(dt, 100); 

            setDeltaTime(cappedDt);
            setTotalTime(tt);
            
            const dtSeconds = cappedDt / 1000;
            let { x, y, vx, vy } = boxRef.current;
            
            x += vx * dtSeconds;
            y += vy * dtSeconds;
            
            if (x < 0) { x = 0; vx *= -1; }
            if (x > canvasEl.width - 50) { x = canvasEl.width - 50; vx *= -1; }
            if (y < 0) { y = 0; vy *= -1; }
            if (y > canvasEl.height - 50) { y = canvasEl.height - 50; vy *= -1; }
            
            boxRef.current = { x, y, vx, vy };
            
            canvas.clearCanvas(ctx);
            canvas.drawRect(ctx, x, y, 50, 50, { fillStyle: 'var(--color-accent-primary)' });
        };
        
        animationLoopRef.current = createAnimationLoop(update);
        
        // Initial draw
        canvas.drawRect(ctx, boxRef.current.x, boxRef.current.y, 50, 50, { fillStyle: 'var(--color-accent-primary)' });

        window.addEventListener('resize', resizeCanvas);
        
        return () => {
            animationLoopRef.current?.stop();
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    const handleStart = () => {
        animationLoopRef.current?.start();
        setIsRunning(true);
    };
    
    const handleStop = () => {
        animationLoopRef.current?.stop();
        setIsRunning(false);
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="Animation Canvas" description="A box moves at a constant speed using the delta time from the animation loop.">
                 <canvas ref={canvasRef} className="bg-base-100/50 rounded-lg w-full" />
            </FuturisticCard>
             <FuturisticCard title="Controls & Stats">
                <div className="flex flex-wrap gap-4 items-center">
                    <FuturisticButton onClick={handleStart} disabled={isRunning} variant="green">Start</FuturisticButton>
                    <FuturisticButton onClick={handleStop} disabled={!isRunning} variant="red">Stop</FuturisticButton>
                    <p className="text-text-secondary">
                        Loop is currently: <span className={`font-bold ${isRunning ? 'text-neon-green' : 'text-neon-red'}`}>{isRunning ? 'Running' : 'Stopped'}</span>
                    </p>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neon-teal/20">
                    <OutputBox title="Delta Time (ms/frame):">
                        {deltaTime.toFixed(2)}
                    </OutputBox>
                    <OutputBox title="Total Time (ms):">
                        {(totalTime / 1000).toFixed(2)}s
                    </OutputBox>
                </div>
             </FuturisticCard>
        </div>
    );
};

export default AnimationLoopExample;
