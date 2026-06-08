import React, { useState, useEffect } from 'react';
import { XIcon } from './ui/icons';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const SavePresetModal: React.FC<SavePresetModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(''); // Reset name when modal opens
    }
  }, [isOpen]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div 
        style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-border-color)' }}
        className="relative w-full max-w-md rounded-lg shadow-xl border"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Save Preset</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
              <XIcon />
            </button>
          </div>
          <div>
            <label htmlFor="preset-name-modal" className="block text-sm font-medium text-gray-300 mb-2">
              Preset Name
            </label>
            <input
              id="preset-name-modal"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Company Blue"
              style={{ backgroundColor: 'var(--theme-input-bg)', borderColor: 'var(--theme-border-color)', color: 'var(--theme-text)' }}
              className="w-full border text-white rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        </div>
        <div 
            style={{ backgroundColor: 'rgba(0,0,0,0.2)'}}
            className="px-6 py-4 flex justify-end items-center gap-3 rounded-b-lg"
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent rounded-md hover:bg-gray-600/50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            style={{ backgroundColor: 'var(--theme-accent)'}}
            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Preset
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavePresetModal;