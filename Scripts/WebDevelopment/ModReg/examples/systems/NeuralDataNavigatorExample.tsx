import React from 'react';
import NeuralDataNavigator from '../../app/systems/neural_data_navigator/NeuralDataNavigator';

const mockData = {
  "project": {
    "name": "Neural Data Navigator",
    "version": "1.0.0",
    "description": "A 3D visualization system for complex data structures.",
    "dependencies": {
      "react": "^18.2.0",
      "three": "^0.150.0",
      "@react-three/fiber": "^8.13.0",
      "@react-three/drei": "^9.70.0"
    },
    "src": {
      "components": {
        "Graph3D.tsx": { "size": 1024, "type": "component" },
        "NeuralDataNavigator.tsx": { "size": 2048, "type": "system" },
        "UI": {
          "Button.tsx": { "size": 512 },
          "Panel.tsx": { "size": 768 }
        }
      },
      "utils": {
        "DataProcessor.ts": { "size": 1536, "functions": ["processData", "traverse"] },
        "Math.ts": { "size": 256 }
      },
      "styles": {
        "global.css": { "lines": 100 },
        "theme.ts": { "colors": ["#08f7fe", "#fe53bb"] }
      }
    },
    "config": {
      "env": "development",
      "port": 3000,
      "features": {
        "3d_view": true,
        "vr_mode": false,
        "analytics": {
          "enabled": true,
          "provider": "google"
        }
      }
    },
    "users": [
      { "id": 1, "name": "Alice", "role": "admin" },
      { "id": 2, "name": "Bob", "role": "developer" },
      { "id": 3, "name": "Charlie", "role": "viewer" }
    ]
  }
};

const NeuralDataNavigatorExample: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-6xl">
        <NeuralDataNavigator data={mockData} title="Project Structure Visualization" />
      </div>
      <p className="text-gray-500 mt-4 text-sm">
        Interact with the graph: Drag to rotate, Scroll to zoom, Right-click to pan. Click nodes to inspect details.
      </p>
    </div>
  );
};

export default NeuralDataNavigatorExample;
