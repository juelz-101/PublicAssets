
import React, { useState, useMemo } from 'react';
import { createCube, createIcosahedron } from '../../modules/graphics-3d/geometry-primitives';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg space-y-4">
            {children}
        </div>
    </div>
);

const OutputBox: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-2 p-4 bg-base-100/50 rounded-md border border-base-300/50 max-h-80 overflow-auto">
        <p className="text-text-secondary">{title}</p>
        <pre className="text-text-primary font-mono whitespace-pre-wrap text-sm">{children}</pre>
    </div>
);

const GeometryPrimitivesExample: React.FC = () => {
    const [cubeSize, setCubeSize] = useState(100);
    const [icosahedronRadius, setIcosahedronRadius] = useState(50);

    const cubeGeometry = useMemo(() => createCube(cubeSize), [cubeSize]);
    const icosahedronGeometry = useMemo(() => createIcosahedron(icosahedronRadius), [icosahedronRadius]);
    
    return (
        <div className="space-y-8">
            <FuturisticCard title="createCube(size)" description="Generates vertex and edge data for a cube. This data can be passed to the Scene Manager to render a 3D object.">
                 <div>
                    <label className="block text-text-secondary mb-1">Size: {cubeSize}</label>
                    <input type="range" min="10" max="200" value={cubeSize} onChange={e => setCubeSize(Number(e.target.value))} className="w-full accent-neon-teal" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <OutputBox title="Vertices">
                        {`[\n${cubeGeometry.vertices.map(v => `  { x: ${v.x}, y: ${v.y}, z: ${v.z} }`).join(',\n')}\n]`}
                    </OutputBox>
                     <OutputBox title="Edges">
                        {`[\n${cubeGeometry.edges.map(e => `  [${e[0]}, ${e[1]}]`).join(',\n')}\n]`}
                    </OutputBox>
                </div>
            </FuturisticCard>
             <FuturisticCard title="createIcosahedron(radius)" description="Generates vertex and edge data for an icosahedron (a 20-sided shape).">
                 <div>
                    <label className="block text-text-secondary mb-1">Radius: {icosahedronRadius}</label>
                    <input type="range" min="10" max="150" value={icosahedronRadius} onChange={e => setIcosahedronRadius(Number(e.target.value))} className="w-full accent-neon-pink" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <OutputBox title="Vertices">
                        {`[\n${icosahedronGeometry.vertices.map(v => `  { x: ${v.x.toFixed(1)}, y: ${v.y.toFixed(1)}, z: ${v.z.toFixed(1)} }`).join(',\n')}\n]`}
                    </OutputBox>
                     <OutputBox title="Edges (first 10 of 30)">
                        {`[\n${icosahedronGeometry.edges.slice(0, 10).map(e => `  [${e[0]}, ${e[1]}]`).join(',\n')}\n  ...\n]`}
                    </OutputBox>
                </div>
            </FuturisticCard>
        </div>
    );
};
export default GeometryPrimitivesExample;
