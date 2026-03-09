import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import type { BackgroundParams } from './HomepageToolbar';

interface HomepageBackgroundProps {
  params: BackgroundParams;
  onBackgroundClick?: () => void;
}

const HomepageBackground: React.FC<HomepageBackgroundProps> = ({ params, onBackgroundClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const buildingsRef = useRef<THREE.InstancedMesh | null>(null);
  const floorRef = useRef<THREE.Mesh | null>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const { mode } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.0008);

    const camera = new THREE.PerspectiveCamera(
      params.fov,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.set(0, params.cameraHeight / 10, 500);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Floor Grid ---
    const floorSize = 10000;
    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: 0x08f7fe,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    floorRef.current = floor;

    // --- Buildings (Instanced) ---
    const buildingCount = Math.max(10, params.buildingCount);
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    // Pivot to bottom
    boxGeometry.translate(0, 0.5, 0);
    
    const buildingMaterial = new THREE.MeshBasicMaterial({
      color: 0x08f7fe,
      transparent: true,
      opacity: 0.05,
    });
    
    const instancedBuildings = new THREE.InstancedMesh(boxGeometry, buildingMaterial, buildingCount);
    const matrix = new THREE.Matrix4();
    const buildingStates: { x: number; z: number; scale: number; h: number }[] = [];

    for (let i = 0; i < buildingCount; i++) {
      const x = (Math.random() - 0.5) * 4000;
      const z = -Math.random() * 5000;
      const scale = 20 + Math.random() * 80;
      const h = 50 + Math.random() * 400;
      
      matrix.makeScale(scale, h, scale);
      matrix.setPosition(x, 0, z);
      instancedBuildings.setMatrixAt(i, matrix);
      buildingStates.push({ x, z, scale, h });
    }
    
    scene.add(instancedBuildings);
    buildingsRef.current = instancedBuildings;

    // --- Add edges to instanced mesh (simulated) ---
    // Note: True instanced edges are complex, so we just use the main building mesh
    // with a slightly higher opacity for edges if we were using custom shaders.
    // For now, simple basic material is fast and clean.

    // --- Retro Sun ---
    const sunGeom = new THREE.SphereGeometry(600, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xF50057,
      transparent: true,
      opacity: 0.4,
    });
    const sun = new THREE.Mesh(sunGeom, sunMat);
    sun.position.set(0, 200, -4500);
    scene.add(sun);

    // --- Handlers ---
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // --- Animation Loop ---
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const speed = params.speed * 50;

      // Scroll floor
      if (floor) {
        floor.position.z = (time * speed) % (floorSize / 20);
      }

      // Update Buildings
      if (instancedBuildings) {
        for (let i = 0; i < buildingCount; i++) {
          instancedBuildings.getMatrixAt(i, matrix);
          const pos = new THREE.Vector3();
          pos.setFromMatrixPosition(matrix);
          
          pos.z += speed * delta * 5;
          
          if (pos.z > 1000) {
            pos.z = -4000 - Math.random() * 1000;
          }
          
          matrix.setPosition(pos.x, pos.y, pos.z);
          instancedBuildings.setMatrixAt(i, matrix);
        }
        instancedBuildings.instanceMatrix.needsUpdate = true;
      }

      // Camera Tilt
      if (camera) {
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -mouseRef.current.x * 0.1, 0.05);
        camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, mouseRef.current.y * 0.05, 0.05);
        camera.fov = THREE.MathUtils.lerp(camera.fov, params.fov, 0.1);
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [params, mode]);

  return (
    <div 
      ref={containerRef} 
      className="homepage-background" 
      onClick={onBackgroundClick} 
      role="button" 
      aria-label="Show UI"
    />
  );
};

export default HomepageBackground;