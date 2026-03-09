
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LayerManager } from '../../modules/graphics/canvas-layer-manager';
import { createAnimationLoop, AnimationLoop } from '../../modules/graphics/animation-loop';
import { useEventListener } from '../../modules/hooks/use-event-listener';
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
            <label className="flex justify-between text-sm text-text-secondary">
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

const CanvasLayerManagerExample: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const layerManagerRef = useRef<LayerManager | null>(null);
    const animationLoopRef = useRef<AnimationLoop | null>(null);
    const movingShapesRef = useRef<{ x: number, y: number, vx: number, vy: number, radius: number }[]>([]);

    const [isObjectsVisible, setIsObjectsVisible] = useState(true);
    const [uiOpacity, setUiOpacity] = useState(1.0);
    const [layerOrder, setLayerOrder] = useState<string[]>([]);

    const drawBackground = useCallback(() => {
        const bgLayer = layerManagerRef.current?.getLayer('background');
        if (!bgLayer) return;
        const { ctx, canvas } = bgLayer;

        canvasUtils.drawRect(ctx, 0, 0, canvas.width, canvas.height, { fillStyle: 'var(--color-base-100)' });
        for (let i = 0; i < canvas.width; i += 40) {
            canvasUtils.drawLine(ctx, i, 0, i, canvas.height, { strokeStyle: 'var(--color-grid)' });
        }
        for (let i = 0; i < canvas.height; i += 40) {
            canvasUtils.drawLine(ctx, 0, i, canvas.width, i, { strokeStyle: 'var(--color-grid)' });
        }
    }, []);
    
    const drawUI = useCallback((mousePos: { x: number, y: number }) => {
         const uiLayer = layerManagerRef.current?.getLayer('ui');
         if (!uiLayer) return;
         const { ctx, canvas } = uiLayer;
         uiLayer.clear();
         canvasUtils.drawText(ctx, `Mouse: ${mousePos.x}, ${mousePos.y}`, 10, 20, { font: '14px monospace', fillStyle: 'var(--color-text-primary)'});
         canvasUtils.drawText(ctx, `Layer Order: ${layerOrder.join(', ')}`, 10, 40, { font: '14px monospace', fillStyle: 'var(--color-text-primary)'});
    }, [layerOrder]);
    
    // Setup layers and animation loop
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        
        const manager = new LayerManager(container);
        layerManagerRef.current = manager;
        
        manager.createLayer('background');
        manager.createLayer('objects');
        manager.createLayer('ui');
        setLayerOrder(manager.getLayerNames());

        movingShapesRef.current = Array.from({ length: 10 }, () => ({
            x: Math.random() * manager.width,
            y: Math.random() * manager.height,
            vx: (Math.random() - 0.5) * 100, // pixels per second
            vy: (Math.random() - 0.5) * 100,
            radius: Math.random() * 15 + 5
        }));
        
        drawBackground();
        drawUI({ x: 0, y: 0 });

        const objectsLayer = manager.getLayer('objects');
        if (objectsLayer) {
            animationLoopRef.current = createAnimationLoop((dt) => {
                const dtSeconds = dt / 1000;
                objectsLayer.clear();
                movingShapesRef.current.forEach(shape => {
                    shape.x += shape.vx * dtSeconds;
                    shape.y += shape.vy * dtSeconds;
                    if (shape.x < 0 || shape.x > manager.width) shape.vx *= -1;
                    if (shape.y < 0 || shape.y > manager.height) shape.vy *= -1;
                    
                    canvasUtils.drawCircle(objectsLayer.ctx, shape.x, shape.y, shape.radius, { fillStyle: 'var(--color-accent-primary)' });
                });
            });
            animationLoopRef.current.start();
        }

        return () => {
            animationLoopRef.current?.stop();
        };
    }, [drawBackground, drawUI]);
    
    // Handle mouse move for UI layer
    useEventListener('mousemove', (e) => {
        const container = containerRef.current;
        const event = e as MouseEvent;
        if (container) {
            const rect = container.getBoundingClientRect();
            drawUI({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        }
    }, containerRef);
    
    const handleToggleVisibility = () => {
        const objectsLayer = layerManagerRef.current?.getLayer('objects');
        if (objectsLayer) {
            const newVisibility = !objectsLayer.isVisible;
            objectsLayer.setVisibility(newVisibility);
            setIsObjectsVisible(newVisibility);
        }
    };
    
    const handleOpacityChange = (opacity: number) => {
        const uiLayer = layerManagerRef.current?.getLayer('ui');
        if(uiLayer) {
            uiLayer.setOpacity(opacity);
            setUiOpacity(opacity);
        }
    };

    const handleReorder = () => {
        const currentOrder = [...layerOrder];
        // simple swap of last two elements
        [currentOrder[1], currentOrder[2]] = [currentOrder[2], currentOrder[1]];
        layerManagerRef.current?.reorderLayers(currentOrder);
        setLayerOrder(currentOrder);
    };

    return (
        <div className="space-y-8">
            <FuturisticCard title="Layer Manager Canvas" description="Multiple canvases are stacked. The background is static, objects animate continuously, and the UI updates only on mouse move.">
                <div ref={containerRef} className="relative w-full h-[400px] bg-base-200 rounded-lg overflow-hidden">
                    {/* Canvases will be injected here by the LayerManager */}
                </div>
            </FuturisticCard>
             <FuturisticCard title="Layer Controls">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                         <h4 className="text-text-primary font-semibold">'objects' Layer</h4>
                         <button onClick={handleToggleVisibility} className="bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue font-bold py-2 px-4 rounded transition">
                            {isObjectsVisible ? 'Hide Objects Layer' : 'Show Objects Layer'}
                         </button>
                    </div>
                     <div className="space-y-4">
                        <h4 className="text-text-primary font-semibold">'ui' Layer</h4>
                        <ToolbarSlider label="Opacity" value={uiOpacity} onChange={handleOpacityChange} min={0} max={1} step={0.01} />
                    </div>
                </div>
                <div className="pt-4 border-t border-neon-teal/20">
                     <h4 className="text-text-primary font-semibold">Global</h4>
                     <button onClick={handleReorder} className="bg-neon-pink/20 hover:bg-neon-pink/30 text-neon-pink border border-neon-pink font-bold py-2 px-4 rounded transition">
                        Swap 'objects' and 'ui' Layers
                     </button>
                </div>
             </FuturisticCard>
        </div>
    );
};

export default CanvasLayerManagerExample;
