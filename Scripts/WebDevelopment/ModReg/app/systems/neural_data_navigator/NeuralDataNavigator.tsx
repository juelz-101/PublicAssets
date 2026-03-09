import React, { useState, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Menu, X } from 'lucide-react';
import Graph3D from './components/Graph3D';
import ConfigPanel from './components/ConfigPanel';
import DataTree from './components/DataTree';
import ToolBar from './components/ToolBar';
import CameraControls from './components/CameraControls';
import { processData, GraphNode, GraphData } from './utils/DataProcessor';

interface NeuralDataNavigatorProps {
  data: any;
  title?: string;
}

const NeuralDataNavigator: React.FC<NeuralDataNavigatorProps> = ({ data, title = "Neural Data Navigator" }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'tree' | 'cosmos'>('graph');
  const [interactionMode, setInteractionMode] = useState<'camera' | 'drag'>('camera');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const controlsRef = useRef<any>(null);

  // Configuration State
  const [config, setConfig] = useState({
    nodeSize: 0.5,
    linkOpacity: 0.2,
    particleCount: 5000,
    bloomIntensity: 1.5
  });

  const [backendData, setBackendData] = useState({
    repulsion: 100,
    attraction: 0.01,
    gravity: 0.01,
    damping: 0.9
  });

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleBackendDataChange = (key: string, value: any) => {
    setBackendData(prev => ({ ...prev, [key]: value }));
  };

  // Process data into graph structure
  const graphData: GraphData = useMemo(() => processData(data), [data]);

  const handleNodeSelect = (node: GraphNode) => {
    setSelectedNode(node);
    if (!isSidebarOpen) setIsSidebarOpen(true);
  };

  const handleTreeSelect = (nodeId: string, isRoot?: boolean) => {
    const node = graphData.nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      // Optional: Fly camera to node?
    }
  };

  // Camera Control Handlers
  const handleFitView = () => {
    controlsRef.current?.reset();
  };

  const handleZoomIn = () => {
    // OrbitControls uses spherical coordinates. 
    // We can manually move camera or use dolly.
    // dollyIn scales the zoom.
    if (controlsRef.current) {
        // controlsRef.current.dollyIn(1.1); // This might not trigger update immediately without calling update
        // Simpler to just move object? No, OrbitControls handles it.
        // Let's try standard zoom prop or just let user scroll.
        // Actually, accessing the object directly:
        const object = controlsRef.current.object;
        if (object) {
            object.position.multiplyScalar(0.9);
            controlsRef.current.update();
        }
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
        const object = controlsRef.current.object;
        if (object) {
            object.position.multiplyScalar(1.1);
            controlsRef.current.update();
        }
    }
  };

  const handleRotate = (direction: 'left' | 'right' | 'up' | 'down') => {
      // Rotate camera around target
      // This is complex with OrbitControls as it manages azimuth/polar angles.
      // We can adjust azimuthAngle and polarAngle
      if (controlsRef.current) {
          const step = 0.1;
          if (direction === 'left') controlsRef.current.setAzimuthalAngle(controlsRef.current.getAzimuthalAngle() + step);
          if (direction === 'right') controlsRef.current.setAzimuthalAngle(controlsRef.current.getAzimuthalAngle() - step);
          if (direction === 'up') controlsRef.current.setPolarAngle(controlsRef.current.getPolarAngle() - step);
          if (direction === 'down') controlsRef.current.setPolarAngle(controlsRef.current.getPolarAngle() + step);
          controlsRef.current.update();
      }
  };

  return (
    <div className="w-full h-[800px] relative bg-black overflow-hidden rounded-xl border border-neon-teal/30 shadow-2xl flex">
      
      {/* Sidebar */}
      <div 
        className={`absolute top-0 left-0 h-full bg-black/90 backdrop-blur-xl border-r border-neon-teal/30 transition-all duration-300 z-20 flex flex-col ${
          isSidebarOpen ? 'w-80 translate-x-0' : 'w-80 -translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-neon-teal/20 flex justify-between items-center">
            <h3 className="text-neon-teal font-bold tracking-wider">DATA EXPLORER</h3>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
            </button>
        </div>
        <div className="flex-1 overflow-hidden relative">
            <DataTree 
                data={data} 
                onNodeSelect={handleTreeSelect} 
                selectedNodeId={selectedNode?.id}
            />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative h-full">
        {/* 3D Canvas */}
        <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
            <color attach="background" args={['#050505']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stars radius={100} depth={50} count={config.particleCount} factor={4} saturation={0} fade speed={1} />
            
            <Graph3D 
            data={graphData} 
            viewMode={viewMode}
            interactionMode={interactionMode}
            selectedNodeId={selectedNode?.id || null}
            config={config}
            backendData={backendData}
            onNodeClick={handleNodeSelect}
            />
            
            <OrbitControls 
                ref={controlsRef}
                enableDamping 
                dampingFactor={0.1} 
                rotateSpeed={0.5} 
                enabled={interactionMode === 'camera'}
            />
        </Canvas>

        {/* UI Overlay */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between">
            
            {/* Header & Top Bar */}
            <div className="flex justify-between items-start pointer-events-auto">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 bg-black/50 border border-neon-teal/30 rounded-md text-neon-teal hover:bg-neon-teal/10 transition-colors"
                >
                    <Menu size={20} />
                </button>
                
                <div>
                    <h2 className="text-2xl font-bold text-neon-teal tracking-wider" style={{ textShadow: '0 0 10px rgba(8, 247, 254, 0.5)' }}>
                    {title}
                    </h2>
                    <div className="text-xs font-mono text-neon-teal/60 mt-1">
                    NODES: {graphData.nodes.length} | LINKS: {graphData.links.length}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                 {/* Tool Selector */}
                 <ToolBar interactionMode={interactionMode} setInteractionMode={setInteractionMode} />

                {/* View Switcher */}
                <div className="flex space-x-2 bg-black/50 backdrop-blur-md p-1 rounded-lg border border-neon-teal/20">
                    {['graph', 'tree', 'cosmos'].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode as any)}
                        className={`px-3 py-1 text-xs font-bold uppercase rounded transition-colors ${
                        viewMode === mode 
                            ? 'bg-neon-teal text-black' 
                            : 'text-neon-teal/50 hover:text-neon-teal hover:bg-neon-teal/10'
                        }`}
                    >
                        {mode}
                    </button>
                    ))}
                </div>
            </div>
            </div>

            {/* Config Panel (Absolute Positioned inside component) */}
            <div className="pointer-events-auto absolute top-24 right-6">
                <ConfigPanel 
                    config={config} 
                    onConfigChange={handleConfigChange}
                    backendData={backendData}
                    onBackendDataChange={handleBackendDataChange}
                />
            </div>

            {/* Footer / Details Panel */}
            <div className="flex justify-between items-end pointer-events-auto w-full">
            
            {/* Selected Node Details */}
            <div className={`w-80 bg-black/80 backdrop-blur-xl border border-neon-pink/30 rounded-lg p-4 transition-all duration-300 transform ${selectedNode ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {selectedNode && (
                <>
                    <div className="flex justify-between items-center mb-2 border-b border-neon-pink/20 pb-2">
                    <h3 className="text-lg font-bold text-neon-pink truncate">{selectedNode.name}</h3>
                    <span className="text-[10px] bg-neon-pink/20 text-neon-pink px-2 py-0.5 rounded uppercase">{selectedNode.type}</span>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <span className="text-gray-500">ID:</span>
                        <span className="col-span-2 text-gray-300 font-mono truncate" title={selectedNode.id}>{selectedNode.id}</span>
                        
                        <span className="text-gray-500">Depth:</span>
                        <span className="col-span-2 text-gray-300 font-mono">{selectedNode.depth}</span>
                        
                        <span className="text-gray-500">Value:</span>
                        <span className="col-span-2 text-neon-green font-mono break-all">
                        {typeof selectedNode.val === 'object' ? (Array.isArray(selectedNode.val) ? `Array[${selectedNode.val.length}]` : 'Object') : String(selectedNode.val)}
                        </span>

                        <span className="text-gray-500">Children:</span>
                        <span className="col-span-2 text-gray-300 font-mono">{selectedNode.children?.length || 0}</span>
                    </div>
                    </div>
                </>
                )}
            </div>

            {/* Bottom Right Controls */}
            <div className="flex flex-col items-end gap-2">
                <CameraControls 
                    onFitView={handleFitView}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onRotate={handleRotate}
                />
                
                <div className="text-right text-[10px] text-gray-500 font-mono bg-black/50 p-2 rounded border border-white/5">
                    <p>MODE: {interactionMode.toUpperCase()}</p>
                    <p>{interactionMode === 'camera' ? 'LMB: ROTATE | RMB: PAN' : 'LMB: DRAG NODE'}</p>
                    <p>SCROLL: ZOOM | CLICK: SELECT</p>
                </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralDataNavigator;
