import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Billboard } from '@react-three/drei';
import { GraphData, GraphNode } from '../utils/DataProcessor';

interface Graph3DProps {
  data: GraphData;
  viewMode: 'graph' | 'tree' | 'cosmos';
  interactionMode: 'camera' | 'drag';
  selectedNodeId: string | null;
  config: {
    nodeSize: number;
    linkOpacity: number;
    particleCount: number;
    bloomIntensity: number;
  };
  backendData: {
    repulsion: number;
    attraction: number;
    gravity: number;
    damping: number;
  };
  onNodeClick?: (node: GraphNode) => void;
  onNodeDrag?: (nodeId: string, position: THREE.Vector3) => void;
}

const Graph3D: React.FC<Graph3DProps> = ({
  data,
  viewMode,
  interactionMode,
  selectedNodeId,
  config,
  backendData,
  onNodeClick,
  onNodeDrag
}) => {
  const { nodes, links } = data;
  const { camera, gl } = useThree();
  
  // State
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  
  // Refs
  const nodeMeshesRef = useRef<(THREE.Mesh | null)[]>([]);
  const linesGeometryRef = useRef<THREE.BufferGeometry>(null);
  const dragPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Helper: Get descendants for highlighting
  const getDescendants = (rootId: string): Set<string> => {
    const descendants = new Set<string>();
    const stack = [rootId];
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      descendants.add(currentId);
      const node = nodes.find(n => n.id === currentId);
      if (node && node.children) {
        node.children.forEach(childId => stack.push(childId));
      }
    }
    return descendants;
  };

  const highlightedNodes = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    return getDescendants(selectedNodeId);
  }, [selectedNodeId, nodes]);

  // Initialize positions
  useMemo(() => {
    nodes.forEach(node => {
      if (node.x === undefined) {
        node.x = (Math.random() - 0.5) * 20;
        node.y = (Math.random() - 0.5) * 20;
        node.z = (Math.random() - 0.5) * 20;
        node.vx = 0;
        node.vy = 0;
        node.vz = 0;
      }
    });
  }, [nodes]);

  // Handle Dragging
  const handlePointerDown = (e: any, node: GraphNode) => {
    e.stopPropagation();
    if (interactionMode === 'drag') {
      setDraggingNodeId(node.id);
      // Set drag plane to face camera at node's position
      const normal = camera.position.clone().sub(new THREE.Vector3(node.x, node.y, node.z)).normalize();
      dragPlaneRef.current.setFromNormalAndCoplanarPoint(normal, new THREE.Vector3(node.x, node.y, node.z));
      
      // Disable orbit controls via parent? 
      // We'll handle this by checking interactionMode in the parent or OrbitControls
    } else {
      onNodeClick?.(node);
    }
  };

  const handlePointerUp = () => {
    setDraggingNodeId(null);
  };

  const handlePointerMove = (e: any) => {
    if (draggingNodeId && interactionMode === 'drag') {
      // Raycast to drag plane
      raycaster.current.setFromCamera(e.pointer, camera);
      const target = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(dragPlaneRef.current, target);
      
      if (target) {
        const node = nodes.find(n => n.id === draggingNodeId);
        if (node) {
          node.x = target.x;
          node.y = target.y;
          node.z = target.z;
          node.vx = 0;
          node.vy = 0;
          node.vz = 0;
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    // window.addEventListener('pointermove', handlePointerMove); // Handled by Canvas event
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      // window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [draggingNodeId, interactionMode]);


  // Force simulation loop
  useFrame((state) => {
    if (draggingNodeId) {
        // Drag logic handled in pointer move, but we need to ensure physics doesn't override it immediately
        // We set velocity to 0 in drag handler
    }

    if (viewMode === 'graph') {
      // 1. Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n1.x! - n2.x!;
          const dy = n1.y! - n2.y!;
          const dz = n1.z! - n2.z!;
          const distSq = dx * dx + dy * dy + dz * dz + 0.1;
          const force = backendData.repulsion / distSq;
          
          const fx = dx * force;
          const fy = dy * force;
          const fz = dz * force;

          if (n1.id !== draggingNodeId) {
            n1.vx! += fx * 0.001;
            n1.vy! += fy * 0.001;
            n1.vz! += fz * 0.001;
          }
          if (n2.id !== draggingNodeId) {
            n2.vx! -= fx * 0.001;
            n2.vy! -= fy * 0.001;
            n2.vz! -= fz * 0.001;
          }
        }
      }

      // 2. Attraction
      links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        const source = nodes.find(n => n.id === sourceId);
        const target = nodes.find(n => n.id === targetId);

        if (source && target) {
          const dx = target.x! - source.x!;
          const dy = target.y! - source.y!;
          const dz = target.z! - source.z!;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          const force = (dist - 2) * backendData.attraction;

          const fx = dx * force;
          const fy = dy * force;
          const fz = dz * force;

          if (source.id !== draggingNodeId) {
            source.vx! += fx;
            source.vy! += fy;
            source.vz! += fz;
          }
          if (target.id !== draggingNodeId) {
            target.vx! -= fx;
            target.vy! -= fy;
            target.vz! -= fz;
          }
        }
      });

      // 3. Center Gravity & Update Positions
      nodes.forEach((node, i) => {
        if (node.id === draggingNodeId) return;

        // Pull to center
        node.vx! -= node.x! * backendData.gravity;
        node.vy! -= node.y! * backendData.gravity;
        node.vz! -= node.z! * backendData.gravity;

        // Damping
        node.vx! *= backendData.damping;
        node.vy! *= backendData.damping;
        node.vz! *= backendData.damping;

        // Apply
        node.x! += node.vx!;
        node.y! += node.vy!;
        node.z! += node.vz!;
      });
    } else if (viewMode === 'tree') {
       // Simple Tree / Cone Layout
       // Root at top (0, 10, 0), children spread out below
       const levelHeight = 5;
       nodes.forEach(node => {
          if (node.id === draggingNodeId) return;

          const targetY = 10 - (node.depth * levelHeight);
          
          // Move towards target Y
          node.y! += (targetY - node.y!) * 0.1;
          
          // Spread X/Z randomly or based on ID hash to keep stable
          // We rely on the initial random spread for X/Z but dampen movement
          node.vx! *= 0.5;
          node.vz! *= 0.5;
          node.x! += node.vx!;
          node.z! += node.vz!;
       });
    } else if (viewMode === 'cosmos') {
       // Spherical layout based on depth
       nodes.forEach(node => {
          if (node.id === draggingNodeId) return;

          const radius = node.depth * 5 + 2;
          // Target position on sphere?
          // Just push nodes to their depth radius
          const currentDist = Math.sqrt(node.x!*node.x! + node.y!*node.y! + node.z!*node.z!);
          if (currentDist === 0) return;
          
          const scale = radius / currentDist;
          const targetX = node.x! * scale;
          const targetY = node.y! * scale;
          const targetZ = node.z! * scale;

          node.x! += (targetX - node.x!) * 0.05;
          node.y! += (targetY - node.y!) * 0.05;
          node.z! += (targetZ - node.z!) * 0.05;
       });
    }

    // Update Meshes
    nodes.forEach((node, i) => {
        if (nodeMeshesRef.current[i]) {
            nodeMeshesRef.current[i]!.position.set(node.x!, node.y!, node.z!);
            
            // Update scale based on config and selection
            let scale = (node.size || 1) * config.nodeSize;
            
            const isSelected = selectedNodeId === node.id;
            const isHighlighted = highlightedNodes.has(node.id);
            const isHovered = hoveredNodeId === node.id;

            if (isSelected || isHovered) scale *= 1.5;
            else if (selectedNodeId && !isHighlighted) scale *= 0.5; // Dim others

            nodeMeshesRef.current[i]!.scale.set(scale, scale, scale);
            
            // Update Color
            const material = nodeMeshesRef.current[i]!.material as THREE.MeshStandardMaterial;
            if (material) {
                if (isSelected || isHovered) {
                    material.color.set('#ffffff');
                    material.emissive.set('#ffffff');
                    material.emissiveIntensity = 1;
                } else if (isHighlighted) {
                    material.color.set(node.color);
                    material.emissive.set(node.color);
                    material.emissiveIntensity = 0.8;
                } else {
                    material.color.set(node.color);
                    material.emissive.set(node.color);
                    material.emissiveIntensity = selectedNodeId ? 0.1 : 0.5; // Dim if something else selected
                }
            }
        }
    });

    // 4. Update Lines
    if (linesGeometryRef.current) {
      const positions = linesGeometryRef.current.attributes.position.array as Float32Array;
      // We can also update colors if we use vertex colors, but for now just positions
      let idx = 0;
      links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        const source = nodes.find(n => n.id === sourceId);
        const target = nodes.find(n => n.id === targetId);

        if (source && target) {
          positions[idx++] = source.x!;
          positions[idx++] = source.y!;
          positions[idx++] = source.z!;
          positions[idx++] = target.x!;
          positions[idx++] = target.y!;
          positions[idx++] = target.z!;
        }
      });
      linesGeometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  // Prepare line geometry
  const linePositions = useMemo(() => {
    const positions = new Float32Array(links.length * 6); // 2 points * 3 coords
    return positions;
  }, [links]);

  return (
    <group onPointerMove={handlePointerMove}>
      {/* Lines */}
      <lineSegments>
        <bufferGeometry ref={linesGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
            color="#08f7fe" 
            transparent 
            opacity={config.linkOpacity} 
            depthWrite={false} 
            blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <group key={node.id}>
          <mesh
            ref={(el) => { nodeMeshesRef.current[i] = el; }}
            position={[node.x!, node.y!, node.z!]}
            onPointerDown={(e) => handlePointerDown(e, node)}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredNodeId(node.id); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredNodeId(null); document.body.style.cursor = 'auto'; }}
          >
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial 
                color={node.color} 
                emissive={node.color} 
                emissiveIntensity={0.5}
                roughness={0.2}
                metalness={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default Graph3D;
