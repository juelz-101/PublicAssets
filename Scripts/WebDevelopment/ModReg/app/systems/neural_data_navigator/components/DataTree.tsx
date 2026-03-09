import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, File, Box, Database, Layers } from 'lucide-react';
import { GraphNode } from '../utils/DataProcessor';

interface DataTreeProps {
  data: any;
  onNodeSelect?: (nodeId: string, isRoot?: boolean) => void;
  selectedNodeId?: string | null;
}

interface DataTreeNodeProps {
  name: string;
  value: any;
  onNodeSelect?: (nodeId: string, isRoot?: boolean) => void;
  path?: string;
  level?: number;
  selectedNodeId?: string | null;
}

const DataTreeNode: React.FC<DataTreeNodeProps> = ({ 
  name, 
  value, 
  onNodeSelect, 
  path = '', 
  level = 0,
  selectedNodeId
}) => {
  const [isOpen, setIsOpen] = useState(level < 1); // Only expand root by default
  
  const isObject = typeof value === 'object' && value !== null;
  const isArray = Array.isArray(value);
  const currentPath = path ? `${path}.${name}` : name;
  const isSelected = selectedNodeId === currentPath;
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNodeSelect) {
      // If clicking the icon/label of an object/array, treat as selecting root
      onNodeSelect(currentPath, isObject);
    }
    if (isObject && !isOpen) {
        setIsOpen(true);
    }
  };

  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-1.5 px-2 cursor-pointer transition-all duration-200 rounded-md group ${
          isSelected 
            ? 'bg-neon-teal/20 border-l-2 border-neon-teal shadow-[0_0_10px_rgba(8,247,254,0.1)]' 
            : 'hover:bg-white/5 border-l-2 border-transparent'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {isObject ? (
          <button 
            onClick={handleToggle} 
            className={`mr-1 transition-colors ${isSelected ? 'text-neon-teal' : 'text-gray-500 group-hover:text-neon-teal'}`}
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-4 mr-1" />
        )}

        <span className={`mr-2 transition-colors ${isSelected ? 'text-neon-teal' : 'text-gray-500 group-hover:text-neon-teal'}`}>
          {isObject ? (
            isArray ? <Layers size={14} /> : <Folder size={14} />
          ) : (
            <File size={14} />
          )}
        </span>

        <span className={`text-xs font-mono truncate transition-colors ${
          isSelected ? 'text-white font-bold' : isObject ? 'text-gray-300 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-200'
        }`}>
          {name}
        </span>
        
        {!isObject && (
          <span className="ml-2 text-[10px] text-gray-600 truncate max-w-[80px] opacity-0 group-hover:opacity-100 transition-opacity">
            {String(value)}
          </span>
        )}
      </div>

      {isObject && isOpen && (
        <div className="border-l border-white/5 ml-[15px]">
          {Object.entries(value).map(([key, val]) => (
            <DataTreeNode
              key={key}
              name={key}
              value={val}
              onNodeSelect={onNodeSelect}
              path={currentPath}
              level={level + 1}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DataTree: React.FC<{ 
  data: any; 
  onNodeSelect?: (nodeId: string, isRoot?: boolean) => void;
  selectedNodeId?: string | null;
}> = ({ data, onNodeSelect, selectedNodeId }) => {
  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-2 pb-20">
      <div className="mb-4 px-2">
        <h3 className="text-xs font-bold text-neon-teal uppercase tracking-widest flex items-center gap-2 mb-2">
          <Database size={14} />
          Data Structure
        </h3>
        <div className="h-px w-full bg-gradient-to-r from-neon-teal/50 to-transparent" />
      </div>
      <DataTreeNode 
        name="root" 
        value={data} 
        onNodeSelect={onNodeSelect} 
        selectedNodeId={selectedNodeId}
      />
    </div>
  );
};

export default DataTree;
