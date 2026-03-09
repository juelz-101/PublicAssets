


import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as vec from '../../modules/graphics/vector-utils';
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

const OutputBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-2 bg-base-100/50 rounded-md border border-base-300/50">
        <p className="text-text-secondary text-sm">{title}</p>
        <p className="text-text-primary font-mono text-base break-all">{children}</p>
    </div>
);

const VectorUtilsExample: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [v1, setV1] = useState<vec.Vector>({ x: 150, y: 250 });
    const [v2, setV2] = useState<vec.Vector>({ x: 350, y: 100 });
    const [draggingPoint, setDraggingPoint] = useState<'v1' | 'v2' | null>(null);

    // State for new functions
    const [angle, setAngle] = useState(0);
    const [lerpAmt, setLerpAmt] = useState(0.5);
    const [limitMag, setLimitMag] = useState(150);

    const calculations = useMemo(() => {
        const diff = vec.subtract(v2, v1);
        const limitedV1 = vec.limit(v1, limitMag);
        return {
            sum: vec.add(v1, v2),
            diff: diff,
            dist: vec.distance(v1, v2).toFixed(2),
            rotatedV2: vec.rotate(v2, angle * (Math.PI / 180)),
            lerpResult: vec.lerp(v1, v2, lerpAmt),
            v1_mag: vec.magnitude(v1),
            limitedV1: limitedV1,
            limitedV1_mag: vec.magnitude(limitedV1),
        }
    }, [v1, v2, angle, lerpAmt, limitMag]);

    useEffect(() => {
        const canvasEl = canvasRef.current;
        const ctx = canvas.getContext(canvasEl);
        if (!ctx || !canvasEl) return;
        
        const resizeCanvas = () => {
            const parent = canvasEl.parentElement;
            if (parent) {
                canvasEl.width = parent.clientWidth;
                canvasEl.height = 400; // Fixed height
            }
        };

        resizeCanvas();
        canvas.clearCanvas(ctx);
        
        // --- Drawing Logic ---
        const origin = { x: canvasEl.width / 2, y: canvasEl.height / 2 };
        ctx.translate(origin.x, origin.y);

        // Grid
        for (let i = -origin.x; i < origin.x; i += 50) canvas.drawLine(ctx, i, -origin.y, i, origin.y, { strokeStyle: 'var(--color-grid)' });
        for (let i = -origin.y; i < origin.y; i += 50) canvas.drawLine(ctx, -origin.x, i, origin.x, i, { strokeStyle: 'var(--color-grid)' });
        canvas.drawLine(ctx, -origin.x, 0, origin.x, 0, { strokeStyle: 'var(--color-grid)' });
        canvas.drawLine(ctx, 0, -origin.y, 0, origin.y, { strokeStyle: 'var(--color-grid)' });
        
        // Translate vectors to be relative to center
        const t_v1 = vec.subtract(v1, origin);
        const t_v2 = vec.subtract(v2, origin);

        // Limit visualization
        const limited_t_v1 = vec.limit(t_v1, limitMag);
        canvas.drawCircle(ctx, 0, 0, limitMag, { strokeStyle: 'rgba(255, 255, 255, 0.2)', lineWidth: 1 });
        canvas.drawVector(ctx, t_v1, 'rgba(255, 255, 255, 0.3)', 'v1 (orig)');
        canvas.drawVector(ctx, limited_t_v1, 'var(--color-accent-primary)', 'v1 (lim)');

        // Rotate visualization
        const rotated_t_v2 = vec.rotate(t_v2, angle * Math.PI / 180);
        canvas.drawVector(ctx, t_v2, 'rgba(245, 0, 87, 0.3)', 'v2 (orig)');
        canvas.drawVector(ctx, rotated_t_v2, 'var(--color-accent-secondary)', 'v2 (rot)');

        // Lerp visualization
        const lerp_result = vec.lerp(t_v1, t_v2, lerpAmt);
        canvas.drawLine(ctx, t_v1.x, t_v1.y, t_v2.x, t_v2.y, { strokeStyle: 'rgba(255, 255, 255, 0.2)', lineWidth: 1 });
        canvas.drawCircle(ctx, lerp_result.x, lerp_result.y, 6, { fillStyle: 'var(--color-accent-tertiary)' });

        // Reset transform
        ctx.resetTransform();
        
    }, [v1, v2, calculations, angle, lerpAmt, limitMag]);

    useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;

        const getMousePos = (e: MouseEvent) => {
            const rect = canvasEl.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };

        const handleMouseDown = (e: MouseEvent) => {
            const pos = getMousePos(e);
            if (vec.distance(pos, v1) < 15) setDraggingPoint('v1');
            else if (vec.distance(pos, v2) < 15) setDraggingPoint('v2');
        };
        const handleMouseMove = (e: MouseEvent) => {
            const pos = getMousePos(e);
            const cursorShouldBeGrab = vec.distance(pos, v1) < 15 || vec.distance(pos, v2) < 15;
            if (!draggingPoint) {
                canvasEl.style.cursor = cursorShouldBeGrab ? 'grab' : 'default';
            } else {
                 canvasEl.style.cursor = 'grabbing';
                if (draggingPoint === 'v1') setV1(pos);
                else setV2(pos);
            }
        };
        const handleMouseUp = () => setDraggingPoint(null);
        
        canvasEl.addEventListener('mousedown', handleMouseDown);
        canvasEl.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            canvasEl.removeEventListener('mousedown', handleMouseDown);
            canvasEl.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }

    }, [v1, v2, draggingPoint]);

    return (
        <div className="space-y-8">
            <FuturisticCard title="Interactive Canvas" description="Drag v1 (teal) and v2 (pink) to see vector operations update. The origin is the center of the canvas.">
                <canvas ref={canvasRef} className="bg-base-100/50 rounded-lg w-full" />
            </FuturisticCard>

            <FuturisticCard title="Controls">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                         <label className="block text-text-secondary mb-1">Rotate v2: {angle}°</label>
                         <input type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-neon-pink" />
                    </div>
                     <div>
                         <label className="block text-text-secondary mb-1">Lerp (v1 to v2): {lerpAmt.toFixed(2)}</label>
                         <input type="range" min="0" max="1" step="0.01" value={lerpAmt} onChange={(e) => setLerpAmt(Number(e.target.value))} className="w-full accent-neon-green" />
                    </div>
                    <div>
                         <label className="block text-text-secondary mb-1">Limit v1 Mag: {limitMag}</label>
                         <input type="range" min="50" max="300" value={limitMag} onChange={(e) => setLimitMag(Number(e.target.value))} className="w-full accent-neon-teal" />
                    </div>
                </div>
            </FuturisticCard>

            <FuturisticCard title="Live Calculations">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <OutputBox title="v1 mag / limited mag">{`${calculations.v1_mag.toFixed(1)} / ${calculations.limitedV1_mag.toFixed(1)}`}</OutputBox>
                    <OutputBox title="distance(v1, v2)">{calculations.dist}</OutputBox>
                    <OutputBox title="lerp(v1, v2, amt)">{`{ x: ${calculations.lerpResult.x.toFixed(0)}, y: ${calculations.lerpResult.y.toFixed(0)} }`}</OutputBox>
                    <OutputBox title="rotate(v2, angle)">{`{ x: ${calculations.rotatedV2.x.toFixed(0)}, y: ${calculations.rotatedV2.y.toFixed(0)} }`}</OutputBox>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default VectorUtilsExample;
