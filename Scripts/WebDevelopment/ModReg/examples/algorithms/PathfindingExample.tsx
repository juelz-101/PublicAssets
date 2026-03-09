
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { findPathAStar, PathfindingStep, GridPoint } from '../../modules/algorithms/pathfinding';
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

const FuturisticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button {...props} className={`bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal border border-neon-teal font-bold py-2 px-4 rounded transition duration-300 disabled:bg-base-300 disabled:text-text-secondary disabled:border-base-300 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

const GRID_SIZE = 25;
const CELL_SIZE = 20;

type DragState = { type: 'start' | 'end' | 'wall' | 'erase'; lastPos: GridPoint };

const PathfindingExample: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationTimeoutId = useRef<number | null>(null);
    const [grid, setGrid] = useState<number[][]>(() => Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0)));
    const [startPos, setStartPos] = useState<GridPoint>({ x: 3, y: 12 });
    const [endPos, setEndPos] = useState<GridPoint>({ x: 21, y: 12 });
    const [algorithmStep, setAlgorithmStep] = useState<PathfindingStep | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [dragState, setDragState] = useState<DragState | null>(null);

    const resetAlgorithm = useCallback(() => {
        if (animationTimeoutId.current) {
            clearTimeout(animationTimeoutId.current);
            animationTimeoutId.current = null;
        }
        setAlgorithmStep(null);
        setIsRunning(false);
    }, []);
    
    const resetBoard = useCallback(() => {
        resetAlgorithm();
        setGrid(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0)));
        setStartPos({ x: 3, y: 12 });
        setEndPos({ x: 21, y: 12 });
    }, [resetAlgorithm]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid and walls
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (grid[y][x] === 1) {
                    canvasUtils.drawRect(ctx, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE, { fillStyle: 'var(--color-base-300)' });
                }
                canvasUtils.drawRect(ctx, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE, { strokeStyle: 'var(--color-grid)' });
            }
        }
        
        // Draw open and closed sets
        if (algorithmStep) {
            algorithmStep.closedSet.forEach(p => canvasUtils.drawRect(ctx, p.x * CELL_SIZE, p.y * CELL_SIZE, CELL_SIZE, CELL_SIZE, { fillStyle: 'color-mix(in srgb, var(--color-accent-secondary), transparent 80%)' }));
            algorithmStep.openSet.forEach(p => canvasUtils.drawRect(ctx, p.x * CELL_SIZE, p.y * CELL_SIZE, CELL_SIZE, CELL_SIZE, { fillStyle: 'color-mix(in srgb, var(--color-accent-tertiary), transparent 70%)' }));
            algorithmStep.path.forEach(p => canvasUtils.drawRect(ctx, p.x * CELL_SIZE, p.y * CELL_SIZE, CELL_SIZE, CELL_SIZE, { fillStyle: 'var(--color-accent-primary)' }));
        }

        // Draw start and end points
        const drawNode = (pos: GridPoint, color: string, text: string) => {
             canvasUtils.drawRect(ctx, pos.x * CELL_SIZE, pos.y * CELL_SIZE, CELL_SIZE, CELL_SIZE, { fillStyle: color });
             canvasUtils.drawText(ctx, text, (pos.x + 0.5) * CELL_SIZE, (pos.y + 0.5) * CELL_SIZE, { font: 'bold 14px monospace', fillStyle: 'var(--color-text-primary)', textAlign: 'center', textBaseline: 'middle'});
        };
        drawNode(startPos, 'var(--color-accent-tertiary)', 'S');
        drawNode(endPos, 'var(--color-accent-secondary)', 'E');

    }, [grid, startPos, endPos, algorithmStep]);

    useEffect(() => {
        draw();
    }, [draw]);
    
    const handleFindPath = () => {
        if(isRunning) return;
        resetAlgorithm();
        setIsRunning(true);
        const generator = findPathAStar(grid, startPos, endPos);
        
        const animate = () => {
            const { value, done } = generator.next();
            if (done || !value) {
                setIsRunning(false);
                if (value) setAlgorithmStep(value);
                return;
            }
            setAlgorithmStep(value);
            animationTimeoutId.current = window.setTimeout(animate, 20);
        };
        animate();
    };

    const handleCanvasInteraction = useCallback((e: React.MouseEvent<HTMLCanvasElement>, type: 'down' | 'move' | 'up' | 'leave') => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
        const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
        const currentPos = { x, y };
        
        const isStart = x === startPos.x && y === startPos.y;
        const isEnd = x === endPos.x && y === endPos.y;

        if (type === 'down') {
            resetAlgorithm();
            if (isStart) setDragState({ type: 'start', lastPos: currentPos });
            else if (isEnd) setDragState({ type: 'end', lastPos: currentPos });
            else {
                const newGrid = grid.map(row => [...row]);
                const isWall = newGrid[y][x] === 1;
                newGrid[y][x] = isWall ? 0 : 1;
                setGrid(newGrid);
                setDragState({ type: isWall ? 'erase' : 'wall', lastPos: currentPos });
            }
        }

        if (type === 'move' && dragState) {
             if (dragState.lastPos.x === x && dragState.lastPos.y === y) return; // No change

            const newGrid = grid.map(row => [...row]);
            if (dragState.type === 'start' && !isEnd) {
                if (newGrid[y]?.[x] === 0) setStartPos(currentPos);
            } else if (dragState.type === 'end' && !isStart) {
                if (newGrid[y]?.[x] === 0) setEndPos(currentPos);
            } else if (dragState.type === 'wall' && !isStart && !isEnd) {
                if (newGrid[y]?.[x] === 0) {
                    newGrid[y][x] = 1;
                    setGrid(newGrid);
                }
            } else if (dragState.type === 'erase' && !isStart && !isEnd) {
                 if (newGrid[y]?.[x] === 1) {
                    newGrid[y][x] = 0;
                    setGrid(newGrid);
                }
            }
             setDragState({ ...dragState, lastPos: currentPos });
        }

        if (type === 'up' || type === 'leave') {
            setDragState(null);
        }

    }, [dragState, grid, startPos, endPos, resetAlgorithm]);


    return (
        <div className="space-y-8">
            <FuturisticCard title="A* Pathfinding Visualizer" description="Click and drag to draw walls. Drag 'S' (start) and 'E' (end) nodes. Then find the shortest path!">
                <canvas
                    ref={canvasRef}
                    width={GRID_SIZE * CELL_SIZE}
                    height={GRID_SIZE * CELL_SIZE}
                    className="bg-base-100/50 rounded-lg w-full max-w-[500px] aspect-square mx-auto cursor-pointer"
                    onMouseDown={(e) => handleCanvasInteraction(e, 'down')}
                    onMouseMove={(e) => handleCanvasInteraction(e, 'move')}
                    onMouseUp={(e) => handleCanvasInteraction(e, 'up')}
                    onMouseLeave={(e) => handleCanvasInteraction(e, 'leave')}
                />
            </FuturisticCard>
            <FuturisticCard title="Controls">
                <div className="flex flex-wrap gap-4">
                    <FuturisticButton onClick={handleFindPath} disabled={isRunning}>{isRunning ? 'Searching...' : 'Find Path'}</FuturisticButton>
                    <FuturisticButton onClick={resetAlgorithm} disabled={isRunning}>Clear Path</FuturisticButton>
                    <FuturisticButton onClick={() => setGrid(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0)))} disabled={isRunning}>Clear Walls</FuturisticButton>
                    <FuturisticButton onClick={resetBoard} disabled={isRunning}>Reset Board</FuturisticButton>
                </div>
            </FuturisticCard>
        </div>
    );
};

export default PathfindingExample;
