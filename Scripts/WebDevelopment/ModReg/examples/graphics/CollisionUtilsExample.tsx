import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as collision from '../../modules/graphics/collision-utils';
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

const OutputBox: React.FC<{ title: string, children: React.ReactNode, isColliding?: boolean }> = ({ title, children, isColliding = false }) => (
    <div className={`p-2 bg-base-100/50 rounded-md border transition-colors ${isColliding ? 'border-neon-red' : 'border-base-300/50'}`}>
        <p className="text-text-secondary text-sm">{title}</p>
        <p className={`text-text-primary font-mono text-base ${isColliding ? 'text-neon-red' : ''}`}>{children}</p>
    </div>
);

const CollisionUtilsExample: React.FC = () => {
    // --- State for Rect vs Circle ---
    const rectCircleCanvasRef = useRef<HTMLCanvasElement>(null);
    const [rect, setRect] = useState<collision.Rect>({ x: 50, y: 50, width: 100, height: 80 });
    const [circle, setCircle] = useState<collision.Circle>({ x: 250, y: 150, radius: 50 });
    const [draggingShape, setDraggingShape] = useState<{ shape: 'rect' | 'circle'; offsetX: number; offsetY: number } | null>(null);

    // --- State for Polygon vs Polygon ---
    const polyCanvasRef = useRef<HTMLCanvasElement>(null);
    const [poly1, setPoly1] = useState<collision.Point[]>([{ x: 100, y: 100 }, { x: 200, y: 120 }, { x: 180, y: 200 }, { x: 80, y: 180 }]);
    const [poly2, setPoly2] = useState<collision.Point[]>([{ x: 300, y: 150 }, { x: 350, y: 250 }, { x: 250, y: 250 }]);
    const [draggingPoly, setDraggingPoly] = useState<{ shape: 'poly1' | 'poly2'; lastPos: collision.Point } | null>(null);

    const rectCircleIsColliding = useMemo(() => collision.rectToCircle(rect, circle), [rect, circle]);
    const polysAreColliding = useMemo(() => collision.polygonToPolygon(poly1, poly2), [poly1, poly2]);

    // --- Effect for Rect vs Circle Canvas ---
    useEffect(() => {
        const canvasEl = rectCircleCanvasRef.current;
        const ctx = canvas.getContext(canvasEl);
        if (!ctx || !canvasEl) return;

        const resizeCanvas = () => {
            if(canvasEl.parentElement) {
                 canvasEl.width = canvasEl.parentElement.clientWidth;
                 canvasEl.height = 300;
            }
        };
        resizeCanvas();
        
        canvas.clearCanvas(ctx);
        const rectColor = rectCircleIsColliding ? '#ff073a' : '#08f7fe';
        const circleColor = rectCircleIsColliding ? '#ff073a' : '#F50057';
        canvas.drawRect(ctx, rect.x, rect.y, rect.width, rect.height, { fillStyle: `color-mix(in srgb, ${rectColor}, transparent 80%)`, strokeStyle: rectColor, lineWidth: 2 });
        canvas.drawCircle(ctx, circle.x, circle.y, circle.radius, { fillStyle: `color-mix(in srgb, ${circleColor}, transparent 80%)`, strokeStyle: circleColor, lineWidth: 2 });
        
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [rect, circle, rectCircleIsColliding]);
    
     // --- Effect for Polygon vs Polygon Canvas ---
    useEffect(() => {
        const canvasEl = polyCanvasRef.current;
        const ctx = canvas.getContext(canvasEl);
        if (!ctx || !canvasEl) return;

        const resizeCanvas = () => {
            if(canvasEl.parentElement) {
                 canvasEl.width = canvasEl.parentElement.clientWidth;
                 canvasEl.height = 300;
            }
        };
        resizeCanvas();
        
        canvas.clearCanvas(ctx);
        const poly1Color = polysAreColliding ? '#ff073a' : '#00ff9f';
        const poly2Color = polysAreColliding ? '#ff073a' : '#F50057';
        canvas.drawPolygon(ctx, poly1, { fillStyle: `color-mix(in srgb, ${poly1Color}, transparent 80%)`, strokeStyle: poly1Color, lineWidth: 2 });
        canvas.drawPolygon(ctx, poly2, { fillStyle: `color-mix(in srgb, ${poly2Color}, transparent 80%)`, strokeStyle: poly2Color, lineWidth: 2 });
        
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);

    }, [poly1, poly2, polysAreColliding]);


    // --- Dragging logic for Rect and Circle ---
    useEffect(() => {
        const canvasEl = rectCircleCanvasRef.current;
        if (!canvasEl) return;
        
        const getMousePos = (e: MouseEvent): collision.Point => ({ x: e.offsetX, y: e.offsetY });

        const handleMouseDown = (e: MouseEvent) => {
            const pos = getMousePos(e);
            if (collision.pointInRect(pos, rect)) setDraggingShape({ shape: 'rect', offsetX: pos.x - rect.x, offsetY: pos.y - rect.y });
            else if (collision.pointInCircle(pos, circle)) setDraggingShape({ shape: 'circle', offsetX: pos.x - circle.x, offsetY: pos.y - circle.y });
        };
        const handleMouseMove = (e: MouseEvent) => {
            const pos = getMousePos(e);
            if (collision.pointInRect(pos, rect) || collision.pointInCircle(pos, circle)) canvasEl.style.cursor = 'grab'; else canvasEl.style.cursor = 'default';
            if (draggingShape) {
                canvasEl.style.cursor = 'grabbing';
                if (draggingShape.shape === 'rect') setRect(r => ({ ...r, x: pos.x - draggingShape.offsetX, y: pos.y - draggingShape.offsetY }));
                else setCircle(c => ({ ...c, x: pos.x - draggingShape.offsetX, y: pos.y - draggingShape.offsetY }));
            }
        };
        const handleMouseUp = () => setDraggingShape(null);

        canvasEl.addEventListener('mousedown', handleMouseDown);
        canvasEl.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            canvasEl.removeEventListener('mousedown', handleMouseDown);
            canvasEl.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [rect, circle, draggingShape]);

    // --- Dragging logic for Polygons ---
     useEffect(() => {
        const canvasEl = polyCanvasRef.current;
        if (!canvasEl) return;
        
        const getMousePos = (e: MouseEvent): collision.Point => ({ x: e.offsetX, y: e.offsetY });
        
        const handleMouseDown = (e: MouseEvent) => {
            const pos = getMousePos(e);
            if (collision.pointInPolygon(pos, poly1)) setDraggingPoly({ shape: 'poly1', lastPos: pos });
            else if (collision.pointInPolygon(pos, poly2)) setDraggingPoly({ shape: 'poly2', lastPos: pos });
        };
        const handleMouseMove = (e: MouseEvent) => {
            const pos = getMousePos(e);
            if (collision.pointInPolygon(pos, poly1) || collision.pointInPolygon(pos, poly2)) canvasEl.style.cursor = 'grab'; else canvasEl.style.cursor = 'default';
            if (draggingPoly) {
                canvasEl.style.cursor = 'grabbing';
                const dx = pos.x - draggingPoly.lastPos.x;
                const dy = pos.y - draggingPoly.lastPos.y;
                const movePoly = (p: collision.Point[]) => p.map(vertex => ({ x: vertex.x + dx, y: vertex.y + dy }));

                if (draggingPoly.shape === 'poly1') setPoly1(movePoly);
                else setPoly2(movePoly);
                
                setDraggingPoly({ ...draggingPoly, lastPos: pos });
            }
        };
        const handleMouseUp = () => setDraggingPoly(null);

        canvasEl.addEventListener('mousedown', handleMouseDown);
        canvasEl.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            canvasEl.removeEventListener('mousedown', handleMouseDown);
            canvasEl.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [poly1, poly2, draggingPoly]);


    return (
        <div className="space-y-8">
            <FuturisticCard title="Interactive Collision: Rect vs Circle" description="Drag the shapes on the canvas. They will highlight when they collide.">
                <canvas ref={rectCircleCanvasRef} className="bg-base-100/50 rounded-lg w-full" />
                 <OutputBox title="rectToCircle(rect, circle)" isColliding={rectCircleIsColliding}>
                    {rectCircleIsColliding.toString()}
                </OutputBox>
            </FuturisticCard>

            <FuturisticCard title="Interactive Collision: Polygon vs Polygon" description="Drag the convex polygons. They will highlight when they collide based on the Separating Axis Theorem.">
                <canvas ref={polyCanvasRef} className="bg-base-100/50 rounded-lg w-full" />
                <OutputBox title="polygonToPolygon(poly1, poly2)" isColliding={polysAreColliding}>
                    {polysAreColliding.toString()}
                </OutputBox>
            </FuturisticCard>
        </div>
    );
};

export default CollisionUtilsExample;
