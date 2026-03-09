
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SceneManager } from '../../modules/graphics-3d/scene-manager';
import { createCube, createIcosahedron } from '../../modules/graphics-3d/geometry-primitives';
import { createOrbitController } from '../../modules/graphics-3d/camera-controller';
import { createAnimationLoop, AnimationLoop } from '../../modules/graphics/animation-loop';
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


const SceneManagerExample: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const animationLoopRef = useRef<AnimationLoop | null>(null);
    const orbitControllerRef = useRef<ReturnType<typeof createOrbitController> | null>(null);

    const setupScene = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const manager = new SceneManager(canvas);
        sceneManagerRef.current = manager;

        const cube = createCube(50);
        manager.addObject({
            geometry: cube,
            position: { x: -60, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
        });

        const icosahedron = createIcosahedron(35);
        manager.addObject({
            geometry: icosahedron,
            position: { x: 60, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
        });

        orbitControllerRef.current = createOrbitController(manager.camera, canvas);

        animationLoopRef.current = createAnimationLoop(() => {
            if (!sceneManagerRef.current) return;
            const scene = sceneManagerRef.current;
            const cubeObject = scene.objects[0];
            const icosahedronObject = scene.objects[1];

            if (cubeObject) {
                cubeObject.rotation.x += 0.005;
                cubeObject.rotation.y += 0.005;
            }
            if (icosahedronObject) {
                icosahedronObject.rotation.x -= 0.007;
                icosahedronObject.rotation.y -= 0.007;
            }

            scene.render();
        });
        animationLoopRef.current.start();
    }, []);
    
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if(canvas && canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = 500;
            if(animationLoopRef.current) animationLoopRef.current.stop();
            if(orbitControllerRef.current) orbitControllerRef.current.dispose();
            setupScene();
        }
    }, [setupScene]);
    
    useEventListener('resize', resizeCanvas);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = 500;
            setupScene();
        }
        return () => {
            animationLoopRef.current?.stop();
            orbitControllerRef.current?.dispose();
        };
    }, [setupScene]);

    return (
        <div className="space-y-8">
            <FuturisticCard title="3D Scene Manager" description="A simple wireframe 3D renderer using the Canvas 2D API. Drag to rotate the camera, and scroll to zoom.">
                <canvas ref={canvasRef} className="bg-base-100/50 rounded-lg w-full cursor-grab active:cursor-grabbing" />
            </FuturisticCard>
        </div>
    );
};
export default SceneManagerExample;
