import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Square, Download, FileCode, FileText, Database, Brain } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  files: Array<{ path: string; label: string; type: 'code' | 'docs' | 'ai' | 'data' }>;
  onDownload: (selectedPaths: string[]) => void;
  isDownloading: boolean;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  title,
  files,
  onDownload,
  isDownloading
}) => {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  // Initialize with all files selected when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedPaths(new Set(files.map(f => f.path)));
    }
  }, [isOpen, files]);

  if (!isOpen) return null;

  const toggleFile = (path: string) => {
    const newSelected = new Set(selectedPaths);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedPaths(newSelected);
  };

  const toggleAll = () => {
    if (selectedPaths.size === files.length) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(files.map(f => f.path)));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'code': return <FileCode size={16} className="text-neon-teal" />;
      case 'docs': return <FileText size={16} className="text-text-secondary" />;
      case 'ai': return <Brain size={16} className="text-neon-pink" />;
      case 'data': return <Database size={16} className="text-neon-green" />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-base-200 border border-neon-teal/30 rounded-xl shadow-glow-md w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-neon-teal/20 flex justify-between items-center bg-base-300/50">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Download size={20} className="text-neon-teal" />
            {title}
          </h3>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-text-secondary">Select files to include in the download:</p>
            <button 
              onClick={toggleAll}
              className="text-xs font-mono text-neon-teal hover:underline flex items-center gap-1"
            >
              {selectedPaths.size === files.length ? (
                <><CheckSquare size={12} /> Deselect All</>
              ) : (
                <><Square size={12} /> Select All</>
              )}
            </button>
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <div 
                key={file.path}
                onClick={() => toggleFile(file.path)}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedPaths.has(file.path)
                    ? 'bg-neon-teal/10 border-neon-teal/40'
                    : 'bg-base-100 border-white/5 hover:border-white/10'
                }`}
              >
                <div className={`mr-3 ${selectedPaths.has(file.path) ? 'text-neon-teal' : 'text-text-secondary'}`}>
                  {selectedPaths.has(file.path) ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <div className="mr-3">
                  {getIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${selectedPaths.has(file.path) ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {file.label}
                  </p>
                  <p className="text-xs text-text-secondary/50 truncate font-mono">
                    {file.path}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neon-teal/20 bg-base-300/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onDownload(Array.from(selectedPaths))}
            disabled={selectedPaths.size === 0 || isDownloading}
            className="px-6 py-2 bg-neon-teal/10 hover:bg-neon-teal/20 text-neon-teal border border-neon-teal/50 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-glow-sm hover:shadow-glow-md"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-neon-teal border-t-transparent rounded-full" />
                Processing...
              </>
            ) : (
              <>
                <Download size={16} />
                {selectedPaths.size > 1 ? 'Download Zip' : 'Download File'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
