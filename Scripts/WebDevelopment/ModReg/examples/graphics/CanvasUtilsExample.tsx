

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as canvasUtils from '../../modules/graphics/canvas-utils';
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

// Helper to create a simple sprite sheet on an offscreen canvas
const createDemoSpriteSheet = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    
    // Frame 1
    ctx.fillStyle = '#08f7fe';
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Frame 2
    ctx.fillStyle = '#00ff9f';
    ctx.fillRect(32 + 4, 4, 24, 24);

    // Frame 3
    ctx.fillStyle = '#F50057';
    ctx.beginPath();
    ctx.moveTo(64 + 16, 4);
    ctx.lineTo(64 + 4, 28);
    ctx.lineTo(64 + 28, 28);
    ctx.closePath();
    ctx.fill();

    // Frame 4
    ctx.strokeStyle = '#EAEAEA';
    ctx.lineWidth = 3;
    ctx.strokeRect(96 + 6, 6, 20, 20);

    return canvas;
};


const CanvasUtilsExample: React.FC = () => {
    const roundedRectCanvasRef = useRef<HTMLCanvasElement>(null);
    const imageCanvasRef = useRef<HTMLCanvasElement>(null);
    
    const [radius, setRadius] = useState(20);
    const [rotation, setRotation] = useState(0);
    const [scale, setScale] = useState(1);
    
    const spriteSheet = useMemo(() => createDemoSpriteSheet(), []);
    const animationFrameRef = useRef(0);
    const lastTimeRef = useRef(0);
    
    // Draw Rounded Rect
    useEffect(() => {
        const canvas = roundedRectCanvasRef.current;
        const ctx = canvasUtils.getContext(canvas);
        if (!ctx) return;

        canvasUtils.clearCanvas(ctx);
        canvasUtils.drawRoundedRect(ctx, 50, 50, canvas.width - 100, canvas.height - 100, radius, {
            fillStyle: 'rgba(8, 247, 254, 0.2)',
            strokeStyle: 'rgba(8, 247, 254, 1)',
            lineWidth: 4,
        });
    }, [radius]);

    // Draw Image Animation
    useEffect(() => {
        const canvas = imageCanvasRef.current;
        const ctx = canvasUtils.getContext(canvas);
        if (!ctx) return;

        const animate = (time: number) => {
            if (lastTimeRef.current === 0) lastTimeRef.current = time;
            const deltaTime = time - lastTimeRef.current;
            lastTimeRef.current = time;

            canvasUtils.clearCanvas(ctx);

            const frameCount = 4;
            const frameWidth = 32;
            const frameHeight = 32;
            const currentFrame = Math.floor(time / 250) % frameCount; // Change frame every 250ms
            
            // Draw cropped sprite
            canvasUtils.drawImage(ctx, spriteSheet, {
                x: 50, y: 50,
                width: frameWidth * scale,
                height: frameHeight * scale,
                sx: currentFrame * frameWidth,
                sy: 0,
                sWidth: frameWidth,
                sHeight: frameHeight,
                rotation: rotation * (Math.PI / 180),
                opacity: 0.8,
            });
            
            // Draw full sprite sheet for reference
             canvasUtils.drawImage(ctx, spriteSheet, {
                x: 200, y: 50,
                width: 128 * 1.5,
                height: 32 * 1.5,
                opacity: 1,
            });
             canvasUtils.drawText(ctx, "Sprite Sheet", 200, 40, { font: "12px monospace", fillStyle: 'var(--color-text-secondary)'});
             canvasUtils.drawRect(ctx, 200 + (currentFrame * frameWidth * 1.5), 50, frameWidth*1.5, frameHeight*1.5, { strokeStyle: '#F50057', lineWidth: 2 });


            animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
            lastTimeRef.current = 0;
        };

    }, [spriteSheet, rotation, scale]);
    
    const setupCanvas = (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        const parent = canvas.parentElement;
        if(parent) {
            canvas.width = parent.clientWidth;
            canvas.height = 200;
        }
    };

    useEventListener('resize', () => {
        setupCanvas(roundedRectCanvasRef.current);
        setupCanvas(imageCanvasRef.current);
    });

    useEffect(() => {
        setupCanvas(roundedRectCanvasRef.current);
        setupCanvas(imageCanvasRef.current);
    }, []);

    return (
        <div className="space-y-8">
            <FuturisticCard title="drawRoundedRect" description="Draws a rectangle with customizable corner radii.">
                <div>
                     <label className="block text-text-secondary mb-1">Corner Radius: {radius}px</label>
                     <input
                        type="range"
                        min="0"
                        max="100"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full accent-neon-teal"
                     />
                </div>
                <canvas ref={roundedRectCanvasRef} className="bg-base-100/50 rounded-lg w-full" />
            </FuturisticCard>
            
            <FuturisticCard title="drawImage" description="Draws an image with options for rotation, scaling, and cropping (for sprite animation).">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                         <label className="block text-text-secondary mb-1">Rotation: {rotation}°</label>
                         <input
                            type="range"
                            min="0"
                            max="360"
                            value={rotation}
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="w-full accent-neon-pink"
                         />
                    </div>
                     <div>
                         <label className="block text-text-secondary mb-1">Scale: {scale.toFixed(2)}x</label>
                         <input
                            type="range"
                            min="0.5"
                            max="5"
                            step="0.1"
                            value={scale}
                            onChange={(e) => setScale(Number(e.target.value))}
                            className="w-full accent-neon-pink"
                         />
                    </div>
                </div>
                <canvas ref={imageCanvasRef} className="bg-base-100/50 rounded-lg w-full" />
            </FuturisticCard>
        </div>
    );
};

export default CanvasUtilsExample;
